import { z } from 'zod'
import prisma from '../lib/prisma.js'
import { logActivity } from '../utils/activityLog.js'
import { recalcPermohonanCache, extractAccNos } from '../utils/budgetCache.js'
import { getStepConfig, computeActions, STATUS_DISPLAY, buildWorkflowView } from '../lib/workflowRules.js'

// ─── Authorization policy: boleh lihat billing ───────────────────────────────
// Owner | Finance (semua) | Admin | CEO | HOD jabatan sendiri sahaja
export function canViewBilling(user, billing) {
  const role      = user.role?.slug
  const isOwner   = billing.applicantId === user.id
  const isAdmin   = role === 'admin'
  const isFinance = ['finance', 'finance_hod'].includes(role)
  const isCeo     = role === 'ceo'
  const isOwnHod  = role === 'hod' && billing.departmentId === user.departmentId
  return isOwner || isAdmin || isFinance || isCeo || isOwnHod
}

// ─── Status constants ─────────────────────────────────────────────────────────
const AKTIF_STATUSES = [
  'DRAFT', 'RETURNED',
  'PENDING_HOD', 'PENDING_CEO',
  'PENDING_FINANCE_CHECK', 'PENDING_FINANCE_VERIFY', 'PENDING_FINANCE_APPROVAL',
  'PENDING_CEO_FINAL', 'APPROVED', 'PARTIAL_PAID',
]
const SEJARAH_STATUSES = ['PAID', 'REJECTED', 'CLOSED']

// ─── Scope: permohonan aktif (dalam proses) ───────────────────────────────────
export function buildAktifScope(user, statusFilter) {
  const role = user.role?.slug
  const sf   = statusFilter && AKTIF_STATUSES.includes(statusFilter) ? statusFilter : null
  const statusClause = sf ? sf : { in: AKTIF_STATUSES }

  if (role === 'admin') return { isDeleted: false, status: statusClause }

  const own = { applicantId: user.id, status: statusClause }

  if (role === 'hod') {
    if (sf === 'PENDING_HOD') return { isDeleted: false, departmentId: user.departmentId, status: 'PENDING_HOD' }
    return { isDeleted: false, ...own }
  }

  if (role === 'ceo') {
    const ceoSt = ['PENDING_CEO', 'PENDING_CEO_FINAL']
    if (sf && !ceoSt.includes(sf)) return { isDeleted: false, ...own }
    return { isDeleted: false, OR: [own, { status: sf ?? { in: ceoSt } }] }
  }

  if (role === 'finance') {
    const finSt = ['PENDING_FINANCE_CHECK', 'PENDING_FINANCE_VERIFY', 'PENDING_FINANCE_APPROVAL', 'APPROVED', 'PARTIAL_PAID']
    if (sf && !finSt.includes(sf)) return { isDeleted: false, ...own }
    return { isDeleted: false, OR: [own, { status: sf ?? { in: finSt } }] }
  }

  if (role === 'finance_hod') {
    const finHodSt = ['PENDING_FINANCE_CHECK', 'PENDING_FINANCE_VERIFY', 'PENDING_FINANCE_APPROVAL', 'PENDING_CEO_FINAL']
    if (!sf) {
      return {
        isDeleted: false,
        OR: [own, { departmentId: user.departmentId, status: 'PENDING_HOD' }, { status: { in: finHodSt } }],
      }
    }
    if (sf === 'PENDING_HOD') return { isDeleted: false, OR: [own, { departmentId: user.departmentId, status: 'PENDING_HOD' }] }
    if (finHodSt.includes(sf)) return { isDeleted: false, OR: [own, { status: sf }] }
    return { isDeleted: false, ...own }
  }

  // staff & lain-lain: own sahaja
  return { isDeleted: false, ...own }
}

