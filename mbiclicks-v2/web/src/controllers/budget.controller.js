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

    if (version === 'latest') {
      // Untuk setiap accNo, ambil versi terkini (ADJ2 > ADJ1 > ORIGINAL)
      const all = await prisma.budgetLine.findMany({
        where: { budgetYearId },
        include: { account: true },
        orderBy: [{ accNo: 'asc' }, { version: 'desc' }],
      })

      const latest = new Map()
      const versionOrder = { ADJ2: 3, ADJ1: 2, ORIGINAL: 1 }
      for (const line of all) {
        const existing = latest.get(line.accNo)
        if (!existing || versionOrder[line.version] > versionOrder[existing.version]) {
          latest.set(line.accNo, line)
        }
      }
      return res.json(Array.from(latest.values()))
    }

    const lines = await prisma.budgetLine.findMany({
      where: { budgetYearId, version },
      include: { account: true },
      orderBy: { accNo: 'asc' },
    })
    res.json(lines)
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

    // Tentukan versi berdasarkan status dan adjCount
    let version = 'ORIGINAL'
    if (budgetYear.status === 'ACTIVE') {
      const nextAdj = budgetYear.adjCount + 1
      version = nextAdj === 1 ? 'ADJ1' : 'ADJ2'
    }

    const userId = req.user.id

    await prisma.$transaction(async (tx) => {
      for (const line of lines) {
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
