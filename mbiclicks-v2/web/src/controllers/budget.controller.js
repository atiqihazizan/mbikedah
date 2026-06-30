import { z } from 'zod'
import prisma from '../lib/prisma.js'

// ─── Budget Years ─────────────────────────────────────────────────────────────

export async function listYears(req, res, next) {
  try {
    const years = await prisma.budgetYear.findMany({
      orderBy: { year: 'desc' },
      include: {
        _count: { select: { lines: true } },
        adjustments: { orderBy: { adjNo: 'desc' }, take: 1 },
      },
    })
    res.json(years)
  } catch (err) { next(err) }
}

export async function getYear(req, res, next) {
  try {
    const id = Number(req.params.id)
    const year = await prisma.budgetYear.findUniqueOrThrow({ where: { id } })
    res.json(year)
  } catch (err) { next(err) }
}

const createYearSchema = z.object({
  year: z.number().int().min(2020).max(2100),
  adjLimit: z.number().int().min(1).max(5).optional().default(2),
  nextBudgetMonth: z.number().int().min(1).max(12).optional().default(10),
})

export async function createYear(req, res, next) {
  try {
    const data = createYearSchema.parse(req.body)

    const existing = await prisma.budgetYear.findUnique({ where: { year: data.year } })
    if (existing) return res.status(409).json({ message: `Bajet tahun ${data.year} sudah wujud` })

    const active = await prisma.budgetYear.findFirst({ where: { status: 'ACTIVE' } })
    if (active && data.year <= active.year) {
      return res.status(400).json({
        message: `Hanya boleh draft bajet untuk tahun selepas ${active.year}`,
      })
    }

    const budgetYear = await prisma.budgetYear.create({ data })
    res.status(201).json(budgetYear)
  } catch (err) { next(err) }
}

export async function activateYear(req, res, next) {
  try {
    const id = Number(req.params.id)
    const target = await prisma.budgetYear.findUniqueOrThrow({ where: { id } })

    if (target.status !== 'DRAFT') {
      return res.status(400).json({ message: 'Hanya bajet DRAFT boleh diaktifkan' })
    }

    await prisma.$transaction(async (tx) => {
      // Tutup bajet yang sedang aktif
      await tx.budgetYear.updateMany({
        where: { status: 'ACTIVE' },
        data: { status: 'CLOSED', closedAt: new Date() },
      })
      // Aktifkan bajet baru
      await tx.budgetYear.update({
        where: { id },
        data: { status: 'ACTIVE', activatedAt: new Date() },
      })
    })

    const updated = await prisma.budgetYear.findUnique({ where: { id } })
    res.json(updated)
  } catch (err) { next(err) }
}

export async function closeYear(req, res, next) {
  try {
    const id = Number(req.params.id)
    const target = await prisma.budgetYear.findUniqueOrThrow({ where: { id } })

    if (target.status !== 'ACTIVE') {
      return res.status(400).json({ message: 'Hanya bajet ACTIVE boleh ditutup' })
    }

    const updated = await prisma.budgetYear.update({
      where: { id },
      data: { status: 'CLOSED', closedAt: new Date() },
    })
    res.json(updated)
  } catch (err) { next(err) }
}

// Init budget lines dari senarai accounts (panggil selepas createYear)
export async function initLines(req, res, next) {
  try {
    const budgetYearId = Number(req.params.id)
    const budgetYear = await prisma.budgetYear.findUniqueOrThrow({ where: { id: budgetYearId } })

    if (budgetYear.status === 'CLOSED') {
      return res.status(403).json({ message: 'Bajet ditutup tidak boleh di-init semula' })
    }

    const existingCount = await prisma.budgetLine.count({ where: { budgetYearId, version: 'ORIGINAL' } })
    if (existingCount > 0) {
      return res.status(409).json({ message: 'Lines sudah wujud untuk bajet ini' })
    }

    const accounts = await prisma.account.findMany({ where: { isActive: true } })
    const userId = req.user.id

    await prisma.budgetLine.createMany({
      data: accounts.map((acc) => ({
        budgetYearId,
        accNo: acc.accNo,
        version: 'ORIGINAL',
        createdBy: userId,
      })),
    })

    res.json({ message: `${accounts.length} baris bajet berjaya dibuat`, count: accounts.length })
  } catch (err) { next(err) }
}

// ─── Budget Lines ─────────────────────────────────────────────────────────────