// ─── Scope: sejarah (siap — PAID, REJECTED, CLOSED) ──────────────────────────
export function buildSejarahScope(user, statusFilter) {
  const role = user.role?.slug
  const sf   = statusFilter && SEJARAH_STATUSES.includes(statusFilter) ? statusFilter : null
  const statusClause = sf ? sf : { in: SEJARAH_STATUSES }

  // Finance, Finance_HOD, CEO, Admin → semua rekod
  if (['admin', 'ceo', 'finance', 'finance_hod'].includes(role)) {
    return { isDeleted: false, status: statusClause }
  }

  // HOD & Staff → own sahaja
  return { isDeleted: false, applicantId: user.id, status: statusClause }
}

// ─── Helper: scope permohonan mengikut role (legacy — dikekalkan untuk /api/billing/) ──
const FINANCE_SCOPE    = ['PENDING_FINANCE_CHECK', 'PENDING_FINANCE_VERIFY', 'PENDING_FINANCE_APPROVAL', 'APPROVED', 'PARTIAL_PAID']
const FIN_HOD_APPROVAL = ['PENDING_FINANCE_APPROVAL', 'PENDING_CEO_FINAL']

export function buildBillingScope(user, statusFilter) {
  const role = user.role?.slug

  if (role === 'admin') {
    const w = { isDeleted: false }
    if (statusFilter) w.status = statusFilter
    return w
  }

  // Own branch — pemohon sentiasa nampak permohonan sendiri
  const ownBranch = statusFilter
    ? { applicantId: user.id, status: statusFilter }
    : { applicantId: user.id }

  // Tanpa filter (tab Semua): own + role-based scope
  if (!statusFilter) {
    if (role === 'hod') {
      return { isDeleted: false, OR: [ownBranch, { departmentId: user.departmentId, status: { in: ['PENDING_HOD'] } }] }
    }
    if (role === 'ceo') {
      return { isDeleted: false, OR: [ownBranch, { status: { in: ['PENDING_CEO', 'PENDING_CEO_FINAL'] } }] }
    }
    if (role === 'finance') {
      return { isDeleted: false, OR: [ownBranch, { status: { in: FINANCE_SCOPE } }] }
    }
    if (role === 'finance_hod') {
      return {
        isDeleted: false,
        OR: [
          ownBranch,
          { departmentId: user.departmentId, status: 'PENDING_HOD' },
          { status: { in: FIN_HOD_APPROVAL } },
        ],
      }
    }
    // staff: own sahaja
    return { isDeleted: false, applicantId: user.id }
  }

  // Ada status filter — semak sama ada dalam role scope atau tidak
  const inHodScope        = ['PENDING_HOD'].includes(statusFilter)
  const inCeoScope        = ['PENDING_CEO', 'PENDING_CEO_FINAL'].includes(statusFilter)
  const inFinanceScope    = FINANCE_SCOPE.includes(statusFilter)
  const inFinHodScope     = ['PENDING_HOD', ...FIN_HOD_APPROVAL].includes(statusFilter)

  if (role === 'hod') {
    if (!inHodScope) return { isDeleted: false, ...ownBranch }  // luar scope: own sahaja
    return { isDeleted: false, OR: [ownBranch, { departmentId: user.departmentId, status: statusFilter }] }
  }

  if (role === 'ceo') {
    if (!inCeoScope) return { isDeleted: false, ...ownBranch }
    return { isDeleted: false, OR: [ownBranch, { status: statusFilter }] }
  }

  if (role === 'finance') {
    if (!inFinanceScope) return { isDeleted: false, ...ownBranch }
    return { isDeleted: false, OR: [ownBranch, { status: statusFilter }] }
  }

  if (role === 'finance_hod') {
    if (!inFinHodScope) return { isDeleted: false, ...ownBranch }
    if (statusFilter === 'PENDING_HOD') {
      return { isDeleted: false, OR: [ownBranch, { departmentId: user.departmentId, status: 'PENDING_HOD' }] }
    }
    return { isDeleted: false, OR: [ownBranch, { status: statusFilter }] }
  }

  // staff: own + filter
  return { isDeleted: false, ...ownBranch }
}

// ─── Helper: jana refNo ───────────────────────────────────────────────────────
async function generateRefNo() {
  const year  = new Date().getFullYear()
  const prefix = `INV/${year}/`
  const last  = await prisma.billing.findFirst({
    where:   { refNo: { startsWith: prefix } },
    orderBy: { id: 'desc' },
    select:  { refNo: true },
  })
  const seq = last ? parseInt(last.refNo.split('/').pop()) + 1 : 1
  return `${prefix}${String(seq).padStart(4, '0')}`
}

