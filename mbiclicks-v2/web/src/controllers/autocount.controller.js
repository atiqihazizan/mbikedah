import prisma from '../lib/prisma.js'
import { acGet } from '../utils/autocountApi.js'

const AC_TYPE_MAP = { SL: 'HASIL', OI: 'HASIL', EP: 'BELANJA' }

// ─── Sync Data Sebenar (Actual) dari Trial Balance — monthly ─────────────────

export async function syncActuals(req, res, next) {
  try {
    const year = Number(req.body.year ?? new Date().getFullYear())
    if (isNaN(year) || year < 2000 || year > 2100) {
      return res.status(400).json({ message: 'Tahun tidak sah' })
    }

    const isLeap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
    const MONTHS = [
      [1, '01', '31'], [2, '02', isLeap ? '29' : '28'], [3, '03', '31'],
      [4, '04', '30'], [5, '05', '31'], [6, '06', '30'],
      [7, '07', '31'], [8, '08', '31'], [9, '09', '30'],
      [10, '10', '31'], [11, '11', '30'], [12, '12', '31'],
    ]

    // Ambil TB kumulatif setiap bulan
    const cumulative = []
    for (const [month, mm, dd] of MONTHS) {
      const { data } = await acGet('/api/gl/trial-balance', {
        from: `${year}-01-01`,
        to:   `${year}-${mm}-${dd}`,
      })

      const map = new Map()
      for (const row of data) {
        if (!AC_TYPE_MAP[row.accountType]) continue
        const isHasil = AC_TYPE_MAP[row.accountType] === 'HASIL'
        const amount  = isHasil
          ? (row.totalCredit ?? 0) - (row.totalDebit ?? 0)
          : (row.totalDebit ?? 0) - (row.totalCredit ?? 0)
        map.set(row.accountCode, Math.max(0, amount))
      }
      cumulative.push({ month, map })
    }

    // Derive monthly delta & upsert ke ActualData
    const now = new Date()
    let synced = 0

    for (let i = 0; i < 12; i++) {
      const { month, map: curr } = cumulative[i]
      const prevMap = i > 0 ? cumulative[i - 1].map : new Map()

      for (const [accNo, cumAmt] of curr) {
        const exists = await prisma.account.findUnique({ where: { accNo }, select: { accNo: true } })
        if (!exists) continue

        const monthly = Math.max(0, cumAmt - (prevMap.get(accNo) ?? 0))

        await prisma.actualData.upsert({
          where:  { accNo_year_month: { accNo, year, month } },
          update: { amount: monthly, syncedAt: now },
          create: { accNo, year, month, amount: monthly, syncedAt: now },
        })
        synced++
      }
    }

    res.json({
      message:  `Data sebenar ${year} berjaya disegerakkan`,
      year,
      count:    synced,
      syncedAt: now,
    })
  } catch (err) {
    if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
      return res.status(503).json({ message: 'Tidak dapat sambung ke AutoCount API. Semak konfigurasi URL.' })
    }
    next(err)
  }
}

// ─── Status — bila terakhir sync ─────────────────────────────────────────────

export async function getSyncStatus(req, res, next) {
  try {
    const lastAccount = await prisma.account.findFirst({
      where:   { syncedAt: { not: null } },
      orderBy: { syncedAt: 'desc' },
      select:  { syncedAt: true },
    })

    const lastActual = await prisma.actualData.findFirst({
      orderBy: { syncedAt: 'desc' },
      select:  { syncedAt: true, year: true },
    })

    const accountCount = await prisma.account.count({ where: { syncedAt: { not: null } } })
    const actualCount  = await prisma.actualData.count()

    res.json({
      accounts: { lastSync: lastAccount?.syncedAt ?? null, count: accountCount },
      actuals:  { lastSync: lastActual?.syncedAt ?? null, year: lastActual?.year ?? null, count: actualCount },
      apiUrl:   process.env.AUTOCOUNT_API_URL,
    })
  } catch (err) { next(err) }
}
