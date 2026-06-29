import { Router } from 'express'
import { authenticate, requireRole } from '../middleware/auth.js'
import { listPayments, recordPayment, payPhase } from '../controllers/payment.controller.js'

const router = Router()
router.use(authenticate)

const canPay = requireRole('finance', 'finance_hod', 'admin')

router.get('/:id/payments',              listPayments)
router.post('/:id/payments',             canPay, recordPayment)
router.patch('/:id/payments/:phaseId',   canPay, payPhase)

export default router
