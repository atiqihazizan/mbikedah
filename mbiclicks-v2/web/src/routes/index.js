import { Router } from 'express'
import authRoutes from './auth.routes.js'
import budgetRoutes from './budget.routes.js'
import accountRoutes from './account.routes.js'
import circularRoutes from './circular.routes.js'
import dashboardRoutes from './dashboard.routes.js'

const router = Router()

router.use('/auth', authRoutes)
router.use('/budget', budgetRoutes)
router.use('/accounts', accountRoutes)
router.use('/circular', circularRoutes)
router.use('/dashboard', dashboardRoutes)

export default router
