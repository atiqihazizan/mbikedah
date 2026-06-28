import { Router } from 'express'
import { authenticate, requireRole } from '../middleware/auth.js'
import {
  getFinanceCheck, submitFinanceCheck, getBudgetBalanceApi,
  listBankAccounts, createBankAccount, updateBankAccount, toggleBankAccount,
} from '../controllers/financeCheck.controller.js'

const router = Router()
router.use(authenticate)

// ─── Finance Check (semakan kewangan) — finance sahaja ───────────────────────
router.get('/billings/:id/finance-check',    requireRole('finance', 'finance_hod', 'admin'), getFinanceCheck)
router.post('/billings/:id/finance-check',   requireRole('finance', 'finance_hod', 'admin'), submitFinanceCheck)

// ─── Budget balance real-time lookup (bila officer tukar accNo) ───────────────
router.get('/budget-balance', requireRole('finance', 'finance_hod', 'admin'), getBudgetBalanceApi)

// ─── Bank Accounts — semua boleh baca, finance/admin boleh ubah ──────────────
router.get('/bank-accounts',       listBankAccounts)
router.post('/bank-accounts',      requireRole('finance', 'finance_hod', 'admin'), createBankAccount)
router.put('/bank-accounts/:id',   requireRole('finance', 'finance_hod', 'admin'), updateBankAccount)
router.patch('/bank-accounts/:id/toggle', requireRole('finance', 'finance_hod', 'admin'), toggleBankAccount)

export default router