// ─── Schemas ─────────────────────────────────────────────────────────────────
const itemSchema = z.object({
  accNo:       z.string().max(20).optional().nullable(),
  description: z.string().min(1).max(500),
  invoiceNo:   z.string().max(100).optional().nullable(),
  qty:         z.number().positive(),
  unitCost:    z.number().nonnegative(),
})

const billingSchema = z.object({
  vendorId:    z.number().int().positive(),
  projectNo:   z.string().max(100).optional().nullable(),
  description: z.string().min(1),
  items:       z.array(itemSchema).min(1),
})

// ─── List Aktif ───────────────────────────────────────────────────────────────
const LIST_INCLUDE = {
  applicant:  { select: { id: true, name: true, staffNo: true } },
  department: { select: { id: true, name: true } },
  vendor:     { select: { id: true, name: true } },
  _count:     { select: { attachments: { where: { isDeleted: false } }, items: { where: { isDeleted: false } } } },
}

export async function listAktif(req, res, next) {
  try {
    const { status, page = 1, limit = 20 } = req.query
    const pg  = Math.max(1, parseInt(page))
    const lim = Math.min(100, parseInt(limit) || 20)
    const where = buildAktifScope(req.user, status || null)
    const [total, data] = await Promise.all([
      prisma.billing.count({ where }),
      prisma.billing.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (pg - 1) * lim, take: lim, include: LIST_INCLUDE }),
    ])
    res.json({ data, total, page: pg, totalPages: Math.ceil(total / lim) })
  } catch (err) { next(err) }
}

// ─── List Sejarah ─────────────────────────────────────────────────────────────
export async function listSejarah(req, res, next) {
  try {
    const { status, page = 1, limit = 20 } = req.query
    const pg  = Math.max(1, parseInt(page))
    const lim = Math.min(100, parseInt(limit) || 20)
    const where = buildSejarahScope(req.user, status || null)
    const [total, data] = await Promise.all([
      prisma.billing.count({ where }),
      prisma.billing.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (pg - 1) * lim, take: lim, include: LIST_INCLUDE }),
    ])
    res.json({ data, total, page: pg, totalPages: Math.ceil(total / lim) })
  } catch (err) { next(err) }
}

// ─── List (legacy) ────────────────────────────────────────────────────────────
export async function listBillings(req, res, next) {
  try {
    const { status, page = 1, limit = 20 } = req.query
    const pg  = Math.max(1, parseInt(page))
    const lim = Math.min(100, parseInt(limit) || 20)

    const where = buildBillingScope(req.user, status || null)

    const [total, data] = await Promise.all([
      prisma.billing.count({ where }),
      prisma.billing.findMany({
        where,
        orderBy:  { createdAt: 'desc' },
        skip:     (pg - 1) * lim,
        take:     lim,
        include: {
          applicant:  { select: { id: true, name: true, staffNo: true } },
          department: { select: { id: true, name: true } },
          vendor:     { select: { id: true, name: true } },
          _count:     { select: { attachments: { where: { isDeleted: false } }, items: { where: { isDeleted: false } } } },
        },
      }),
    ])

    res.json({ data, total, page: pg, totalPages: Math.ceil(total / lim) })
  } catch (err) { next(err) }
}