export async function getLines(req, res, next) {
  try {
    const budgetYearId = Number(req.params.id)
    const { version = 'latest' } = req.query

    await prisma.budgetYear.findUniqueOrThrow({ where: { id: budgetYearId } })

    // Semua akaun (aktif dan tidak aktif) — user boleh set nilai untuk mana-mana
    const [allAccounts, childRows] = await Promise.all([
      prisma.account.findMany({ orderBy: { accNo: 'asc' } }),
      prisma.account.findMany({ where: { parentAccNo: { not: null } }, select: { parentAccNo: true } }),
    ])
    const groupAccNos = new Set(childRows.map((r) => r.parentAccNo).filter(Boolean))

    // Budget lines untuk tahun ini
    const allLines = await prisma.budgetLine.findMany({
      where: { budgetYearId },
      orderBy: [{ accNo: 'asc' }, { version: 'desc' }],
    })

    const versionOrder = { ADJ2: 3, ADJ1: 2, ORIGINAL: 1 }
    const latestMap = new Map()
    for (const line of allLines) {
      if (version !== 'latest' && line.version !== version) continue
      const existing = latestMap.get(line.accNo)
      if (!existing || versionOrder[line.version] > versionOrder[existing.version]) {
        latestMap.set(line.accNo, line)
      }
    }

    const zeroMonths = monthFields.reduce((o, m) => ({ ...o, [m]: 0 }), {})

    // Gabung — semua akaun, dengan nilai dari budget line jika ada, sifar jika tiada
    const result = allAccounts.map((acc) => {
      const isGroup = groupAccNos.has(acc.accNo)
      const line = latestMap.get(acc.accNo)
      if (line) {
        return { ...line, isGroup, account: acc }
      }
      return {
        id: null,
        budgetYearId,
        accNo: acc.accNo,
        version: 'ORIGINAL',
        ...zeroMonths,
        total: 0,
        isGroup,
        account: acc,
      }
    })

    res.json(result)
  } catch (err) { next(err) }
}

const monthFields = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec']

const saveLinesSchema = z.object({
  lines: z.array(z.object({
    accNo: z.string(),
    jan: z.number().default(0), feb: z.number().default(0),
    mar: z.number().default(0), apr: z.number().default(0),
    may: z.number().default(0), jun: z.number().default(0),
    jul: z.number().default(0), aug: z.number().default(0),
    sep: z.number().default(0), oct: z.number().default(0),
    nov: z.number().default(0), dec: z.number().default(0),
  })),
})

export async function saveLines(req, res, next) {
  try {
    const budgetYearId = Number(req.params.id)
    const budgetYear = await prisma.budgetYear.findUniqueOrThrow({ where: { id: budgetYearId } })

    if (budgetYear.status === 'CLOSED') {
      return res.status(403).json({ message: 'Bajet tahun lepas tidak boleh diedit (Read Only)' })
    }

    if (budgetYear.status === 'ACTIVE' && budgetYear.adjCount >= budgetYear.adjLimit) {
      return res.status(403).json({
        message: `Had adjustment (${budgetYear.adjLimit}x) telah dicapai`,
      })
    }

    const { lines } = saveLinesSchema.parse(req.body)

    // Tapis akaun kumpulan — akaun yang mempunyai anak tidak boleh ada nilai sendiri
    const childRows = await prisma.account.findMany({
      where: { parentAccNo: { not: null } },
      select: { parentAccNo: true },
    })
    const groupAccNos = new Set(childRows.map((r) => r.parentAccNo).filter(Boolean))
    const filteredLines = lines.filter((l) => !groupAccNos.has(l.accNo))

    // Tentukan versi berdasarkan status dan adjCount
    let version = 'ORIGINAL'
    if (budgetYear.status === 'ACTIVE') {
      const nextAdj = budgetYear.adjCount + 1
      version = nextAdj === 1 ? 'ADJ1' : 'ADJ2'
    }

    const userId = req.user.id

    await prisma.$transaction(async (tx) => {
      for (const line of filteredLines) {
        const total = monthFields.reduce((sum, m) => sum + (line[m] ?? 0), 0)
        await tx.budgetLine.upsert({
          where: { budgetYearId_accNo_version: { budgetYearId, accNo: line.accNo, version } },
          update: { ...line, total, createdBy: userId },
          create: { budgetYearId, accNo: line.accNo, version, ...line, total, createdBy: userId },
        })
      }

      // Kalau ACTIVE, rekod adjustment dan increment counter
      if (budgetYear.status === 'ACTIVE') {
        const adjNo = budgetYear.adjCount + 1
        await tx.budgetAdjustment.create({
          data: { budgetYearId, adjNo, adjustedById: userId },
        })
        await tx.budgetYear.update({
          where: { id: budgetYearId },
          data: { adjCount: { increment: 1 } },
        })
      }
    })

    const updated = await prisma.budgetYear.findUnique({ where: { id: budgetYearId } })
    res.json({ message: 'Bajet berjaya disimpan', budgetYear: updated })
  } catch (err) { next(err) }
}

