import { Router } from 'express'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import prisma from '../lib/prisma.js'
import { authenticate, requireRole } from '../middleware/auth.js'
import { logActivity } from '../utils/activityLog.js'

const router = Router()
router.use(authenticate, requireRole('admin'))

const USER_INCLUDE = {
  role:       { select: { id: true, name: true, slug: true } },
  department: { select: { id: true, name: true, code: true } },
  position:   { select: { id: true, name: true } },
}

// GET /api/users/meta — dropdown data
router.get('/meta', async (req, res, next) => {
  try {
    const [roles, departments, positions] = await Promise.all([
      prisma.role.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true, slug: true } }),
      prisma.department.findMany({ where: { isActive: true }, orderBy: { name: 'asc' }, select: { id: true, name: true, code: true } }),
      prisma.position.findMany({ where: { isActive: true }, orderBy: { level: 'desc' }, select: { id: true, name: true, code: true } }),
    ])
    res.json({ roles, departments, positions })
  } catch (err) { next(err) }
})

// GET /api/users — list
router.get('/', async (req, res, next) => {
  try {
    const page   = Math.max(1, parseInt(req.query.page)  || 1)
    const limit  = Math.min(50, parseInt(req.query.limit) || 20)
    const search = req.query.search?.trim() || ''
    const deptId = req.query.deptId ? parseInt(req.query.deptId) : undefined
    const roleId = req.query.roleId ? parseInt(req.query.roleId) : undefined
    const status = req.query.status  // 'active' | 'inactive'

    const where = {}
    if (search) {
      where.OR = [
        { name:    { contains: search } },
        { staffNo: { contains: search } },
        { email:   { contains: search } },
      ]
    }
    if (deptId) where.departmentId = deptId
    if (roleId) where.roleId       = roleId
    if (status === 'active')   where.isActive = true
    if (status === 'inactive') where.isActive = false

    const [total, data] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        orderBy: { name: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true, staffNo: true, name: true, email: true, phone: true,
          isActive: true, canDraftCircular: true, lastLogin: true,
          role:       { select: { id: true, name: true, slug: true } },
          department: { select: { id: true, name: true, code: true } },
          position:   { select: { id: true, name: true } },
        },
      }),
    ])

    res.json({ data, total, page, totalPages: Math.ceil(total / limit) })
  } catch (err) { next(err) }
})

// GET /api/users/:id
router.get('/:id', async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(req.params.id) },
      select: {
        id: true, staffNo: true, name: true, email: true, phone: true,
        isActive: true, canDraftCircular: true, lastLogin: true,
        roleId: true, departmentId: true, positionId: true,
        role: { select: { id: true, name: true, slug: true } },
        department: { select: { id: true, name: true } },
        position:   { select: { id: true, name: true } },
      },
    })
    if (!user) return res.status(404).json({ message: 'Pengguna tidak dijumpai' })
    res.json({ data: user })
  } catch (err) { next(err) }
})

const userSchema = z.object({
  staffNo:          z.string().min(1).max(20),
  name:             z.string().min(2).max(100),
  email:            z.string().email().optional().or(z.literal('')),
  phone:            z.string().max(20).optional().or(z.literal('')),
  roleId:           z.number().int().positive(),
  departmentId:     z.number().int().positive().nullable().optional(),
  positionId:       z.number().int().positive().nullable().optional(),
  isActive:         z.boolean().optional(),
  canDraftCircular: z.boolean().optional(),
})

