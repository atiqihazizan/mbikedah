import { z } from 'zod'
import prisma from '../lib/prisma.js'
import { logActivity } from '../utils/activityLog.js'
import { recalcActualCache, extractAccNos } from '../utils/budgetCache.js'

const PAYABLE_STATUSES  = ['APPROVED', 'PARTIAL_PAID']
const CLOSEABLE_STATUSES = ['APPROVED', 'PARTIAL_PAID']

// ─── GET senarai bayaran untuk satu billing ───────────────────────────────────
export async function listPayments(req, res, next) {
  try {
    const id = parseInt(req.params.id)
    const billing = await prisma.billing.findFirst({
      where: { id, isDeleted: false },
      select: { id: true, refNo: true, totalAmount: true, status: true },
    })
    if (!billing) return res.status(404).json({ message: 'Permohonan tidak dijumpai' })

    const payments = await prisma.billingPayment.findMany({
      where: { billingId: id },
      include: { paidBy: { select: { id: true, name: true } } },
      orderBy: { phase: 'asc' },
    })

    // totalPaid = jumlah yang sudah benar-benar dibayar (paidAt != null)
    // totalPlanned = jumlah fasa yang belum dibayar (paidAt = null)
    const totalPaid    = payments.filter(p => p.paidAt).reduce((s, p) => s + parseFloat(p.amount), 0)
    const totalPlanned = payments.filter(p => !p.paidAt).reduce((s, p) => s + parseFloat(p.amount), 0)

    res.json({ data: payments, totalPaid, totalPlanned, totalAmount: parseFloat(billing.totalAmount) })
  } catch (err) { next(err) }
}

// ─── POST rekod bayaran (penuh atau satu fasa ansuran) ────────────────────────
const paySchema = z.object({
  type:       z.enum(['FULL', 'PARTIAL']),
  amount:     z.number().positive(),
  paymentRef: z.string().max(100).optional().nullable(),
  dueDate:    z.string().optional().nullable(),
  remarks:    z.string().optional().nullable(),
  // Untuk PARTIAL: boleh pass targetPhases untuk plan semua fasa sekaligus
  phases:     z.array(z.object({
    amount:  z.number().positive(),
    dueDate: z.string().optional().nullable(),
  })).optional(),
})

export async function recordPayment(req, res, next) {
  try {
    const id   = parseInt(req.params.id)
    const body = paySchema.parse(req.body)

    const billing = await prisma.billing.findFirst({
      where: { id, isDeleted: false },
      include: { payments: true },
    })
    if (!billing) return res.status(404).json({ message: 'Permohonan tidak dijumpai' })
    if (!PAYABLE_STATUSES.includes(billing.status)) {
      return res.status(400).json({ message: 'Permohonan belum diluluskan atau sudah selesai dibayar' })
    }

    const totalAmount  = parseFloat(billing.totalAmount)
    const alreadyPaid  = billing.payments.reduce((s, p) => s + parseFloat(p.amount), 0)
    const nextPhase    = billing.payments.length + 1

    let newPayments = []

    if (body.type === 'FULL') {
      // Bayar penuh sekaligus
      const remaining = totalAmount - alreadyPaid
      if (body.amount > remaining + 0.005) {
        return res.status(400).json({ message: `Jumlah bayaran (RM ${body.amount.toFixed(2)}) melebihi baki yang perlu dibayar (RM ${remaining.toFixed(2)})` })
      }
      newPayments.push({
        billingId:  id,
        phase:      nextPhase,
        amount:     body.amount,
        paidAt:     new Date(),
        paymentRef: body.paymentRef ?? null,
        remarks:    body.remarks ?? null,
        paidById:   req.user.id,
      })
    } else {
      // Ansuran — boleh plan beberapa fasa atau bayar satu fasa sahaja
      const phasesToCreate = body.phases?.length > 0 ? body.phases : [{ amount: body.amount, dueDate: body.dueDate }]
      const totalNew = phasesToCreate.reduce((s, p) => s + p.amount, 0)

      if (alreadyPaid + totalNew > totalAmount + 0.005) {
        return res.status(400).json({ message: `Jumlah semua fasa (RM ${(alreadyPaid + totalNew).toFixed(2)}) melebihi jumlah permohonan (RM ${totalAmount.toFixed(2)})` })
      }

      phasesToCreate.forEach((p, i) => {
        newPayments.push({
          billingId:  id,
          phase:      nextPhase + i,
          amount:     p.amount,
          dueDate:    p.dueDate ? new Date(p.dueDate) : null,
          paidAt:     null, // belum dibayar lagi — akan dikemaskini bila bayar
          paymentRef: null,
          paidById:   null,
        })
      })
      // Fasa pertama dalam batch ini dibayar sekarang
      newPayments[0].paidAt     = new Date()
      newPayments[0].paymentRef = body.paymentRef ?? null
      newPayments[0].remarks    = body.remarks ?? null
      newPayments[0].paidById   = req.user.id
    }

    // Kira status baru selepas bayaran ini
    const newTotalPaid = alreadyPaid + newPayments.filter(p => p.paidAt).reduce((s, p) => s + parseFloat(p.amount), 0)
    const isFullyPaid  = newTotalPaid >= totalAmount - 0.005
    const newStatus    = isFullyPaid ? 'PAID' : 'PARTIAL_PAID'

    await prisma.$transaction(async (tx) => {
      await tx.billingPayment.createMany({ data: newPayments })
      await tx.billing.update({
        where: { id },
        data: {
          status:    newStatus,
          ...(isFullyPaid ? { paidAt: new Date(), paidById: req.user.id } : {}),
        },
      })
      await tx.billingApproval.create({
        data: {
          billingId:  id,
          step:       'PAYMENT',
          actorId:    req.user.id,
          action:     'PAY',
          fromStatus: billing.status,
          toStatus:   newStatus,
          remarks:    body.remarks ?? (body.type === 'FULL' ? 'Bayaran penuh' : `Ansuran fasa ${nextPhase}`),
        },
      })
    })

    await logActivity({
      userId: req.user.id, userName: req.user.name,
      action: 'PAY', module: 'billing',
      targetId: id, detail: `${billing.refNo} → ${newStatus} (RM ${newTotalPaid.toFixed(2)} / RM ${totalAmount.toFixed(2)})`, req,
    })

    // Refresh cache actual untuk setiap accNo yang terlibat
    const paidPayments = newPayments.filter(p => p.paidAt)
    if (paidPayments.length > 0) {
      const items  = await prisma.billingItem.findMany({
        where: { billingId: id, isDeleted: false, accNo: { not: null } },
        select: { accNo: true },
      })
      const accNos    = extractAccNos(items)
      const paidDate  = paidPayments[0].paidAt
      const year      = paidDate.getFullYear()
      const month     = paidDate.getMonth() + 1
      await Promise.all(accNos.map(accNo => recalcActualCache(accNo, year, month)))
    }

    res.json({ message: isFullyPaid ? 'Bayaran penuh berjaya direkodkan' : 'Bayaran ansuran berjaya direkodkan', status: newStatus })
  } catch (err) { next(err) }
}

