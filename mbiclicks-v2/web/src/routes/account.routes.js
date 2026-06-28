import { Router } from 'express'
import { authenticate, requireRole } from '../middleware/auth.js'
import {
  listAccounts, createAccount, updateAccount,
  toggleAccount, deleteAccount, syncFromAutocount, syncFromFile,
} from '../controllers/account.controller.js'

const router = Router()

// Semua pengguna log masuk boleh list akaun (untuk dropdown permohonan)
router.get('/', authenticate, listAccounts)

// Kemaskini dan pentadbiran — finance/admin sahaja
router.use(authenticate, requireRole('finance_hod', 'finance', 'admin'))
router.post('/',             createAccount)
router.put('/:id',           updateAccount)
router.patch('/:id/toggle',  toggleAccount)
router.delete('/:id',        deleteAccount)
router.post('/sync',         syncFromAutocount)
router.post('/sync-file',    syncFromFile)

export default router
