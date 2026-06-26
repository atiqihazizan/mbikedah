import { Router } from 'express'
import { authenticate, authorize } from '../middleware/auth.js'
import {
  listYears, getYear, createYear, activateYear, closeYear,
  initLines, getLines, saveLines, getSummary, getAdjustments, updateConfig,
} from '../controllers/budget.controller.js'

const router = Router()

router.use(authenticate)

router.get('/years', authorize('budget'), listYears)
router.get('/years/:id', authorize('budget'), getYear)
router.post('/years', authorize('budget', 'canCreate'), createYear)
router.post('/years/:id/activate', authorize('budget', 'canApprove'), activateYear)
router.post('/years/:id/close', authorize('budget', 'canApprove'), closeYear)

router.post('/years/:id/init-lines', authorize('budget', 'canCreate'), initLines)
router.get('/years/:id/lines', authorize('budget'), getLines)
router.put('/years/:id/lines', authorize('budget', 'canEdit'), saveLines)
router.get('/years/:id/summary', authorize('budget'), getSummary)
router.get('/years/:id/adjustments', authorize('budget'), getAdjustments)
router.patch('/years/:id/config', authorize('budget', 'canEdit'), updateConfig)

export default router
