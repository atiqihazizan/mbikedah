import { Router } from 'express'
import { z } from 'zod'
import prisma from '../lib/prisma.js'
import { authenticate, authorize } from '../middleware/auth.js'

const router = Router()

const INCLUDE = {
  issuedBy:   { select: { id: true, name: true, staffNo: true } },
  department: { select: { id: true, name: true } },
  _count:     { select: { reads: true } },
}

// ── Public — login page (PUBLISHED sahaja) ────────────────────────────────
router.get('/public', async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 10, 10)
    const data = await prisma.circular.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { publishedAt: 'desc' },
      take: limit,
      select: {
        id: true, title: true, issuedAt: true, publishedAt: true,
        audienceType: true,
        department: { select: { name: true } },
      },
    })
    res.json({ data })
  } catch (err) { next(err) }
})

// ── Protected ──────────────────────────────────────────────────────────────
router.use(authenticate)

// GET /api/circular/departments
router.get('/departments', async (req, res, next) => {
  try {
    const data = await prisma.department.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, code: true },
    })
    res.json({ data })
  } catch (err) { next(err) }
})

// GET /api/circular — list
router.get('/', authorize('circular'), async (req, res, next) => {
  try {
    const page     = Math.max(1, parseInt(req.query.page)  || 1)
    const limit    = Math.min(50, parseInt(req.query.limit) || 20)
    const search   = req.query.search?.trim() || ''
    const status   = req.query.status    // DRAFT | PUBLISHED | ARCHIVED
    const audience = req.query.audience  // ALL | DEPARTMENT

    const where = {}
    if (search)   where.title = { contains: search }
    if (['DRAFT','PUBLISHED','ARCHIVED'].includes(status)) where.status = status
    if (audience === 'ALL' || audience === 'DEPARTMENT')   where.audienceType = audience

    // Staf biasa — PUBLISHED sahaja, kecuali jika canDraftCircular (nampak draf sendiri)
    const role = req.user?.role?.slug
    const isManager = ['admin','ceo','hod','finance_hod','finance'].includes(role)
    const isDrafter = req.user?.canDraftCircular
    if (!isManager) {
      if (isDrafter) {
        if (!where.status) {
          where.OR = [
            { status: 'PUBLISHED' },
            { status: 'DRAFT', issuedById: req.user.id },
          ]
        } else if (where.status === 'DRAFT') {
          where.issuedById = req.user.id
        }
      } else {
        where.status = 'PUBLISHED'
      }
    }

    const [total, data] = await Promise.all([
      prisma.circular.count({ where }),
      prisma.circular.findMany({
        where,
        orderBy: [{ status: 'asc' }, { issuedAt: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
        include: INCLUDE,
      }),
    ])

    res.json({ data, total, page, totalPages: Math.ceil(total / limit) })
  } catch (err) { next(err) }
})

// GET /api/circular/:id — detail + mark read
router.get('/:id', authorize('circular'), async (req, res, next) => {
  try {
    const id = parseInt(req.params.id)
    const circular = await prisma.circular.findUnique({ where: { id }, include: INCLUDE })
    if (!circular) return res.status(404).json({ message: 'Pekeliling tidak dijumpai' })

    // DRAFT — pencipta, drafter (draf sendiri), atau pengurus
    if (circular.status === 'DRAFT' && circular.issuedById !== req.user.id) {
      const role = req.user?.role?.slug
      if (!['admin','ceo','hod','finance_hod'].includes(role)) {
        return res.status(403).json({ message: 'Pekeliling belum diterbit' })
      }
    }
    // ARCHIVED — hanya pentadbir
    if (circular.status === 'ARCHIVED') {
      const role = req.user?.role?.slug
      if (!['admin','ceo'].includes(role)) {
        return res.status(403).json({ message: 'Pekeliling telah diarkib' })
      }
    }

    if (circular.status === 'PUBLISHED') {
      await prisma.circularRead.upsert({
        where: { circularId_userId: { circularId: id, userId: req.user.id } },
        create: { circularId: id, userId: req.user.id },
        update: {},
      }).catch(() => {})
    }

    res.json({ data: circular })
  } catch (err) { next(err) }
})

const draftSchema = z.object({
  title:        z.string().min(3).max(200),
  content:      z.string().min(1),
  audienceType: z.enum(['ALL', 'DEPARTMENT']).default('ALL'),
  departmentId: z.number().int().positive().nullable().optional(),
  issuedAt:     z.string().optional(),
  expiresAt:    z.string().nullable().optional(),
})

function canDraft(req) {
  const perms = req.user?.role?.permissions ?? []
  const hasPerm = perms.find((p) => p.module === 'circular')
  return hasPerm?.canCreate || req.user?.canDraftCircular
}

// POST /api/circular — cipta DRAFT
router.post('/', async (req, res, next) => {
  if (!canDraft(req)) return res.status(403).json({ message: 'Akses tidak dibenarkan' })
  try {
    const body = draftSchema.parse(req.body)
    const data = await prisma.circular.create({
      data: {
        title:        body.title,
        content:      body.content,
        audienceType: body.audienceType,
        departmentId: body.audienceType === 'DEPARTMENT' ? (body.departmentId ?? null) : null,
        issuedById:   req.user.id,
        status:       'DRAFT',
        issuedAt:     body.issuedAt ? new Date(body.issuedAt) : new Date(),
        expiresAt:    body.expiresAt ? new Date(body.expiresAt) : null,
      },
      include: INCLUDE,
    })
    res.status(201).json({ data })
  } catch (err) { next(err) }
})

// PUT /api/circular/:id — edit (DRAFT sahaja)
router.put('/:id', async (req, res, next) => {
  if (!canDraft(req)) return res.status(403).json({ message: 'Akses tidak dibenarkan' })
  try {
    const id  = parseInt(req.params.id)
    const cur = await prisma.circular.findUnique({ where: { id }, select: { status: true, issuedById: true } })
    if (!cur) return res.status(404).json({ message: 'Pekeliling tidak dijumpai' })

    if (cur.status !== 'DRAFT') {
      return res.status(400).json({ message: 'Hanya pekeliling dalam DRAF boleh diedit. Sila arkib dan cipta yang baharu.' })
    }

    const role = req.user?.role?.slug
    if (role !== 'admin' && cur.issuedById !== req.user.id) {
      return res.status(403).json({ message: 'Hanya pencipta atau admin boleh edit draf ini' })
    }

    const body = draftSchema.parse(req.body)
    const data = await prisma.circular.update({
      where: { id },
      data: {
        title:        body.title,
        content:      body.content,
        audienceType: body.audienceType,
        departmentId: body.audienceType === 'DEPARTMENT' ? (body.departmentId ?? null) : null,
        issuedAt:     body.issuedAt ? new Date(body.issuedAt) : undefined,
        expiresAt:    body.expiresAt ? new Date(body.expiresAt) : null,
      },
      include: INCLUDE,
    })
    res.json({ data })
  } catch (err) { next(err) }
})

// POST /api/circular/:id/publish — DRAFT → PUBLISHED (perlu canApprove)
router.post('/:id/publish', authorize('circular', 'canApprove'), async (req, res, next) => {
  try {
    const id  = parseInt(req.params.id)
    const cur = await prisma.circular.findUnique({ where: { id }, select: { status: true } })
    if (!cur) return res.status(404).json({ message: 'Pekeliling tidak dijumpai' })
    if (cur.status !== 'DRAFT') {
      return res.status(400).json({ message: 'Hanya draf boleh diterbit' })
    }
    const data = await prisma.circular.update({
      where: { id },
      data: { status: 'PUBLISHED', publishedAt: new Date() },
      include: INCLUDE,
    })
    res.json({ data })
  } catch (err) { next(err) }
})

// POST /api/circular/:id/archive — PUBLISHED → ARCHIVED (perlu canApprove)
router.post('/:id/archive', authorize('circular', 'canApprove'), async (req, res, next) => {
  try {
    const id  = parseInt(req.params.id)
    const cur = await prisma.circular.findUnique({ where: { id }, select: { status: true } })
    if (!cur) return res.status(404).json({ message: 'Pekeliling tidak dijumpai' })
    if (cur.status !== 'PUBLISHED') {
      return res.status(400).json({ message: 'Hanya pekeliling yang diterbit boleh diarkib' })
    }
    const data = await prisma.circular.update({
      where: { id },
      data: { status: 'ARCHIVED', archivedAt: new Date() },
      include: INCLUDE,
    })
    res.json({ data })
  } catch (err) { next(err) }
})

// POST /api/circular/:id/restore — ARCHIVED → DRAFT (admin sahaja)
router.post('/:id/restore', authorize('circular', 'canDelete'), async (req, res, next) => {
  try {
    const id  = parseInt(req.params.id)
    const cur = await prisma.circular.findUnique({ where: { id }, select: { status: true } })
    if (!cur) return res.status(404).json({ message: 'Pekeliling tidak dijumpai' })
    if (cur.status !== 'ARCHIVED') {
      return res.status(400).json({ message: 'Hanya pekeliling yang diarkib boleh dipulihkan' })
    }
    const data = await prisma.circular.update({
      where: { id },
      data: { status: 'DRAFT', archivedAt: null },
      include: INCLUDE,
    })
    res.json({ data })
  } catch (err) { next(err) }
})

// DELETE /api/circular/:id — padam kekal (DRAFT atau ARCHIVED sahaja, admin)
router.delete('/:id', authorize('circular', 'canDelete'), async (req, res, next) => {
  try {
    const id  = parseInt(req.params.id)
    const cur = await prisma.circular.findUnique({ where: { id }, select: { status: true } })
    if (!cur) return res.status(404).json({ message: 'Pekeliling tidak dijumpai' })
    if (cur.status === 'PUBLISHED') {
      return res.status(400).json({ message: 'Pekeliling yang diterbit tidak boleh dipadam. Sila arkib dahulu.' })
    }
    await prisma.circular.delete({ where: { id } })
    res.json({ message: 'Pekeliling dipadam' })
  } catch (err) { next(err) }
})

export default router
