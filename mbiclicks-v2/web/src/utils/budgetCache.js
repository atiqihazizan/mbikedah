import prisma from '../lib/prisma.js'

/**
 * Recalculate amount_permohonan untuk accNo + bulan tertentu.
 * Dijumlahkan dari semua billing item yang billing-nya berstatus APPROVED.
 * Dipanggil setiap kali billing bertukar ke/dari APPROVED.
 */
export async function recalcPermohonanCache(accNo, year, month, tx = prisma) {
  const monthStart = new Date(year, month - 1, 1)
  const monthEnd   = new Date(year, month, 1)

  const items = await tx.billingItem.findMany({
    where: {
      accNo,
      isDeleted: false,
      billing: {
        isDeleted: false,
        status:    'APPROVED',
        createdAt: { gte: monthStart, lt: monthEnd },
      },
    },
    select: { amount: true },
  })

  const total = items.reduce((s, i) => s + Number(i.amount), 0)

  await tx.budgetMonthlyCache.upsert({
    where:  { accNo_year_month: { accNo, year, month } },
    create: { accNo, year, month, amountPermohonan: total },
    update: { amountPermohonan: total },
  })
}

/**
 * Recalculate amount_actual untuk accNo + bulan tertentu.
 * Dijumlahkan dari semua payment (paidAt dalam bulan tersebut),
 * diagihkan secara proportional mengikut item accNo dalam setiap billing.
 * Dipanggil setiap kali payment baru dibuat atau fasa dibayar.
 */
export async function recalcActualCache(accNo, year, month, tx = prisma) {
  const monthStart = new Date(year, month - 1, 1)
  const monthEnd   = new Date(year, month, 1)

  const billings = await tx.billing.findMany({
    where: {
      isDeleted: false,
      items:    { some: { accNo, isDeleted: false } },
      payments: { some: { paidAt: { gte: monthStart, lt: monthEnd } } },
    },
    include: {
      items:    { where: { isDeleted: false } },
      payments: { where: { paidAt: { gte: monthStart, lt: monthEnd } } },
    },
  })

  let total = 0
  for (const billing of billings) {
    const billingTotal = billing.items.reduce((s, i) => s + Number(i.amount), 0)
    if (billingTotal === 0) continue

    const accNoShare = billing.items
      .filter(i => i.accNo === accNo)
      .reduce((s, i) => s + Number(i.amount), 0)

    const proportion  = accNoShare / billingTotal
    const paidInMonth = billing.payments.reduce((s, p) => s + Number(p.amount), 0)
    total += paidInMonth * proportion
  }

  await tx.budgetMonthlyCache.upsert({
    where:  { accNo_year_month: { accNo, year, month } },
    create: { accNo, year, month, amountActual: total },
    update: { amountActual: total },
  })
}

/**
 * Helper — ambil semua accNo unik dari senarai billing items.
 */
export function extractAccNos(items) {
  return [...new Set(items.filter(i => i.accNo).map(i => i.accNo))]
}
