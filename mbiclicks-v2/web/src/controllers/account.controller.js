import axios from 'axios'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { z } from 'zod'
import prisma from '../lib/prisma.js'
import { logActivity } from '../utils/activityLog.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

// ─── List ─────────────────────────────────────────────────────────────────────

export async function listAccounts(req, res, next) {
  try {
    const { type, search, status, page = 1, limit = 100 } = req.query
    const pg  = Math.max(1, parseInt(page))
    const lim = Math.min(2000, parseInt(limit) || 100)

    const where = {}
    if (type)   where.accType  = type.toUpperCase()
    if (status === 'active')   where.isActive = true
    if (status === 'inactive') where.isActive = false
    if (search) {
      where.OR = [
        { accNo: { contains: search } },
        { name:  { contains: search } },
      ]
    }

    // where tanpa filter type — untuk kiraan keseluruhan hasil/belanja
    const whereBase = {}
    if (status === 'active')   whereBase.isActive = true
    if (status === 'inactive') whereBase.isActive = false
    if (search) whereBase.OR = where.OR

    const [total, data, totalHasil, totalBelanja, childRows] = await Promise.all([
      prisma.account.count({ where }),
      prisma.account.findMany({
        where,
        orderBy: [{ accType: 'asc' }, { accNo: 'asc' }],
        skip: (pg - 1) * lim,
        take: lim,
      }),
      prisma.account.count({ where: { ...whereBase, accType: 'HASIL' } }),
      prisma.account.count({ where: { ...whereBase, accType: 'BELANJA' } }),
      prisma.account.findMany({ where: { parentAccNo: { not: null } }, select: { parentAccNo: true } }),
    ])

    const groupSet = new Set(childRows.map((r) => r.parentAccNo).filter(Boolean))
    const dataWithGroup = data.map((a) => ({ ...a, isGroup: groupSet.has(a.accNo) }))

    res.json({ data: dataWithGroup, total, page: pg, totalPages: Math.ceil(total / lim), totalHasil, totalBelanja })
  } catch (err) { next(err) }
}

// ─── Create ───────────────────────────────────────────────────────────────────

const accSchema = z.object({
  accNo:       z.string().min(1).max(20),
  name:        z.string().min(2).max(200),
  accType:     z.enum(['HASIL', 'BELANJA']),
  parentAccNo: z.string().max(20).nullable().optional(),
  level:       z.number().int().min(0).optional(),
})

export async function createAccount(req, res, next) {
  try {
    const body  = accSchema.parse(req.body)
    const accNo = body.accNo.trim().toUpperCase()

    const exists = await prisma.account.findUnique({ where: { accNo } })
    if (exists) return res.status(400).json({ message: `Kod akaun ${accNo} sudah wujud` })

    if (body.parentAccNo) {
      const parent = await prisma.account.findUnique({ where: { accNo: body.parentAccNo } })
      if (!parent) return res.status(400).json({ message: `Kod induk ${body.parentAccNo} tidak dijumpai dalam sistem` })
      if (parent.accType !== body.accType) {
        return res.status(400).json({ message: `Jenis akaun mesti sama dengan induk (${parent.accType})` })
      }
    }

    const data = await prisma.account.create({
      data: {
        accNo,
        name:        body.name.trim(),
        accType:     body.accType,
        parentAccNo: body.parentAccNo?.trim() || null,
        level:       body.level ?? 0,
      },
    })

    await logActivity({ userId: req.user.id, userName: req.user.name, action: 'CREATE', module: 'account', targetId: data.id, detail: `${accNo} — ${data.name}`, req })
    res.status(201).json({ data })
  } catch (err) { next(err) }
}

// ─── Update ───────────────────────────────────────────────────────────────────

