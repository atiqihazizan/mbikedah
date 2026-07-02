import { Router } from 'express'
import { authenticate } from '../middleware/auth.js'
import { getMyTasks, getMySummary, getMyApplications, getMyHistory } from '../controllers/me.controller.js'

const router = Router()
router.use(authenticate)

router.get('/applications', getMyApplications)  // ADR-033: Ownership — own billings only
router.get('/history',      getMyHistory)        // ADR-033: Ownership — own terminal billings
router.get('/tasks',        getMyTasks)
router.get('/summary',      getMySummary)

export default router
