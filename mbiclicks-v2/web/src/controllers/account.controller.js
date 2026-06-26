import axios from 'axios'
import { z } from 'zod'
import prisma from '../lib/prisma.js'

export async function listAccounts(req, res, next) {
  try {
    const { type } = req.query
    const accounts = await prisma.account.findMany({
      where: {
        isActive: true,
        ...(type ? { accType: type.toUpperCase() } : {}),
      },
      orderBy: [{ accType: 'asc' }, { accNo: 'asc' }],
    })
    res.json(accounts)
  } catch (err) { next(err) }
}

// AutoCount accountType → MBI accType
function mapAccType(autocountType) {
  if (autocountType === 'I') return 'HASIL'
  // X (Expense), A (Asset), L (Liability), E (Equity) → semua BELANJA untuk MBI
  return 'BELANJA'
}

// Derive level dari struktur AccNo (contoh: "5000/000"=0, "5001/000"=1, "5001/101"=2)
// Atau dari parentAccNo — jika ada parent, level = parent.level + 1
function deriveLevel(accNo, parentAccNo) {
  if (!parentAccNo) return 0
  // Heuristic: jika sub-code bukan /000, kemungkinan level 2
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
        headers: {
          ...(AUTOCOUNT_KEY ? { 'X-API-Key': AUTOCOUNT_KEY } : {}),
        },
      })
    } catch (err) {
      return res.status(503).json({
        message: 'webApi-autocount tidak dapat dihubungi',
        detail: err.message,
      })
    }

    // Response format: { success, data: [{accountCode, accountName, accountType, parentAccNo, currencyCode}] }
    const rawList = response.data?.data
    if (!Array.isArray(rawList)) {
      return res.status(502).json({ message: 'Format response AutoCount tidak dijangka' })
    }

    const schema = z.array(z.object({
      accountCode: z.string(),
      accountName: z.string(),
      accountType: z.string(),
      parentAccNo: z.string().nullable().optional(),
      currencyCode: z.string().optional(),
    }))

    const parsed = schema.safeParse(rawList)
    if (!parsed.success) {
      return res.status(502).json({
        message: 'Data AutoCount tidak sah',
        errors: parsed.error.flatten(),
      })
    }

    let inserted = 0
    let updated = 0
    let skipped = 0

    await prisma.$transaction(async (tx) => {
      for (const acc of parsed.data) {
        const accType = mapAccType(acc.accountType)
        const level = deriveLevel(acc.accountCode, acc.parentAccNo ?? null)

        const existing = await tx.account.findUnique({ where: { accNo: acc.accountCode } })

        if (!existing) {
          await tx.account.create({
            data: {
              accNo: acc.accountCode,
              name: acc.accountName,
              accType,
              parentAccNo: acc.parentAccNo ?? null,
              level,
              syncedAt: new Date(),
            },
          })
          inserted++
        } else {
          // Update jika nama atau type berbeza
          const nameChanged = existing.name !== acc.accountName
          const typeChanged = existing.accType !== accType
          if (nameChanged || typeChanged) {
            await tx.account.update({
              where: { accNo: acc.accountCode },
              data: {
                name: acc.accountName,
                accType,
                syncedAt: new Date(),
              },
            })
            updated++
          } else {
            skipped++
          }
        }
      }
    })

    await prisma.syncLog.create({
      data: {
        syncType: 'accounts',
        status: 'success',
        recordsCount: parsed.data.length,
      },
    })

    res.json({
      message: 'Sync kod akaun berjaya',
      inserted,
      updated,
      skipped,
      total: parsed.data.length,
    })
  } catch (err) {
    await prisma.syncLog.create({
      data: {
        syncType: 'accounts',
        status: 'error',
        recordsCount: 0,
        errorMsg: err.message,
      },
    }).catch(() => {})
    next(err)
  }
}
