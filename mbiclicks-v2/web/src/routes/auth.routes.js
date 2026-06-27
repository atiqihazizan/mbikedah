import { Router } from 'express'
import { checkStaff, login, refresh, logout, me, changePassword } from '../controllers/auth.controller.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()

router.post('/check-staff', checkStaff)
router.post('/login', login)
router.post('/refresh', refresh)
router.post('/logout', logout)
router.get('/me', authenticate, me)
router.post('/change-password', authenticate, changePassword)

export default router
