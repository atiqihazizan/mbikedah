import { Router } from 'express'
import { authenticate, authorize } from '../middleware/auth.js'
import { listAccounts, syncFromAutocount } from '../controllers/account.controller.js'

const router = Router()

router.use(authenticate)
router.get('/', authorize('account'), listAccounts)
router.post('/sync', authorize('account', 'canCreate'), syncFromAutocount)

export default router
