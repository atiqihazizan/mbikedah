import { Router } from 'express'
import { authenticate } from '../middleware/auth.js'
import { getMyTasks } from '../controllers/me.controller.js'

const router = Router()
router.use(authenticate)

router.get('/tasks', getMyTasks)

export default router
