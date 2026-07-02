import { Router } from 'express'
import { authenticate, requireRole } from '../middleware/auth.js'
import { listPayments, recordPayment, payPhase, closeBilling } from '../controllers/payment.controller.js'

const router = Router()
router.use(authenticate)

const canPay   = requireRole('finance', 'finance_hod', 'admin')
const canClose = requireRole('finance_hod', 'admin')

router.get('/:id/payments',              listPayments)
router.post('/:id/payments',             canPay, recordPayment)
router.patch('/:id/payments/:phaseId',   canPay, payPhase)
router.post('/:id/close',               canClose, closeBilling)

export default router