// POST /api/users — cipta pengguna
router.post('/', async (req, res, next) => {
  try {
    const body = userSchema.parse(req.body)
    const staffNo = body.staffNo.trim().toUpperCase()

    const exists = await prisma.user.findUnique({ where: { staffNo } })
    if (exists) return res.status(400).json({ message: `No. staf ${staffNo} sudah wujud` })

    const email = body.email?.trim() || `${staffNo.toLowerCase()}@mbi.gov.my`

    const data = await prisma.user.create({
      data: {
        staffNo,
        name:             body.name.trim(),
        email,
        password:         'mbi123',
        phone:            body.phone?.trim() || null,
        roleId:           body.roleId,
        departmentId:     body.departmentId ?? null,
        positionId:       body.positionId   ?? null,
        isActive:         body.isActive     ?? true,
        canDraftCircular: body.canDraftCircular ?? false,
      },
      select: {
        id: true, staffNo: true, name: true, email: true,
        isActive: true, canDraftCircular: true,
        role: { select: { id: true, name: true, slug: true } },
        department: { select: { id: true, name: true } },
        position:   { select: { id: true, name: true } },
      },
    })
    res.status(201).json({ data })
  } catch (err) { next(err) }
})

// PUT /api/users/:id — kemaskini
router.put('/:id', async (req, res, next) => {
  try {
    const id   = parseInt(req.params.id)
    const body = userSchema.parse(req.body)
    const staffNo = body.staffNo.trim().toUpperCase()

    const conflict = await prisma.user.findFirst({ where: { staffNo, NOT: { id } } })
    if (conflict) return res.status(400).json({ message: `No. staf ${staffNo} sudah digunakan` })

    const data = await prisma.user.update({
      where: { id },
      data: {
        staffNo,
        name:             body.name.trim(),
        phone:            body.phone?.trim() || null,
        roleId:           body.roleId,
        departmentId:     body.departmentId ?? null,
        positionId:       body.positionId   ?? null,
        isActive:         body.isActive     ?? undefined,
        canDraftCircular: body.canDraftCircular ?? undefined,
      },
      select: {
        id: true, staffNo: true, name: true, email: true,
        isActive: true, canDraftCircular: true,
        role: { select: { id: true, name: true, slug: true } },
        department: { select: { id: true, name: true } },
        position:   { select: { id: true, name: true } },
      },
    })
    res.json({ data })
  } catch (err) { next(err) }
})

// PATCH /api/users/:id/toggle — togol aktif/tidak aktif
router.patch('/:id/toggle', async (req, res, next) => {
  try {
    const id  = parseInt(req.params.id)
    if (id === req.user.id) return res.status(400).json({ message: 'Tidak boleh nyahaktif akaun sendiri' })
    const cur = await prisma.user.findUnique({ where: { id }, select: { isActive: true } })
    if (!cur) return res.status(404).json({ message: 'Pengguna tidak dijumpai' })
    const data = await prisma.user.update({ where: { id }, data: { isActive: !cur.isActive } })
    res.json({ data: { id: data.id, isActive: data.isActive } })
  } catch (err) { next(err) }
})

// PATCH /api/users/:id/draft-circular — togol kebenaran draf pekeliling
router.patch('/:id/draft-circular', async (req, res, next) => {
  try {
    const id  = parseInt(req.params.id)
    const cur = await prisma.user.findUnique({ where: { id }, select: { canDraftCircular: true } })
    if (!cur) return res.status(404).json({ message: 'Pengguna tidak dijumpai' })
    const data = await prisma.user.update({ where: { id }, data: { canDraftCircular: !cur.canDraftCircular } })
    res.json({ data: { id: data.id, canDraftCircular: data.canDraftCircular } })
  } catch (err) { next(err) }
})

// PATCH /api/users/:id/reset-password — reset kata laluan ke default
router.patch('/:id/reset-password', async (req, res, next) => {
  try {
    const id  = parseInt(req.params.id)
    const user = await prisma.user.findUnique({ where: { id }, select: { id: true, name: true, staffNo: true } })
    if (!user) return res.status(404).json({ message: 'Pengguna tidak dijumpai' })

    const hashed = await bcrypt.hash('mbi123', 10)
    await prisma.user.update({ where: { id }, data: { password: hashed } })

    await logActivity({ userId: req.user.id, userName: req.user.name, action: 'RESET_PASSWORD', module: 'user', targetId: id, detail: `Reset: ${user.name} (${user.staffNo})`, req })
    res.json({ message: `Kata laluan ${user.name} telah ditetapkan semula kepada mbi123` })
  } catch (err) { next(err) }
})

export default router
