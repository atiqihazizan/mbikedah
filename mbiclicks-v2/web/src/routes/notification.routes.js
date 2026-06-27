import { Router } from 'express'
import prisma from '../lib/prisma.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()
router.use(authenticate)

// GET / — notifikasi user semasa (terbaru 50)
router.get('/', async (req, res, next) => {
  try {
    const notifications = await prisma.notification.findMany({
      where:   { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take:    50,
    })
    const unreadCount = await prisma.notification.count({
      where: { userId: req.user.id, isRead: false },
    })
    res.json({ notifications, unreadCount })
  } catch (err) { next(err) }
})

// PATCH /read-all — tandakan semua sebagai dibaca
router.patch('/read-all', async (req, res, next) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user.id, isRead: false },
      data:  { isRead: true },
    })
    res.json({ message: 'Semua notifikasi ditandakan sebagai dibaca' })
  } catch (err) { next(err) }
})

// PATCH /:id/read — tandakan satu sebagai dibaca
router.patch('/:id/read', async (req, res, next) => {
  try {
    await prisma.notification.update({
      where: { id: parseInt(req.params.id) },
      data:  { isRead: true },
    })
    res.json({ message: 'OK' })
  } catch (err) { next(err) }
})

export default router
