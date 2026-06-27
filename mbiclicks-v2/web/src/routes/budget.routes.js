import { Router } from 'express'
import { authenticate, requireRole } from '../middleware/auth.js'
import {
  listYears, getYear, createYear, activateYear, closeYear,
  initLines, getLines, saveLines, getSummary, getAdjustments,
  updateConfig, deleteYear, getReport, getActiveBelanja,
} from '../controllers/budget.controller.js'

const router = Router()
router.use(authenticate)

const financeOnly = requireRole('finance_hod', 'finance')

// ── Semua role boleh view ──────────────────────────────────────────────────────
router.get('/years',              listYears)
router.get('/years/:id',          getYear)
router.get('/years/:id/lines',    getLines)
router.get('/years/:id/summary',  getSummary)
router.get('/years/:id/adjustments', getAdjustments)
router.get('/active-belanja',     getActiveBelanja)

// ── Finance sahaja — urus bajet ───────────────────────────────────────────────
router.post('/years',                    financeOnly, createYear)
router.post('/years/:id/activate',       financeOnly, activateYear)
router.post('/years/:id/close',          financeOnly, closeYear)
router.delete('/years/:id',              financeOnly, deleteYear)
router.post('/years/:id/init-lines',     financeOnly, initLines)
router.put('/years/:id/lines',           financeOnly, saveLines)
router.patch('/years/:id/config',        financeOnly, updateConfig)

// ── Laporan — finance sahaja ──────────────────────────────────────────────────
router.get('/years/:id/report',          financeOnly, getReport)

export default router
