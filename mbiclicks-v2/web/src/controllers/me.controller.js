import prisma from '../lib/prisma.js'
import { TASK_QUEUE_MAP } from '../lib/workflowRules.js'

// ─── GET /me/summary ─────────────────────────────────────────────────────────
export async function getMySummary(req, res, next) {
  try {
    const role   = req.user.role?.slug
    const userId = req.user.id
    const deptId = req.user.departmentId

    // application: kiraan permohonan milik sendiri
    const [active, pendingApproval, waitingPayment, partialPayment, completed] = await Promise.all([
      prisma.billing.count({ where: { applicantId: userId, isDeleted: false,
        status: { notIn: ['DRAFT', 'PAID', 'CLOSED', 'REJECTED'] } } }),
      prisma.billing.count({ where: { applicantId: userId, isDeleted: false,
        status: { in: ['PENDING_HOD', 'PENDING_CEO', 'PENDING_FINANCE_CHECK',
                        'PENDING_FINANCE_VERIFY', 'PENDING_FINANCE_APPROVAL', 'PENDING_CEO_FINAL'] } } }),
      prisma.billing.count({ where: { applicantId: userId, isDeleted: false, status: 'APPROVED' } }),
      prisma.billing.count({ where: { applicantId: userId, isDeleted: false, status: 'PARTIAL_PAID' } }),
      prisma.billing.count({ where: { applicantId: userId, isDeleted: false, status: { in: ['PAID', 'CLOSED'] } } }),
    ])

    const application = { active, pendingApproval, waitingPayment, partialPayment, completed }

    // tasks: kiraan task mengikut role
    let tasks = { total: 0 }

    if (role === 'admin') {
      const total = await prisma.billing.count({ where: { isDeleted: false,
        status: { notIn: ['DRAFT', 'PAID', 'CLOSED', 'REJECTED', 'RETURNED'] } } })
      tasks = { total }

    } else if (role === 'hod') {
      const total = await prisma.billing.count({ where: { isDeleted: false, status: 'PENDING_HOD', departmentId: deptId } })
      tasks = { total, hodApproval: total }

    } else if (role === 'finance_hod') {
      const [hodApproval, financeCheck, financeVerify, financeApproval, payment] = await Promise.all([
        prisma.billing.count({ where: { isDeleted: false, status: 'PENDING_HOD', departmentId: deptId } }),
        prisma.billing.count({ where: { isDeleted: false, status: 'PENDING_FINANCE_CHECK' } }),
        prisma.billing.count({ where: { isDeleted: false, status: 'PENDING_FINANCE_VERIFY' } }),
        prisma.billing.count({ where: { isDeleted: false, status: 'PENDING_FINANCE_APPROVAL' } }),
        prisma.billing.count({ where: { isDeleted: false, status: { in: ['APPROVED', 'PARTIAL_PAID'] } } }),
      ])
      tasks = { total: hodApproval + financeCheck + financeVerify + financeApproval + payment,
        hodApproval, financeCheck, financeVerify, financeApproval, payment }

    } else if (role === 'ceo') {
      const [ceoApproval, ceoFinal] = await Promise.all([
        prisma.billing.count({ where: { isDeleted: false, status: 'PENDING_CEO' } }),
        prisma.billing.count({ where: { isDeleted: false, status: 'PENDING_CEO_FINAL' } }),
      ])
      tasks = { total: ceoApproval + ceoFinal, ceoApproval, ceoFinal }

    } else if (role === 'finance') {
      const [financeCheck, financeVerify, payment] = await Promise.all([
        prisma.billing.count({ where: { isDeleted: false, status: 'PENDING_FINANCE_CHECK' } }),
        prisma.billing.count({ where: { isDeleted: false, status: 'PENDING_FINANCE_VERIFY' } }),
        prisma.billing.count({ where: { isDeleted: false, status: { in: ['APPROVED', 'PARTIAL_PAID'] } } }),
      ])
      tasks = { total: financeCheck + financeVerify + payment, financeCheck, financeVerify, payment }
    }

    res.json({ application, tasks })
  } catch (err) { next(err) }
}

// Status yang boleh ada task untuk pegawai
const TASK_STATUSES = Object.keys(TASK_QUEUE_MAP)

const PRIORITY_THRESHOLDS = { urgent: 3, high: 1 } // hari menunggu

function computePriority(daysWaiting) {
  if (daysWaiting >= PRIORITY_THRESHOLDS.urgent) return 'urgent'
  if (daysWaiting >= PRIORITY_THRESHOLDS.high)   return 'high'
  return 'normal'
}

// ─── GET /me/tasks ────────────────────────────────────────────────────────────
export async function getMyTasks(req, res, next) {
  try {
    const role       = req.user.role?.slug
    const userId     = req.user.id
    const deptId     = req.user.departmentId

    // Bina where clause berdasarkan role — baca dari TASK_QUEUE_MAP
    // [COMPATIBILITY LAYER] — guna role.slug untuk tentukan task scope
    let where = { isDeleted: false, status: { in: TASK_STATUSES } }

    if (role === 'admin') {
      // admin nampak semua
    } else if (role === 'hod' || role === 'finance_hod') {
      where = { ...where, OR: [
        { status: 'PENDING_HOD', departmentId: deptId },
        ...(role === 'finance_hod' ? [
          { status: { in: ['PENDING_FINANCE_CHECK', 'PENDING_FINANCE_VERIFY', 'PENDING_FINANCE_APPROVAL'] } },
          { status: 'APPROVED' },
          { status: 'PARTIAL_PAID' },
        ] : []),
      ]}
    } else if (role === 'ceo') {
      where = { ...where, status: { in: ['PENDING_CEO', 'PENDING_CEO_FINAL'] } }
    } else if (role === 'finance') {
      where = { ...where, status: { in: ['PENDING_FINANCE_CHECK', 'PENDING_FINANCE_VERIFY', 'APPROVED', 'PARTIAL_PAID'] } }
    } else {
      // staff / role tidak dikenali → tiada task
      return res.json({ summary: { totalPending: 0, urgent: 0, high: 0 }, items: [] })
    }

    const billings = await prisma.billing.findMany({
      where,
      orderBy:  { updatedAt: 'asc' },
      include: {
        applicant:  { select: { id: true, name: true } },
        department: { select: { id: true, name: true } },
      },
    })

    const now = Date.now()

    const items = billings.map(b => {
      const taskDef     = TASK_QUEUE_MAP[b.status]
      const daysWaiting = Math.floor((now - new Date(b.updatedAt).getTime()) / 86_400_000)
      const priority    = computePriority(daysWaiting)

      return {
        billingId:   b.id,
        refNo:       b.refNo,
        queue:       taskDef?.queue ?? b.status.toLowerCase(),
        amount:      parseFloat(b.totalAmount),
        applicant:   b.applicant?.name ?? '—',
        department:  b.department?.name ?? '—',
        daysWaiting,
        priority,
        isUrgent:    priority === 'urgent',
      }
    })

    const summary = {
      totalPending: items.length,
      urgent:       items.filter(i => i.priority === 'urgent').length,
      high:         items.filter(i => i.priority === 'high').length,
    }

    res.json({ summary, items })
  } catch (err) { next(err) }
}
