import { Router } from 'express'
import { z } from 'zod'
import prisma from '../lib/prisma.js'
import { authenticate, requireRole } from '../middleware/auth.js'
import { logActivity } from '../utils/activityLog.js'

const router = Router()
router.use(authenticate, requireRole('admin'))

// GET /api/permissions — semua roles dengan permissions
router.get('/', async (req, res, next) => {
  try {
    const roles = await prisma.role.findMany({
      orderBy: { id: 'asc' },
      include: { permissions: { orderBy: { module: 'asc' } } },
    })
    res.json({ data: roles })
  } catch (err) { next(err) }
})

const permSchema = z.array(z.object({
  module:    z.string().min(1),
  canView:   z.boolean(),
  canCreate: z.boolean(),
  canEdit:   z.boolean(),
  canApprove:z.boolean(),
  canDelete: z.boolean(),
}))

// PUT /api/permissions/:roleId — kemaskini permissions untuk sebuah role
router.put('/:roleId', async (req, res, next) => {
  try {
    const roleId = parseInt(req.params.roleId)
    const perms  = permSchema.parse(req.body)

    const role = await prisma.role.findUnique({ where: { id: roleId } })
    if (!role) return res.status(404).json({ message: 'Peranan tidak dijumpai' })

    // Upsert setiap modul
    await Promise.all(
      perms.map((p) =>
        prisma.permission.upsert({
          where:  { roleId_module: { roleId, module: p.module } },
          update: { canView: p.canView, canCreate: p.canCreate, canEdit: p.canEdit, canApprove: p.canApprove, canDelete: p.canDelete },
          create: { roleId, module: p.module, canView: p.canView, canCreate: p.canCreate, canEdit: p.canEdit, canApprove: p.canApprove, canDelete: p.canDelete },
        })
      )
    )

    await logActivity({ userId: req.user.id, userName: req.user.name, action: 'UPDATE', module: 'permission', detail: `Role: ${role.name}`, req })

    const updated = await prisma.role.findUnique({
      where: { id: roleId },
      include: { permissions: { orderBy: { module: 'asc' } } },
    })
    res.json({ data: updated })
  } catch (err) { next(err) }
})

export default router
