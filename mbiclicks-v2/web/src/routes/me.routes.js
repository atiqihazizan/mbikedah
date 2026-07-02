import { Router } from 'express'
import { authenticate } from '../middleware/auth.js'
import { getMyTasks, getMySummary } from '../controllers/me.controller.js'

const router = Router()
router.use(authenticate)

router.get('/tasks',   getMyTasks)
router.get('/summary', getMySummary)

export default router
