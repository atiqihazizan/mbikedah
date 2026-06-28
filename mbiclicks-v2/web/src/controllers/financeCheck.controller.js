import { z } from 'zod'
import prisma from '../lib/prisma.js'
import { logActivity } from '../utils/activityLog.js'

const YEAR = new Date().getFullYear()

// ─── Helper: baki bajet bagi satu accNo ──────────────────────────────────────
async function getBudgetBalance(accNo, excludeBillingId) {
  if (!accNo) return null

  // Peruntukan — ambil versi terkini (ADJ2 > ADJ1 > ORIGINAL)
  const budgetYear = await prisma.budgetYear.findFirst({
    where: { year: YEAR },
    select: { id: true },
  })
  let peruntukan = 0
  if (budgetYear) {
    const versions = ['ADJ2', 'ADJ1', 'ORIGINAL']
    for (const version of versions) {
      const line = await prisma.budgetLine.findFirst({
        where: { budgetYearId: budgetYear.id, accNo, version },
        select: { total: true },
      })
      if (line) { peruntukan = parseFloat(line.total); break }
    }
  }

  // Belanja sebenar (dari ActualData)
  const actual = await prisma.actualData.aggregate({
    where: { accNo, year: YEAR },
    _sum: { amount: true },
  })
  const belanja = parseFloat(actual._sum.amount ?? 0)

  // Tertangguh — billings dalam proses (exclude billing semasa)
  const pendingStatuses = [
    'PENDING_HOD', 'PENDING_FINANCE_CHECK', 'PENDING_FINANCE_VERIFY',
    'PENDING_FINANCE_APPROVAL', 'APPROVED',
  ]
  const tertangguhAgg = await prisma.billingItem.aggregate({
    where: {
      accNo,
      isDeleted: false,
      billing: {
        status: { in: pendingStatuses },
        isDeleted: false,
        ...(excludeBillingId ? { id: { not: excludeBillingId } } : {}),
      },
    },
    _sum: { amount: true },
  })
  const tertangguh = parseFloat(tertangguhAgg._sum.amount ?? 0)

  const baki = peruntukan - belanja - tertangguh

  return { accNo, peruntukan, belanja, tertangguh, baki }
}

// ─── GET budget balance untuk satu accNo (real-time semasa officer tukar kod) ─
export async function getBudgetBalanceApi(req, res, next) {
  try {
    const { accNo, excludeBillingId } = req.query
    if (!accNo) return res.status(400).json({ message: 'accNo diperlukan' })
    const excludeId = excludeBillingId ? parseInt(excludeBillingId) : null
    const bal = await getBudgetBalance(accNo, excludeId)
    res.json({ data: bal })
  } catch (err) { next(err) }
}

// ─── GET finance check data ───────────────────────────────────────────────────
export async function getFinanceCheck(req, res, next) {
  try {
    const id = parseInt(req.params.id)

    const billing = await prisma.billing.findFirst({
      where: { id, isDeleted: false },
      include: {
        applicant:   { select: { id: true, name: true, staffNo: true, position: { select: { name: true } } } },
        department:  { select: { id: true, name: true } },
        vendor:      { select: { id: true, name: true, type: true, bankName: true, bankAcc: true } },
        payingBank:  true,
        items:       { where: { isDeleted: false }, include: { account: { select: { name: true } } }, orderBy: { id: 'asc' } },
        attachments: { where: { isDeleted: false }, include: { uploadedBy: { select: { id: true, name: true } } }, orderBy: { uploadedAt: 'desc' } },
        approvals:   { include: { actor: { select: { id: true, name: true } } }, orderBy: { actionedAt: 'asc' } },
      },
    })

    if (!billing) return res.status(404).json({ message: 'Permohonan tidak dijumpai' })
    if (billing.status !== 'PENDING_FINANCE_CHECK')
      return res.status(400).json({ message: 'Permohonan bukan dalam peringkat Semakan Kewangan' })

    // Kira baki bajet untuk setiap accNo unik
    const uniqueAccNos = [...new Set(billing.items.map(i => i.accNo).filter(Boolean))]
    const budgetMap = {}
    for (const accNo of uniqueAccNos) {
      budgetMap[accNo] = await getBudgetBalance(accNo, id)
    }

    res.json({ data: billing, budgetMap })
  } catch (err) { next(err) }
}

// ─── POST submit semakan kewangan ─────────────────────────────────────────────
const financeCheckSchema = z.object({
  payingBankId:  z.number().int().positive(),
  paymentMethod: z.enum(['CHEQUE', 'CASH', 'ONLINE']),
  items: z.array(z.object({
    id:    z.number().int().positive(),
    accNo: z.string().max(20).nullable().optional(),
  })).min(1),
  remarks: z.string().optional().nullable(),
})