// ─── Get one ─────────────────────────────────────────────────────────────────
export async function getBilling(req, res, next) {
  try {
    const id   = parseInt(req.params.id)
    const data = await prisma.billing.findFirst({
      where:   { id, isDeleted: false },
      include: {
        applicant:   { select: { id: true, name: true, staffNo: true, position: { select: { name: true } } } },
        department:  { select: { id: true, name: true } },
        vendor:      true,
        items:       { where: { isDeleted: false }, include: { account: { select: { name: true } } }, orderBy: { id: 'asc' } },
        approvals:   { include: { actor: { select: { id: true, name: true, position: { select: { name: true } } } } }, orderBy: { actionedAt: 'asc' } },
        attachments: { where: { isDeleted: false }, include: { uploadedBy: { select: { id: true, name: true } } }, orderBy: { uploadedAt: 'desc' } },
        paidBy:      { select: { id: true, name: true } },
        payments:    { include: { paidBy: { select: { id: true, name: true } } }, orderBy: { phase: 'asc' } },
      },
    })
    if (!data) return res.status(404).json({ message: 'Permohonan tidak dijumpai' })

    if (!canViewBilling(req.user, data))
      return res.status(403).json({ message: 'Tiada kebenaran' })

    // Pisahkan approvalHistory dari data utama
    const { approvals: approvalHistory, payments, ...billing } = data

    // Bina workflow view — kontrak API untuk frontend
    const workflow = buildWorkflowView(billing)

    res.json({ billing, workflow, payments, approvalHistory })
  } catch (err) { next(err) }
}

// ─── Create (DRAFT) ──────────────────────────────────────────────────────────
export async function createBilling(req, res, next) {
  try {
    const body    = billingSchema.parse(req.body)
    const refNo   = await generateRefNo()
    const total   = body.items.reduce((s, i) => s + i.qty * i.unitCost, 0)

    const data = await prisma.billing.create({
      data: {
        refNo,
        workflowType: 'STAFF',
        applicantId:  req.user.id,
        departmentId: req.user.departmentId,
        vendorId:     body.vendorId,
        projectNo:    body.projectNo ?? null,
        description:  body.description,
        totalAmount:  total,
        status:       'DRAFT',
        currentStep:  null,
        items: {
          create: body.items.map(i => ({
            accNo:       i.accNo ?? null,
            description: i.description,
            invoiceNo:   i.invoiceNo ?? null,
            qty:         i.qty,
            unitCost:    i.unitCost,
            amount:      i.qty * i.unitCost,
          })),
        },
      },
      include: { items: true },
    })

    await logActivity({ userId: req.user.id, userName: req.user.name, action: 'CREATE', module: 'billing', targetId: data.id, detail: refNo, req })
    res.status(201).json({ data })
  } catch (err) { next(err) }
}

// ─── Update DRAFT ─────────────────────────────────────────────────────────────
export async function updateBilling(req, res, next) {
  try {
    const id      = parseInt(req.params.id)
    const body    = billingSchema.parse(req.body)
    const billing = await prisma.billing.findFirst({ where: { id, isDeleted: false }, select: { status: true, applicantId: true } })

    if (!billing) return res.status(404).json({ message: 'Permohonan tidak dijumpai' })
    if (billing.status !== 'DRAFT' && billing.status !== 'RETURNED')
      return res.status(400).json({ message: 'Hanya permohonan DRAFT atau RETURNED boleh diedit' })
    if (billing.applicantId !== req.user.id && req.user.role?.slug !== 'admin')
      return res.status(403).json({ message: 'Tiada kebenaran' })

    const total = body.items.reduce((s, i) => s + i.qty * i.unitCost, 0)

    const data = await prisma.$transaction(async (tx) => {
      await tx.billingItem.deleteMany({ where: { billingId: id } })
      return tx.billing.update({
        where: { id },
        data: {
          vendorId:    body.vendorId,
          projectNo:   body.projectNo ?? null,
          description: body.description,
          totalAmount: total,
          status:      'DRAFT',
          items: {
            create: body.items.map(i => ({
              accNo:       i.accNo ?? null,
              description: i.description,
              invoiceNo:   i.invoiceNo ?? null,
              qty:         i.qty,
              unitCost:    i.unitCost,
              amount:      i.qty * i.unitCost,
            })),
          },
        },
        include: { items: true },
      })
    })

    await logActivity({ userId: req.user.id, userName: req.user.name, action: 'UPDATE', module: 'billing', targetId: id, detail: data.refNo, req })
    res.json({ data })
  } catch (err) { next(err) }
}

