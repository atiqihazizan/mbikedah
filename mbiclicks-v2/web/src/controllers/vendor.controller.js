import { z } from 'zod'
import prisma from '../lib/prisma.js'
import { logActivity } from '../utils/activityLog.js'

const vendorSchema = z.object({
  code:     z.string().min(1).max(20).regex(/^\S+$/, 'Kod tidak boleh mengandungi space'),
  name:     z.string().min(2).max(200),
  type:     z.enum(['VENDOR', 'STAFF']).default('VENDOR'),
  email:    z.string().email().max(100).optional().nullable(),
  phone:    z.string().max(20).optional().nullable(),
  address:  z.string().max(500).optional().nullable(),
  bankName: z.string().max(100).optional().nullable(),
  bankAcc:  z.string().max(50).optional().nullable(),
  accNo:    z.string().max(20).optional().nullable(),
})

const include = {
  account: { select: { accNo: true, name: true } },
}

export async function listVendors(req, res, next) {
  try {
    const { search, status, type, page = 1, limit = 100 } = req.query
    const pg  = Math.max(1, parseInt(page))
    const lim = Math.min(500, parseInt(limit) || 100)

    const where = {}
    if (status === 'active')   where.isActive = true
    if (status === 'inactive') where.isActive = false
    if (type) where.type = type.toUpperCase()
    if (search) {
      where.OR = [
        { code: { contains: search } },
        { name: { contains: search } },
        { bankAcc: { contains: search } },
      ]
    }

    const [total, data] = await Promise.all([
      prisma.vendor.count({ where }),
      prisma.vendor.findMany({
        where,
        include,
        orderBy: { name: 'asc' },
        skip: (pg - 1) * lim,
        take: lim,
      }),
    ])

    res.json({ data, total, page: pg, totalPages: Math.ceil(total / lim) })
  } catch (err) { next(err) }
}

export async function createVendor(req, res, next) {
  try {
    const body = vendorSchema.parse(req.body)
    const code = body.code.trim().toUpperCase().replace(/\s/g, '')

    const exists = await prisma.vendor.findUnique({ where: { code } })
    if (exists) return res.status(400).json({ message: `Kod ${code} sudah wujud` })

    if (body.accNo) {
      const acc = await prisma.account.findUnique({ where: { accNo: body.accNo } })
      if (!acc) return res.status(400).json({ message: `Kod akaun ${body.accNo} tidak dijumpai` })
    }

    const data = await prisma.vendor.create({ data: { ...body, code }, include })
    await logActivity({ userId: req.user.id, userName: req.user.name, action: 'CREATE', module: 'vendor', targetId: data.id, detail: `${code} — ${data.name}`, req })
    res.status(201).json({ data })
  } catch (err) { next(err) }
}

export async function updateVendor(req, res, next) {
  try {
    const id   = parseInt(req.params.id)
    const body = vendorSchema.parse(req.body)

    const existing = await prisma.vendor.findUnique({ where: { id } })
    if (!existing) return res.status(404).json({ message: 'Vendor tidak dijumpai' })

    if (body.accNo) {
      const acc = await prisma.account.findUnique({ where: { accNo: body.accNo } })
      if (!acc) return res.status(400).json({ message: `Kod akaun ${body.accNo} tidak dijumpai` })
    }

    const data = await prisma.vendor.update({ where: { id }, data: body, include })
    await logActivity({ userId: req.user.id, userName: req.user.name, action: 'UPDATE', module: 'vendor', targetId: id, detail: `${data.code} — ${data.name}`, req })
    res.json({ data })
  } catch (err) { next(err) }
}

export async function toggleVendor(req, res, next) {
  try {
    const id  = parseInt(req.params.id)
    const cur = await prisma.vendor.findUnique({ where: { id }, select: { isActive: true, code: true } })
    if (!cur) return res.status(404).json({ message: 'Vendor tidak dijumpai' })

    const data = await prisma.vendor.update({ where: { id }, data: { isActive: !cur.isActive } })
    await logActivity({ userId: req.user.id, userName: req.user.name, action: data.isActive ? 'ACTIVATE' : 'DEACTIVATE', module: 'vendor', targetId: id, detail: cur.code, req })
    res.json({ data: { id: data.id, isActive: data.isActive } })
  } catch (err) { next(err) }
}
