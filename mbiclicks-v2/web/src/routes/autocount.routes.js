import { Router } from 'express'
import { authenticate, requireRole } from '../middleware/auth.js'
import { syncFromAutocount as syncAccounts } from '../controllers/account.controller.js'
import { syncActuals, getSyncStatus } from '../controllers/autocount.controller.js'

const router = Router()
router.use(authenticate)

const financeOnly = requireRole('finance_hod', 'finance')

router.get('/status',        getSyncStatus)
router.post('/sync-accounts', financeOnly, syncAccounts)
router.post('/sync-actuals',  financeOnly, syncActuals)

export default router