// ─── Submit (DRAFT → PENDING_HOD) ───────────────────────────────────────────
export async function submitBilling(req, res, next) {
  try {
    const id      = parseInt(req.params.id)
    const billing = await prisma.billing.findFirst({
      where:   { id, isDeleted: false },
      include: { attachments: { where: { isDeleted: false }, select: { id: true } } },
    })
    if (!billing) return res.status(404).json({ message: 'Permohonan tidak dijumpai' })
    if (billing.applicantId !== req.user.id && req.user.role?.slug !== 'admin')
      return res.status(403).json({ message: 'Tiada kebenaran' })
    if (billing.status !== 'DRAFT' && billing.status !== 'RETURNED')
      return res.status(400).json({ message: 'Status tidak sah untuk submit' })
    // TODO: Re-enable attachment validation in future
    // if (billing.attachments.length === 0)
    //   return res.status(400).json({ message: 'Wajib upload sekurang-kurangnya satu lampiran' })

    // Jika pemohon adalah HOD/Finance HOD → CEO gantikan, bukan HOD
    const applicantRole  = req.user.role?.slug
    const isHodApplicant = ['hod', 'finance_hod'].includes(applicantRole)
    const firstStatus    = isHodApplicant ? 'PENDING_CEO'  : 'PENDING_HOD'
    const firstStep      = isHodApplicant ? 'CEO'          : 'HOD'
    const workflowType   = isHodApplicant ? 'HOD'          : 'STAFF'

    const data = await prisma.$transaction(async (tx) => {
      await tx.billingApproval.create({
        data: {
          billingId:  id,
          step:       'SUBMIT',
          actorId:    req.user.id,
          action:     'SUBMIT',
          fromStatus: billing.status,
          toStatus:   firstStatus,
          remarks:    req.body.remarks ?? null,
        },
      })
      return tx.billing.update({
        where: { id },
        data:  { status: firstStatus, currentStep: firstStep, workflowType },
      })
    })

    await logActivity({ userId: req.user.id, userName: req.user.name, action: 'SUBMIT', module: 'billing', targetId: id, detail: billing.refNo, req })
    res.json({ data })
  } catch (err) { next(err) }
}

// ─── Workflow action (approve / reject / return) ─────────────────────────────
export async function workflowAction(req, res, next) {
  try {
    const id     = parseInt(req.params.id)
    const action = req.params.action.toUpperCase() // APPROVE | REJECT | RETURN

    if (!['APPROVE', 'REJECT', 'RETURN'].includes(action))
      return res.status(400).json({ message: 'Tindakan tidak sah' })

    const billing = await prisma.billing.findFirst({ where: { id, isDeleted: false } })
    if (!billing) return res.status(404).json({ message: 'Permohonan tidak dijumpai' })

    const steps   = getStepConfig(billing)
    const stepCfg = steps[billing.status]
    if (!stepCfg) return res.status(400).json({ message: 'Status permohonan tidak boleh diambil tindakan' })

    if (!stepCfg.role.includes(req.user.role?.slug))
      return res.status(403).json({ message: 'Tiada kebenaran untuk langkah ini' })

    // HOD hanya boleh bertindak pada permohonan jabatannya sendiri
    const role = req.user.role?.slug
    if (role === 'hod' && billing.status === 'PENDING_HOD' && billing.departmentId !== req.user.departmentId)
      return res.status(403).json({ message: 'Tiada kebenaran — permohonan bukan dari jabatan anda' })

    let toStatus
    if (action === 'APPROVE') toStatus = stepCfg.onApprove
    if (action === 'REJECT')  toStatus = stepCfg.onReject
    if (action === 'RETURN')  toStatus = stepCfg.onReturn

    const nextStep = steps[toStatus]?.step ?? null

    const data = await prisma.$transaction(async (tx) => {
      await tx.billingApproval.create({
        data: {
          billingId:  id,
          step:       stepCfg.step,
          actorId:    req.user.id,
          action:     action === 'APPROVE' ? (stepCfg.step === 'FINANCE_VERIFY' ? 'VERIFY' : 'APPROVE') : action,
          fromStatus: billing.status,
          toStatus,
          remarks:    req.body.remarks ?? null,
        },
      })
      return tx.billing.update({
        where: { id },
        data:  { status: toStatus, currentStep: nextStep },
      })
    })

    await logActivity({ userId: req.user.id, userName: req.user.name, action, module: 'billing', targetId: id, detail: `${billing.refNo} → ${toStatus}`, req })

    // Refresh cache permohonan jika status bertukar ke/dari APPROVED
    if (toStatus === 'APPROVED' || billing.status === 'APPROVED') {
      const items = await prisma.billingItem.findMany({
        where: { billingId: id, isDeleted: false, accNo: { not: null } },
        select: { accNo: true },
      })
      const accNos = extractAccNos(items)
      const year   = billing.createdAt.getFullYear()
      const month  = billing.createdAt.getMonth() + 1
      await Promise.all(accNos.map(accNo => recalcPermohonanCache(accNo, year, month)))
    }

    res.json({ data })
  } catch (err) { next(err) }
}

