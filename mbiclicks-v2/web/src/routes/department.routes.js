import { Router } from 'express'
import { z } from 'zod'
import prisma from '../lib/prisma.js'
import { authenticate, requireRole } from '../middleware/auth.js'
import { logActivity } from '../utils/activityLog.js'

const router = Router()
router.use(authenticate, requireRole('admin'))

const deptSchema = z.object({
  code:     z.string().min(1).max(20),
  name:     z.string().min(2).max(100),
  parentId: z.number().int().positive().nullable().optional(),
  level:    z.number().int().min(0).optional(),
  sortOrder:z.number().int().min(0).optional(),
})

// GET /api/departments
router.get('/', async (req, res, next) => {
  try {
    const data = await prisma.department.findMany({
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      include: {
        parent: { select: { id: true, name: true } },
        _count: { select: { users: true } },
      },
    })
    res.json({ data })
  } catch (err) { next(err) }
})

// POST /api/departments
router.post('/', async (req, res, next) => {
  try {
    const body = deptSchema.parse(req.body)
    const code = body.code.trim().toUpperCase()

    const exists = await prisma.department.findUnique({ where: { code } })
    if (exists) return res.status(400).json({ message: `Kod jabatan ${code} sudah wujud` })

    const data = await prisma.department.create({
      data: {
        code,
        name:      body.name.trim(),
        parentId:  body.parentId ?? null,
        level:     body.level    ?? 0,
        sortOrder: body.sortOrder ?? 0,
      },
    })

    await logActivity({ userId: req.user.id, userName: req.user.name, action: 'CREATE', module: 'department', targetId: data.id, detail: data.name, req })
    res.status(201).json({ data })
  } catch (err) { next(err) }
})

// PUT /api/departments/:id
router.put('/:id', async (req, res, next) => {
  try {
    const id   = parseInt(req.params.id)
    const body = deptSchema.parse(req.body)
    const code = body.code.trim().toUpperCase()

    const conflict = await prisma.department.findFirst({ where: { code, NOT: { id } } })
    if (conflict) return res.status(400).json({ message: `Kod jabatan ${code} sudah digunakan` })

    const data = await prisma.department.update({
      where: { id },
      data: {
        code,
        name:      body.name.trim(),
        parentId:  body.parentId ?? null,
        level:     body.level    ?? 0,
        sortOrder: body.sortOrder ?? 0,
      },
    })

    await logActivity({ userId: req.user.id, userName: req.user.name, action: 'UPDATE', module: 'department', targetId: id, detail: data.name, req })
    res.json({ data })
  } catch (err) { next(err) }
})

// PATCH /api/departments/:id/toggle
router.patch('/:id/toggle', async (req, res, next) => {
  try {
    const id  = parseInt(req.params.id)
    const cur = await prisma.department.findUnique({ where: { id }, select: { isActive: true } })
    if (!cur) return res.status(404).json({ message: 'Jabatan tidak dijumpai' })

    const data = await prisma.department.update({ where: { id }, data: { isActive: !cur.isActive } })
    await logActivity({ userId: req.user.id, userName: req.user.name, action: data.isActive ? 'ACTIVATE' : 'DEACTIVATE', module: 'department', targetId: id, req })
    res.json({ data: { id: data.id, isActive: data.isActive } })
  } catch (err) { next(err) }
})

export default router