export async function updateAccount(req, res, next) {
  try {
    const id       = parseInt(req.params.id)
    const body     = accSchema.parse(req.body)
    const existing = await prisma.account.findUnique({ where: { id } })
    if (!existing) return res.status(404).json({ message: 'Kod akaun tidak dijumpai' })

    if (body.parentAccNo) {
      if (body.parentAccNo === existing.accNo) {
        return res.status(400).json({ message: 'Kod akaun tidak boleh menjadi induk kepada dirinya sendiri' })
      }
      const parent = await prisma.account.findUnique({ where: { accNo: body.parentAccNo } })
      if (!parent) return res.status(400).json({ message: `Kod induk ${body.parentAccNo} tidak dijumpai dalam sistem` })
      if (parent.accType !== body.accType) {
        return res.status(400).json({ message: `Jenis akaun mesti sama dengan induk (${parent.accType})` })
      }
    }

    const data = await prisma.account.update({
      where: { id },
      data: {
        name:        body.name.trim(),
        accType:     body.accType,
        parentAccNo: body.parentAccNo?.trim() || null,
        level:       body.level ?? existing.level,
      },
    })

    await logActivity({ userId: req.user.id, userName: req.user.name, action: 'UPDATE', module: 'account', targetId: id, detail: `${data.accNo} — ${data.name}`, req })
    res.json({ data })
  } catch (err) { next(err) }
}

// ─── Toggle active ────────────────────────────────────────────────────────────