// ─── Budget vs Actual Summary ─────────────────────────────────────────────────

export async function getSummary(req, res, next) {
  try {
    const budgetYearId = Number(req.params.id)
    const budgetYear = await prisma.budgetYear.findUniqueOrThrow({ where: { id: budgetYearId } })

    // Ambil latest budget lines
    const all = await prisma.budgetLine.findMany({
      where: { budgetYearId },
      include: { account: true },
    })
    const versionOrder = { ADJ2: 3, ADJ1: 2, ORIGINAL: 1 }
    const latestLines = new Map()
    for (const line of all) {
      const existing = latestLines.get(line.accNo)
      if (!existing || versionOrder[line.version] > versionOrder[existing.version]) {
        latestLines.set(line.accNo, line)
      }
    }

    // Ambil actual data untuk tahun ini
    const actuals = await prisma.actualData.findMany({
      where: { year: budgetYear.year },
    })
    const actualMap = new Map()
    for (const a of actuals) {
      const key = a.accNo
      if (!actualMap.has(key)) actualMap.set(key, { ...monthFields.reduce((o, m) => ({ ...o, [m]: 0 }), {}), total: 0 })
      const monthName = monthFields[a.month - 1]
      if (monthName) {
        actualMap.get(key)[monthName] += Number(a.amount)
        actualMap.get(key).total += Number(a.amount)
      }
    }

    const result = Array.from(latestLines.values()).map((line) => {
      const actual = actualMap.get(line.accNo) ?? {}
      return {
        accNo: line.accNo,
        accName: line.account.name,
        accType: line.account.accType,
        version: line.version,
        budget: monthFields.reduce((o, m) => ({ ...o, [m]: Number(line[m]) }), { total: Number(line.total) }),
        actual: monthFields.reduce((o, m) => ({ ...o, [m]: actual[m] ?? 0 }), { total: actual.total ?? 0 }),
      }
    })

    res.json({ budgetYear, lines: result })
  } catch (err) { next(err) }
}

// ─── Adjustment History ───────────────────────────────────────────────────────

export async function getAdjustments(req, res, next) {
  try {
    const budgetYearId = Number(req.params.id)
    const adjustments = await prisma.budgetAdjustment.findMany({
      where: { budgetYearId },
      include: {
        adjustedBy: { select: { id: true, name: true } },
        approvedBy: { select: { id: true, name: true } },
      },
      orderBy: { adjNo: 'asc' },
    })
    res.json(adjustments)
  } catch (err) { next(err) }
}

// Finance / Admin boleh update adjLimit pada tahun yang belum CLOSED
export async function updateConfig(req, res, next) {
  try {
    const id = Number(req.params.id)
    const { adjLimit } = z.object({
      adjLimit: z.number().int().min(1).max(10),
    }).parse(req.body)

    const year = await prisma.budgetYear.findUniqueOrThrow({ where: { id } })
    if (year.status === 'CLOSED') {
      return res.status(400).json({ message: 'Bajet sudah ditutup, tidak boleh dikonfigurasi' })
    }
    if (adjLimit < year.adjCount) {
      return res.status(400).json({
        message: `Had pindaan tidak boleh kurang dari bilangan pindaan semasa (${year.adjCount})`,
      })
    }

    const updated = await prisma.budgetYear.update({
      where: { id },
      data: { adjLimit },
    })
    res.json({ message: 'Konfigurasi bajet dikemaskini', data: updated })
  } catch (err) { next(err) }
}

// ─── Delete Budget Year (DRAFT sahaja) ───────────────────────────────────────

export async function deleteYear(req, res, next) {
  try {
    const id = Number(req.params.id)
    const year = await prisma.budgetYear.findUniqueOrThrow({ where: { id } })

    if (year.status !== 'DRAFT') {
      return res.status(400).json({ message: 'Hanya bajet DRAF boleh dipadam' })
    }

    await prisma.budgetYear.delete({ where: { id } })
    res.json({ message: `Bajet ${year.year} berjaya dipadam` })
  } catch (err) { next(err) }
}