// ─── PATCH kemaskini fasa yang belum dibayar (tandakan sebagai dibayar) ───────
const payPhaseSchema = z.object({
  paymentRef: z.string().max(100).optional().nullable(),
  remarks:    z.string().optional().nullable(),
})

export async function payPhase(req, res, next) {
  try {
    const billingId = parseInt(req.params.id)
    const phaseId   = parseInt(req.params.phaseId)
    const body      = payPhaseSchema.parse(req.body)

    const payment = await prisma.billingPayment.findFirst({
      where: { id: phaseId, billingId },
    })
    if (!payment) return res.status(404).json({ message: 'Rekod bayaran tidak dijumpai' })
    if (payment.paidAt) return res.status(400).json({ message: 'Fasa ini sudah pun dibayar' })

    const billing = await prisma.billing.findFirst({
      where: { id: billingId, isDeleted: false },
      include: { payments: true },
    })
    if (!billing) return res.status(404).json({ message: 'Permohonan tidak dijumpai' })

    const totalAmount = parseFloat(billing.totalAmount)
    const totalPaidAfter = billing.payments.reduce((s, p) => {
      if (p.id === phaseId || p.paidAt) return s + parseFloat(p.amount)
      return s
    }, 0)
    const isFullyPaid = totalPaidAfter >= totalAmount - 0.005
    const newStatus   = isFullyPaid ? 'PAID' : 'PARTIAL_PAID'

    await prisma.$transaction(async (tx) => {
      await tx.billingPayment.update({
        where: { id: phaseId },
        data: { paidAt: new Date(), paymentRef: body.paymentRef ?? null, remarks: body.remarks ?? null, paidById: req.user.id },
      })
      await tx.billing.update({
        where: { id: billingId },
        data: {
          status:  newStatus,
          ...(isFullyPaid ? { paidAt: new Date(), paidById: req.user.id } : {}),
        },
      })
      await tx.billingApproval.create({
        data: {
          billingId, step: 'PAYMENT', actorId: req.user.id, action: 'PAY',
          fromStatus: billing.status, toStatus: newStatus,
          remarks: body.remarks ?? `Bayaran fasa ${payment.phase}`,
        },
      })
    })

    // Refresh cache actual untuk setiap accNo yang terlibat
    const items = await prisma.billingItem.findMany({
      where: { billingId, isDeleted: false, accNo: { not: null } },
      select: { accNo: true },
    })
    const accNos = extractAccNos(items)
    const now    = new Date()
    await Promise.all(accNos.map(accNo => recalcActualCache(accNo, now.getFullYear(), now.getMonth() + 1)))

    res.json({ message: `Fasa ${payment.phase} berjaya ditandakan sebagai dibayar`, status: newStatus })
  } catch (err) { next(err) }
}

// ─── POST tutup kes (paranormal close) ───────────────────────────────────────
const closeSchema = z.object({
  reason: z.string().min(1, 'Sebab penutupan wajib diisi').max(500),
})

export async function closeBilling(req, res, next) {
  try {
    const id   = parseInt(req.params.id)
    const body = closeSchema.parse(req.body)

    const billing = await prisma.billing.findFirst({
      where: { id, isDeleted: false },
      select: { id: true, refNo: true, status: true },
    })
    if (!billing) return res.status(404).json({ message: 'Permohonan tidak dijumpai' })
    if (!CLOSEABLE_STATUSES.includes(billing.status)) {
      return res.status(400).json({ message: 'Permohonan tidak boleh ditutup pada peringkat ini' })
    }

    await prisma.$transaction(async (tx) => {
      await tx.billing.update({ where: { id }, data: { status: 'CLOSED' } })
      await tx.billingApproval.create({
        data: {
          billingId:  id,
          step:       'CLOSE',
          actorId:    req.user.id,
          action:     'CLOSE',
          fromStatus: billing.status,
          toStatus:   'CLOSED',
          remarks:    body.reason,
        },
      })
    })

    await logActivity({
      userId: req.user.id, userName: req.user.name,
      action: 'CLOSE', module: 'billing',
      targetId: id, detail: `${billing.refNo} → CLOSED: ${body.reason}`, req,
    })

    res.json({ message: 'Permohonan berjaya ditutup', status: 'CLOSED' })
  } catch (err) { next(err) }
}