export async function toggleAccount(req, res, next) {
  try {
    const id  = parseInt(req.params.id)
    const cur = await prisma.account.findUnique({ where: { id }, select: { isActive: true, accNo: true } })
    if (!cur) return res.status(404).json({ message: 'Kod akaun tidak dijumpai' })

    const data = await prisma.account.update({ where: { id }, data: { isActive: !cur.isActive } })
    await logActivity({ userId: req.user.id, userName: req.user.name, action: data.isActive ? 'ACTIVATE' : 'DEACTIVATE', module: 'account', targetId: id, detail: cur.accNo, req })
    res.json({ data: { id: data.id, isActive: data.isActive } })
  } catch (err) { next(err) }
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export async function deleteAccount(req, res, next) {
  try {
    const id  = parseInt(req.params.id)
    const acc = await prisma.account.findUnique({
      where: { id },
      include: { _count: { select: { budgetLines: true, billingItems: true, actualData: true } } },
    })
    if (!acc) return res.status(404).json({ message: 'Kod akaun tidak dijumpai' })

    const childCount = await prisma.account.count({ where: { parentAccNo: acc.accNo } })
    if (childCount > 0) {
      return res.status(400).json({ message: `Kod akaun ${acc.accNo} mempunyai ${childCount} akaun anak. Padamkan akaun anak dahulu sebelum memadam induk.` })
    }

    const used = acc._count.budgetLines + acc._count.billingItems + acc._count.actualData
    if (used > 0) {
      return res.status(400).json({ message: `Kod akaun ${acc.accNo} sedang digunakan dalam ${used} rekod. Nyahaktifkan sahaja.` })
    }

    await prisma.account.delete({ where: { id } })
    await logActivity({ userId: req.user.id, userName: req.user.name, action: 'DELETE', module: 'account', targetId: id, detail: `${acc.accNo} — ${acc.name}`, req })
    res.json({ message: 'Kod akaun berjaya dipadam' })
  } catch (err) { next(err) }
}

// ─── Sync from AutoCount ─────────────────────────────────────────────────────

const AC_TYPE_MAP = { SL: 'HASIL', OI: 'HASIL', EP: 'BELANJA' }

function mapAccType(autocountType) {
  return AC_TYPE_MAP[autocountType] ?? null
}

function deriveLevel(accNo, parentAccNo) {
  if (!parentAccNo) return 0
  const subCode = accNo.split('/')[1] ?? '000'
  return subCode === '000' ? 1 : 2
}

export async function syncFromAutocount(req, res, next) {
  try {
    const AUTOCOUNT_URL = process.env.AUTOCOUNT_API_URL ?? 'http://localhost:3000'
    const AUTOCOUNT_KEY = process.env.AUTOCOUNT_API_KEY ?? ''

    let response
    try {
      response = await axios.get(`${AUTOCOUNT_URL}/api/gl/accounts`, {
        timeout: 15000,
        headers: { ...(AUTOCOUNT_KEY ? { 'X-API-Key': AUTOCOUNT_KEY } : {}) },
      })
    } catch (err) {
      return res.status(503).json({ message: 'webApi-autocount tidak dapat dihubungi', detail: err.message })
    }

    const rawList = response.data?.data
    if (!Array.isArray(rawList)) {
      return res.status(502).json({ message: 'Format response AutoCount tidak dijangka' })
    }

    const schema = z.array(z.object({
      accountCode:  z.string(),
      accountName:  z.string(),
      accountType:  z.string(),
      parentAccNo:  z.string().nullable().optional(),
      currencyCode: z.string().optional(),
    }))

    const parsed = schema.safeParse(rawList)
    if (!parsed.success) {
      return res.status(502).json({ message: 'Data AutoCount tidak sah', errors: parsed.error.flatten() })
    }

    let inserted = 0, updated = 0, skipped = 0

    await prisma.$transaction(async (tx) => {
      for (const acc of parsed.data) {
        const accType = mapAccType(acc.accountType)
        if (!accType) { skipped++; continue } // skip FA, CA, CL dll

        const level    = deriveLevel(acc.accountCode, acc.parentAccNo ?? null)
        const existing = await tx.account.findUnique({ where: { accNo: acc.accountCode } })

        if (!existing) {
          await tx.account.create({
            data: { accNo: acc.accountCode, name: acc.accountName, accType, parentAccNo: acc.parentAccNo ?? null, level, isActive: true, syncedAt: new Date() },
          })
          inserted++
        } else {
          await tx.account.update({
            where: { accNo: acc.accountCode },
            data:  { name: acc.accountName, accType, parentAccNo: acc.parentAccNo ?? null, level, isActive: true, syncedAt: new Date() },
          })
          updated++
        }
      }
    })

    await prisma.syncLog.create({
      data: { syncType: 'accounts', status: 'success', recordsCount: parsed.data.length },
    })

    await logActivity({ userId: req.user.id, userName: req.user.name, action: 'SYNC', module: 'account', detail: `Inserted:${inserted} Updated:${updated} Skipped:${skipped}`, req })
    res.json({ message: 'Sync kod akaun berjaya', inserted, updated, skipped, total: parsed.data.length })
  } catch (err) {
    await prisma.syncLog.create({
      data: { syncType: 'accounts', status: 'error', recordsCount: 0, errorMsg: err.message },
    }).catch(() => {})
    next(err)
  }
}

// ─── Sync from local JSON file ────────────────────────────────────────────────

export async function syncFromFile(req, res, next) {
  try {
    const filePath = resolve(__dirname, '../../../../account.json')
    let rawList
    try {
      const content = readFileSync(filePath, 'utf8')
      const parsed = JSON.parse(content)
      rawList = parsed.data ?? parsed
    } catch {
      return res.status(404).json({ message: 'File account.json tidak dijumpai dalam server' })
    }

    if (!Array.isArray(rawList)) {
      return res.status(400).json({ message: 'Format file account.json tidak sah' })
    }

    const schema = z.array(z.object({
      accountCode:  z.string(),
      accountName:  z.string(),
      accountType:  z.string(),
      parentAccNo:  z.string().nullable().optional(),
      currencyCode: z.string().optional(),
    }))

    const result = schema.safeParse(rawList)
    if (!result.success) {
      return res.status(400).json({ message: 'Data dalam file tidak sah', errors: result.error.flatten() })
    }

    let inserted = 0, updated = 0, skipped = 0

    await prisma.$transaction(async (tx) => {
      for (const acc of result.data) {
        const accType = mapAccType(acc.accountType)
        if (!accType) { skipped++; continue }

        const level    = deriveLevel(acc.accountCode, acc.parentAccNo ?? null)
        const existing = await tx.account.findUnique({ where: { accNo: acc.accountCode } })

        if (!existing) {
          await tx.account.create({
            data: { accNo: acc.accountCode, name: acc.accountName, accType, parentAccNo: acc.parentAccNo ?? null, level, isActive: true, syncedAt: new Date() },
          })
          inserted++
        } else {
          await tx.account.update({
            where: { accNo: acc.accountCode },
            data:  { name: acc.accountName, accType, parentAccNo: acc.parentAccNo ?? null, level, isActive: true, syncedAt: new Date() },
          })
          updated++
        }
      }
    })

    await prisma.syncLog.create({
      data: { syncType: 'accounts_file', status: 'success', recordsCount: result.data.length },
    })

    await logActivity({ userId: req.user.id, userName: req.user.name, action: 'SYNC', module: 'account', detail: `File JSON — Inserted:${inserted} Updated:${updated} Skipped:${skipped}`, req })
    res.json({ message: 'Sync dari file berjaya', inserted, updated, skipped, total: result.data.length })
  } catch (err) {
    await prisma.syncLog.create({
      data: { syncType: 'accounts_file', status: 'error', recordsCount: 0, errorMsg: err.message },
    }).catch(() => {})
    next(err)
  }
}