export async function submitFinanceCheck(req, res, next) {
  try {
    const id   = parseInt(req.params.id)
    const body = financeCheckSchema.parse(req.body)

    const billing = await prisma.billing.findFirst({
      where: { id, isDeleted: false },
      include: { items: { where: { isDeleted: false } } },
    })

    if (!billing) return res.status(404).json({ message: 'Permohonan tidak dijumpai' })
    if (billing.status !== 'PENDING_FINANCE_CHECK')
      return res.status(400).json({ message: 'Permohonan bukan dalam peringkat Semakan Kewangan' })

    // Semak bank pembayar wujud dan aktif
    const bank = await prisma.bankAccount.findFirst({
      where: { id: body.payingBankId, isActive: true },
    })
    if (!bank) return res.status(400).json({ message: 'Akaun bank pembayar tidak wujud atau tidak aktif' })

    // Semak baki bajet mencukupi untuk setiap accNo
    const accNoAmounts = {}
    for (const item of billing.items) {
      const newAccNo = body.items.find(i => i.id === item.id)?.accNo ?? item.accNo
      if (newAccNo) {
        accNoAmounts[newAccNo] = (accNoAmounts[newAccNo] ?? 0) + parseFloat(item.amount)
      }
    }

    const insufficientAccNos = []
    for (const [accNo, amount] of Object.entries(accNoAmounts)) {
      const bal = await getBudgetBalance(accNo, id)
      if (bal && bal.baki < amount) {
        insufficientAccNos.push({ accNo, baki: bal.baki, dipohon: amount })
      }
    }

    if (insufficientAccNos.length > 0) {
      return res.status(400).json({
        message: 'Baki bajet tidak mencukupi untuk kod akaun berikut',
        insufficientAccNos,
      })
    }

    // Simpan semua dalam transaction
    const data = await prisma.$transaction(async (tx) => {
      // Kemaskini accNo pada setiap item
      for (const itemUpdate of body.items) {
        await tx.billingItem.update({
          where: { id: itemUpdate.id },
          data:  { accNo: itemUpdate.accNo ?? null },
        })
      }

      // Rekod kelulusan
      await tx.billingApproval.create({
        data: {
          billingId:  id,
          step:       'FINANCE_CHECK',
          actorId:    req.user.id,
          action:     'APPROVE',
          fromStatus: 'PENDING_FINANCE_CHECK',
          toStatus:   'PENDING_FINANCE_VERIFY',
          remarks:    body.remarks ?? null,
        },
      })

      // Kemaskini billing
      return tx.billing.update({
        where: { id },
        data: {
          paymentMethod: body.paymentMethod,
          payingBankId:  body.payingBankId,
          status:        'PENDING_FINANCE_VERIFY',
          currentStep:   'FINANCE_VERIFY',
        },
      })
    })

    await logActivity({
      userId: req.user.id, userName: req.user.name,
      action: 'FINANCE_CHECK', module: 'billing',
      targetId: id, detail: `${billing.refNo} → PENDING_FINANCE_VERIFY`, req,
    })

    res.json({ data })
  } catch (err) { next(err) }
}

// ─── BankAccount: list ────────────────────────────────────────────────────────
export async function listBankAccounts(req, res, next) {
  try {
    const { status } = req.query
    const where = {}
    if (status === 'active') where.isActive = true
    if (status === 'inactive') where.isActive = false

    const data = await prisma.bankAccount.findMany({
      where,
      orderBy: { name: 'asc' },
    })
    res.json({ data })
  } catch (err) { next(err) }
}

// ─── BankAccount: create ─────────────────────────────────────────────────────
const bankSchema = z.object({
  code:     z.string().min(1).max(20).toUpperCase(),
  name:     z.string().min(1).max(100),
  bankName: z.string().min(1).max(100),
  accNo:    z.string().min(1).max(50),
})

export async function createBankAccount(req, res, next) {
  try {
    const body = bankSchema.parse(req.body)
    const data = await prisma.bankAccount.create({ data: body })
    res.status(201).json({ data })
  } catch (err) { next(err) }
}

export async function updateBankAccount(req, res, next) {
  try {
    const id   = parseInt(req.params.id)
    const body = bankSchema.partial().parse(req.body)
    const data = await prisma.bankAccount.update({ where: { id }, data: body })
    res.json({ data })
  } catch (err) { next(err) }
}

export async function toggleBankAccount(req, res, next) {
  try {
    const id   = parseInt(req.params.id)
    const bank = await prisma.bankAccount.findUnique({ where: { id } })
    if (!bank) return res.status(404).json({ message: 'Akaun bank tidak dijumpai' })
    const data = await prisma.bankAccount.update({ where: { id }, data: { isActive: !bank.isActive } })
    res.json({ data })
  } catch (err) { next(err) }
}
