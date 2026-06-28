import { Router } from 'express'
import { authenticate, requireRole } from '../middleware/auth.js'
import { listVendors, createVendor, updateVendor, toggleVendor } from '../controllers/vendor.controller.js'

const router = Router()

// Semua pengguna log masuk boleh list & tambah penerima baru
router.get('/',   authenticate, listVendors)
router.post('/',  authenticate, createVendor)

// Kemaskini & toggle — finance/admin sahaja
router.put('/:id',          authenticate, requireRole('finance_hod', 'finance', 'admin'), updateVendor)
router.patch('/:id/toggle', authenticate, requireRole('finance_hod', 'finance', 'admin'), toggleVendor)

export default router