// ─── Mark as PAID ─────────────────────────────────────────────────────────────
export async function markPaid(req, res, next) {
  try {
    const id      = parseInt(req.params.id)
    const { paymentRef, remarks } = req.body

    if (!paymentRef) return res.status(400).json({ message: 'No. rujukan bayaran wajib diisi' })

    const billing = await prisma.billing.findFirst({ where: { id, isDeleted: false } })
    if (!billing) return res.status(404).json({ message: 'Permohonan tidak dijumpai' })
    if (billing.status !== 'APPROVED')
      return res.status(400).json({ message: 'Hanya permohonan APPROVED boleh ditandakan PAID' })

    if (!['finance', 'finance_hod', 'admin'].includes(req.user.role?.slug))
      return res.status(403).json({ message: 'Tiada kebenaran' })

    const data = await prisma.$transaction(async (tx) => {
      await tx.billingApproval.create({
        data: {
          billingId:  id,
          step:       'PAYMENT',
          actorId:    req.user.id,
          action:     'PAY',
          fromStatus: 'APPROVED',
          toStatus:   'PAID',
          remarks:    remarks ?? null,
        },
      })
      return tx.billing.update({
        where: { id },
        data:  {
          status:     'PAID',
          currentStep: null,
          paidAt:     new Date(),
          paidById:   req.user.id,
          paymentRef,
        },
      })
    })

    await logActivity({ userId: req.user.id, userName: req.user.name, action: 'PAY', module: 'billing', targetId: id, detail: `${billing.refNo} — ${paymentRef}`, req })
    res.json({ data })
  } catch (err) { next(err) }
}

// ─── Helper: ambil data billing untuk page tindakan ──────────────────────────
const ACTION_PAGE_INCLUDE = {
  applicant:   { select: { id: true, name: true, staffNo: true, position: { select: { name: true } } } },
  department:  { select: { id: true, name: true } },
  vendor:      { select: { id: true, name: true, type: true, bankName: true, bankAcc: true } },
  payingBank:  true,
  items:       { where: { isDeleted: false }, select: { id: true, accNo: true, description: true, invoiceNo: true, qty: true, unitCost: true, amount: true }, orderBy: { id: 'asc' } },
  approvals:   { include: { actor: { select: { id: true, name: true, position: { select: { name: true } } } } }, orderBy: { actionedAt: 'asc' } },
  attachments: { where: { isDeleted: false }, include: { uploadedBy: { select: { id: true, name: true } } }, orderBy: { uploadedAt: 'desc' } },
}

async function fetchActionBilling(id, { allowedRoles, allowedStatuses }, user) {
  const role = user.role?.slug
  if (!allowedRoles.includes(role)) return { error: 403, message: 'Tiada kebenaran' }
  const billing = await prisma.billing.findFirst({ where: { id: parseInt(id), isDeleted: false }, include: ACTION_PAGE_INCLUDE })
  if (!billing) return { error: 404, message: 'Permohonan tidak dijumpai' }
  if (allowedStatuses && !allowedStatuses.includes(billing.status))
    return { error: 400, message: 'Permohonan tidak dalam peringkat yang betul' }
  return { billing }
}