// ─── Active Belanja — untuk dropdown permohonan ───────────────────────────────

export async function getActiveBelanja(req, res, next) {
  try {
    const activeYear = await prisma.budgetYear.findFirst({ where: { status: 'ACTIVE' } })
    if (!activeYear) return res.json({ budgetYear: null, lines: [] })

    const all = await prisma.budgetLine.findMany({
      where: { budgetYearId: activeYear.id, account: { isActive: true } },
      include: { account: { select: { accNo: true, name: true, accType: true, level: true, parentAccNo: true } } },
    })

    // Ambil versi terkini setiap akaun
    const versionOrder = { ADJ2: 3, ADJ1: 2, ORIGINAL: 1 }
    const latestMap = new Map()
    for (const line of all) {
      const existing = latestMap.get(line.accNo)
      if (!existing || versionOrder[line.version] > versionOrder[existing.version]) {
        latestMap.set(line.accNo, line)
      }
    }

    const yearStart = new Date(activeYear.year, 0, 1)
    const yearEnd   = new Date(activeYear.year + 1, 0, 1)
    const PURE_PENDING = [
      'PENDING_HOD', 'PENDING_CEO', 'PENDING_FINANCE_CHECK',
      'PENDING_FINANCE_VERIFY', 'PENDING_FINANCE_APPROVAL', 'PENDING_CEO_FINAL',
    ]

    // Bayaran yang sudah dibayar (PARTIAL_PAID/PAID/CLOSED) — agihkan proportional per accNo
    const paidBillings = await prisma.billing.findMany({
      where: {
        isDeleted: false,
        status: { in: ['PARTIAL_PAID', 'PAID', 'CLOSED'] },
        createdAt: { gte: yearStart, lt: yearEnd },
        payments: { some: { paidAt: { not: null } } },
      },
      include: {
        items:    { where: { isDeleted: false, accNo: { not: null } } },
        payments: { where: { paidAt: { not: null } } },
      },
    }).catch(() => [])

    const spentMap = new Map()
    for (const billing of paidBillings) {
      const billingTotal = billing.items.reduce((s, i) => s + Number(i.amount), 0)
      if (billingTotal === 0) continue
      const paidTotal = billing.payments.reduce((s, p) => s + Number(p.amount), 0)
      for (const item of billing.items) {
        if (!item.accNo) continue
        const itemPaid = paidTotal * (Number(item.amount) / billingTotal)
        spentMap.set(item.accNo, (spentMap.get(item.accNo) ?? 0) + itemPaid)
      }
    }

    // Tertangguh 1: PURE_PENDING — jumlah penuh
    const pendingItems = await prisma.billingItem.findMany({
      where: {
        isDeleted: false, accNo: { not: null },
        billing: { status: { in: PURE_PENDING }, isDeleted: false, createdAt: { gte: yearStart, lt: yearEnd } },
      },
      select: { accNo: true, amount: true },
    }).catch(() => [])

    const pendingMap = new Map()
    for (const item of pendingItems) {
      if (!item.accNo) continue
      pendingMap.set(item.accNo, (pendingMap.get(item.accNo) ?? 0) + Number(item.amount))
    }

    // Tertangguh 2: APPROVED/PARTIAL_PAID — baki belum bayar sahaja
    const payableBillings = await prisma.billing.findMany({
      where: {
        isDeleted: false,
        status: { in: ['APPROVED', 'PARTIAL_PAID'] },
        createdAt: { gte: yearStart, lt: yearEnd },
      },
      include: {
        items:    { where: { isDeleted: false, accNo: { not: null } } },
        payments: { where: { paidAt: { not: null } } },
      },
    }).catch(() => [])

    const remainingMap = new Map()
    for (const billing of payableBillings) {
      const billingTotal = billing.items.reduce((s, i) => s + Number(i.amount), 0)
      if (billingTotal === 0) continue
      const paidTotal  = billing.payments.reduce((s, p) => s + Number(p.amount), 0)
      const remaining  = billingTotal - paidTotal
      for (const item of billing.items) {
        if (!item.accNo) continue
        const itemRemaining = remaining * (Number(item.amount) / billingTotal)
        remainingMap.set(item.accNo, (remainingMap.get(item.accNo) ?? 0) + itemRemaining)
      }
    }

    const lines = Array.from(latestMap.values())
      .filter((l) => l.account.accType === 'BELANJA')
      .map((l) => {
        const peruntukan  = Number(l.total)
        const digunakan   = spentMap.get(l.accNo) ?? 0
        const tertangguh  = (pendingMap.get(l.accNo) ?? 0) + (remainingMap.get(l.accNo) ?? 0)
        const baki        = peruntukan - digunakan - tertangguh
        return {
          accNo:      l.accNo,
          name:       l.account.name,
          level:      l.account.level,
          parentAccNo: l.account.parentAccNo,
          peruntukan,
          digunakan,
          tertangguh,
          baki,
        }
      })
      .sort((a, b) => a.accNo.localeCompare(b.accNo))

    res.json({ budgetYear: activeYear, lines })
  } catch (err) { next(err) }
}

