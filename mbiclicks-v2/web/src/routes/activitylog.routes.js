import { Router } from 'express'
import prisma from '../lib/prisma.js'
import { authenticate, requireRole } from '../middleware/auth.js'

const router = Router()
router.use(authenticate, requireRole('admin'))

// GET /api/activity-logs
router.get('/', async (req, res, next) => {
  try {
    const page    = Math.max(1, parseInt(req.query.page)  || 1)
    const limit   = Math.min(100, parseInt(req.query.limit) || 50)
    const module  = req.query.module || undefined
    const action  = req.query.action || undefined
    const userId  = req.query.userId ? parseInt(req.query.userId) : undefined
    const dateFrom = req.query.dateFrom ? new Date(req.query.dateFrom) : undefined
    const dateTo   = req.query.dateTo   ? new Date(req.query.dateTo + 'T23:59:59') : undefined

    const where = {}
    if (module)  where.module  = module
    if (action)  where.action  = action
    if (userId)  where.userId  = userId
    if (dateFrom || dateTo) {
      where.createdAt = {}
      if (dateFrom) where.createdAt.gte = dateFrom
      if (dateTo)   where.createdAt.lte = dateTo
    }

    const [total, data] = await Promise.all([
      prisma.activityLog.count({ where }),
      prisma.activityLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip:  (page - 1) * limit,
        take:  limit,
        include: {
          user: { select: { id: true, name: true, staffNo: true } },
        },
      }),
    ])

    res.json({ data, total, page, totalPages: Math.ceil(total / limit) })
  } catch (err) { next(err) }
})

// GET /api/activity-logs/meta — distinct modules & actions for filter
router.get('/meta', async (req, res, next) => {
  try {
    const [modules, actions] = await Promise.all([
      prisma.activityLog.findMany({ distinct: ['module'], select: { module: true }, orderBy: { module: 'asc' } }),
      prisma.activityLog.findMany({ distinct: ['action'], select: { action: true }, orderBy: { action: 'asc' } }),
    ])
    res.json({ modules: modules.map((m) => m.module), actions: actions.map((a) => a.action) })
  } catch (err) { next(err) }
})

export default router