// ─── HOD review ───────────────────────────────────────────────────────────────
export async function getHodReview(req, res, next) {
  try {
    const { billing, error, message } = await fetchActionBilling(req.params.id,
      { allowedRoles: ['hod', 'finance_hod', 'admin'], allowedStatuses: ['PENDING_HOD'] }, req.user)
    if (error) return res.status(error).json({ message })
    // HOD hanya boleh semak permohonan jabatannya sendiri
    if (req.user.role?.slug === 'hod' && billing.departmentId !== req.user.departmentId)
      return res.status(403).json({ message: 'Tiada kebenaran — permohonan bukan dari jabatan anda' })
    res.json({ data: billing })
  } catch (err) { next(err) }
}

// ─── CEO review ───────────────────────────────────────────────────────────────
export async function getCeoReview(req, res, next) {
  try {
    const { billing, error, message } = await fetchActionBilling(req.params.id,
      { allowedRoles: ['ceo', 'admin'], allowedStatuses: ['PENDING_CEO', 'PENDING_CEO_FINAL'] }, req.user)
    if (error) return res.status(error).json({ message })
    res.json({ data: billing })
  } catch (err) { next(err) }
}

// ─── Finance Verify review ────────────────────────────────────────────────────
export async function getFinanceVerifyReview(req, res, next) {
  try {
    const { billing, error, message } = await fetchActionBilling(req.params.id,
      { allowedRoles: ['finance', 'finance_hod', 'admin'], allowedStatuses: ['PENDING_FINANCE_VERIFY'] }, req.user)
    if (error) return res.status(error).json({ message })
    res.json({ data: billing })
  } catch (err) { next(err) }
}

// ─── Finance Approval review ──────────────────────────────────────────────────
export async function getFinanceApprovalReview(req, res, next) {
  try {
    const { billing, error, message } = await fetchActionBilling(req.params.id,
      { allowedRoles: ['finance_hod', 'admin'], allowedStatuses: ['PENDING_FINANCE_APPROVAL'] }, req.user)
    if (error) return res.status(error).json({ message })
    res.json({ data: billing })
  } catch (err) { next(err) }
}

// ─── Review Preview (untuk approver sahaja) ───────────────────────────────────
export async function getBillingReview(req, res, next) {
  try {
    const id   = parseInt(req.params.id)
    const data = await prisma.billing.findFirst({
      where:   { id, isDeleted: false },
      include: {
        applicant:  { select: { id: true, name: true, staffNo: true, position: { select: { name: true } } } },
        department: { select: { id: true, name: true } },
        vendor:     { select: { id: true, name: true, type: true, bankName: true, bankAcc: true } },
        items:      { where: { isDeleted: false }, select: { id: true, accNo: true, description: true, invoiceNo: true, qty: true, unitCost: true, amount: true }, orderBy: { id: 'asc' } },
      },
    })
    if (!data) return res.status(404).json({ message: 'Permohonan tidak dijumpai' })
    if (!canViewBilling(req.user, data)) return res.status(403).json({ message: 'Tiada kebenaran' })
    res.json({ data })
  } catch (err) { next(err) }
}

// ─── Delete DRAFT ─────────────────────────────────────────────────────────────
export async function deleteBilling(req, res, next) {
  try {
    const id      = parseInt(req.params.id)
    const billing = await prisma.billing.findFirst({ where: { id, isDeleted: false }, select: { status: true, applicantId: true, refNo: true } })
    if (!billing) return res.status(404).json({ message: 'Permohonan tidak dijumpai' })
    if (billing.status !== 'DRAFT') return res.status(400).json({ message: 'Hanya draft boleh dipadam' })
    if (billing.applicantId !== req.user.id && req.user.role?.slug !== 'admin')
      return res.status(403).json({ message: 'Tiada kebenaran' })

    await prisma.billing.update({ where: { id }, data: { isDeleted: true, deletedAt: new Date() } })
    await logActivity({ userId: req.user.id, userName: req.user.name, action: 'DELETE', module: 'billing', targetId: id, detail: billing.refNo, req })
    res.json({ message: 'Permohonan berjaya dipadam' })
  } catch (err) { next(err) }
}