// ─── Laporan Bajet — 4 sheet ──────────────────────────────────────────────────

export async function getReport(req, res, next) {
  try {
    const budgetYearId = Number(req.params.id)
    const [byRaw] = await prisma.$queryRaw`
      SELECT id, year, status, adj_count, adj_limit, next_budget_month,
             baki_awal, tabungan_khas, deposit_simpanan_tetap, deposit_simpanan_tetap_sebenar,
             activated_at, closed_at, created_at, updated_at
      FROM budget_years WHERE id = ${budgetYearId}
    `
    if (!byRaw) return res.status(404).json({ message: 'Bajet tidak dijumpai' })
    const budgetYear = {
      id: byRaw.id, year: Number(byRaw.year), status: byRaw.status,
      adjCount: byRaw.adj_count, adjLimit: byRaw.adj_limit,
      nextBudgetMonth: byRaw.next_budget_month,
      bakiAwal: Number(byRaw.baki_awal ?? 0),
      tabunganKhas: Number(byRaw.tabungan_khas ?? 0),
      depositSimpananTetap: Number(byRaw.deposit_simpanan_tetap ?? 0),
      depositSimpananTetapSebenar: Number(byRaw.deposit_simpanan_tetap_sebenar ?? 0),
      activatedAt: byRaw.activated_at, closedAt: byRaw.closed_at,
    }

    // Semua akaun — termasuk group account yang tiada budget line sendiri
    const [allAccounts, allLines] = await Promise.all([
      prisma.account.findMany({ orderBy: { accNo: 'asc' } }),
      prisma.budgetLine.findMany({ where: { budgetYearId } }),
    ])

    const versionOrder = { ADJ2: 3, ADJ1: 2, ORIGINAL: 1 }
    const latestMap = new Map()
    for (const line of allLines) {
      const existing = latestMap.get(line.accNo)
      if (!existing || versionOrder[line.version] > versionOrder[existing.version]) {
        latestMap.set(line.accNo, line)
      }
    }

    // Filter hingga bulan semasa sahaja (Jan–bulan semasa tahun aktif)
    const now          = new Date()
    const currentMonth = budgetYear.status === 'ACTIVE' ? now.getMonth() + 1 : 12  // bulan 1–12
    const cutoffDate   = new Date(budgetYear.year, currentMonth, 1)  // awal bulan SELEPAS bulan semasa

    // Actual data — per month per accNo, hingga bulan semasa
    const actuals = await prisma.actualData.findMany({
      where: { year: budgetYear.year, month: { lte: currentMonth } },
    })
    const actualMonthMap = new Map()
    for (const a of actuals) {
      if (!actualMonthMap.has(a.accNo)) {
        actualMonthMap.set(a.accNo, { jan:0,feb:0,mar:0,apr:0,may:0,jun:0,jul:0,aug:0,sep:0,oct:0,nov:0,dec:0 })
      }
      const monthName = monthFields[a.month - 1]
      if (monthName) actualMonthMap.get(a.accNo)[monthName] += Number(a.amount)
    }

    // Bayaran dibuat dalam app — hanya jumlah yang sudah dibayar, proportional per accNo
    const paidBillingsReport = await prisma.billing.findMany({
      where: {
        isDeleted: false,
        status: { in: ['PARTIAL_PAID', 'PAID', 'CLOSED'] },
        createdAt: { gte: new Date(budgetYear.year, 0, 1), lt: cutoffDate },
        payments: { some: { paidAt: { not: null } } },
      },
      include: {
        items:    { where: { isDeleted: false, accNo: { not: null } } },
        payments: { where: { paidAt: { not: null } } },
      },
    }).catch(() => [])
    const spentMap = new Map()
    for (const billing of paidBillingsReport) {
      const billingTotal = billing.items.reduce((s, i) => s + Number(i.amount), 0)
      if (billingTotal === 0) continue
      const paidTotal = billing.payments.reduce((s, p) => s + Number(p.amount), 0)
      for (const item of billing.items) {
        if (!item.accNo) continue
        const itemPaid = paidTotal * (Number(item.amount) / billingTotal)
        spentMap.set(item.accNo, (spentMap.get(item.accNo) ?? 0) + itemPaid)
      }
    }

    const zeroMonths = monthFields.reduce((o, m) => ({ ...o, [m]: 0 }), {})

    // Gabung semua akaun dengan budget line — sifar jika tiada line
    const lineMap = new Map()
    for (const acc of allAccounts) {
      const l            = latestMap.get(acc.accNo)
      const actualMonths = actualMonthMap.get(acc.accNo) ?? {}
      lineMap.set(acc.accNo, {
        accNo:       acc.accNo,
        name:        acc.name,
        accType:     acc.accType,
        level:       acc.level,
        parentAccNo: acc.parentAccNo,
        peruntukan:  l ? Number(l.total) : 0,
        sebenar:     monthFields.reduce((s, m) => s + (actualMonths[m] ?? 0), 0),
        permohonan:  spentMap.get(acc.accNo) ?? 0,
        bajetMonths: l ? monthFields.reduce((o, m) => ({ ...o, [m]: Number(l[m] ?? 0) }), {}) : { ...zeroMonths },
        actualMonths,
      })
    }

    // Bottom-up aggregation — group account dapat nilai dari jumlah children
    // Sort terbalik supaya children diproses sebelum parent
    const sorted = [...lineMap.values()].sort((a, b) => b.accNo.localeCompare(a.accNo))
    for (const row of sorted) {
      if (!row.parentAccNo) continue
      const parent = lineMap.get(row.parentAccNo)
      if (!parent) continue
      parent.peruntukan  += row.peruntukan
      parent.sebenar     += row.sebenar
      parent.permohonan  += row.permohonan
      for (const m of monthFields) {
        parent.bajetMonths[m]  = (parent.bajetMonths[m]  ?? 0) + (row.bajetMonths[m]  ?? 0)
        parent.actualMonths[m] = (parent.actualMonths[m] ?? 0) + (row.actualMonths[m] ?? 0)
      }
    }

    const lines = [...lineMap.values()]
      .map((row) => ({ ...row, baki: row.peruntukan - row.permohonan }))
      .sort((a, b) => a.accNo.localeCompare(b.accNo))

    // Tahun-tahun lepas (max 2 tahun sebelum tahun semasa)
    const allYears = await prisma.budgetYear.findMany({ orderBy: { year: 'asc' } })
    const prevBudgetYears = allYears.filter((y) => y.year < budgetYear.year).slice(-2)

    const prevYears = []
    for (const py of prevBudgetYears) {
      const pyLines = await prisma.budgetLine.findMany({
        where: { budgetYearId: py.id },
        select: { accNo: true, version: true, total: true },
      })
      const pyMap = new Map()
      for (const l of pyLines) {
        const ex = pyMap.get(l.accNo)
        if (!ex || versionOrder[l.version] > versionOrder[ex.version]) pyMap.set(l.accNo, l)
      }
      const pyActuals = await prisma.actualData.findMany({
        where: { year: py.year },
        select: { accNo: true, amount: true },
      })
      const pyActualMap = new Map()
      for (const a of pyActuals) pyActualMap.set(a.accNo, (pyActualMap.get(a.accNo) ?? 0) + Number(a.amount))

      const byAccNo = {}
      for (const [accNo, l] of pyMap) {
        byAccNo[accNo] = { bajet: Number(l.total), sebenar: pyActualMap.get(accNo) ?? 0 }
      }
      // Include accounts that only have actuals (no budget line)
      for (const [accNo, amt] of pyActualMap) {
        if (!byAccNo[accNo]) byAccNo[accNo] = { bajet: 0, sebenar: amt }
      }
      prevYears.push({ year: py.year, byAccNo })
    }

    res.json({ budgetYear, lines, prevYears, currentMonth })
  } catch (err) { next(err) }
}
