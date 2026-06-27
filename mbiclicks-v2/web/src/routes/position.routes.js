import { Router } from 'express'
import { z } from 'zod'
import prisma from '../lib/prisma.js'
import { authenticate, requireRole } from '../middleware/auth.js'
import { logActivity } from '../utils/activityLog.js'

const router = Router()
router.use(authenticate, requireRole('admin'))

const posSchema = z.object({
  code:  z.string().min(1).max(20),
  name:  z.string().min(2).max(100),
  level: z.number().int().min(0).optional(),
})

// GET /api/positions
router.get('/', async (req, res, next) => {
  try {
    const data = await prisma.position.findMany({
      orderBy: [{ level: 'desc' }, { name: 'asc' }],
      include: { _count: { select: { users: true } } },
    })
    res.json({ data })
  } catch (err) { next(err) }
})

// POST /api/positions
router.post('/', async (req, res, next) => {
  try {
    const body = posSchema.parse(req.body)
    const code = body.code.trim().toUpperCase()

    const exists = await prisma.position.findUnique({ where: { code } })
    if (exists) return res.status(400).json({ message: `Kod jawatan ${code} sudah wujud` })

    const data = await prisma.position.create({
      data: { code, name: body.name.trim(), level: body.level ?? 0 },
    })

    await logActivity({ userId: req.user.id, userName: req.user.name, action: 'CREATE', module: 'position', targetId: data.id, detail: data.name, req })
    res.status(201).json({ data })
  } catch (err) { next(err) }
})

// PUT /api/positions/:id
router.put('/:id', async (req, res, next) => {
  try {
    const id   = parseInt(req.params.id)
    const body = posSchema.parse(req.body)
    const code = body.code.trim().toUpperCase()

    const conflict = await prisma.position.findFirst({ where: { code, NOT: { id } } })
    if (conflict) return res.status(400).json({ message: `Kod jawatan ${code} sudah digunakan` })

    const data = await prisma.position.update({
      where: { id },
      data: { code, name: body.name.trim(), level: body.level ?? 0 },
    })

    await logActivity({ userId: req.user.id, userName: req.user.name, action: 'UPDATE', module: 'position', targetId: id, detail: data.name, req })
    res.json({ data })
  } catch (err) { next(err) }
})

// PATCH /api/positions/:id/toggle
router.patch('/:id/toggle', async (req, res, next) => {
  try {
    const id  = parseInt(req.params.id)
    const cur = await prisma.position.findUnique({ where: { id }, select: { isActive: true } })
    if (!cur) return res.status(404).json({ message: 'Jawatan tidak dijumpai' })

    const data = await prisma.position.update({ where: { id }, data: { isActive: !cur.isActive } })
    await logActivity({ userId: req.user.id, userName: req.user.name, action: data.isActive ? 'ACTIVATE' : 'DEACTIVATE', module: 'position', targetId: id, req })
    res.json({ data: { id: data.id, isActive: data.isActive } })
  } catch (err) { next(err) }
})

export default router
