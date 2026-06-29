import { Router } from 'express'
import authRoutes        from './auth.routes.js'
import budgetRoutes      from './budget.routes.js'
import accountRoutes     from './account.routes.js'
import circularRoutes    from './circular.routes.js'
import dashboardRoutes   from './dashboard.routes.js'
import userRoutes        from './user.routes.js'
import departmentRoutes  from './department.routes.js'
import positionRoutes    from './position.routes.js'
import activitylogRoutes from './activitylog.routes.js'
import permissionRoutes  from './permission.routes.js'
import eventRoutes        from './event.routes.js'
import notificationRoutes from './notification.routes.js'
import autocountRoutes      from './autocount.routes.js'
import reportLayoutRoutes  from './reportLayout.routes.js'
import billingRoutes       from './billing.routes.js'
import vendorRoutes        from './vendor.routes.js'
import financeCheckRoutes  from './financeCheck.routes.js'
import paymentRoutes       from './payment.routes.js'

const router = Router()

router.use('/auth',           authRoutes)
router.use('/budget',         budgetRoutes)
router.use('/accounts',       accountRoutes)
router.use('/circular',       circularRoutes)
router.use('/dashboard',      dashboardRoutes)
router.use('/users',          userRoutes)
router.use('/departments',    departmentRoutes)
router.use('/positions',      positionRoutes)
router.use('/activity-logs',  activitylogRoutes)
router.use('/permissions',    permissionRoutes)
router.use('/events',         eventRoutes)
router.use('/notifications',  notificationRoutes)
router.use('/autocount',      autocountRoutes)
router.use('/report-layouts', reportLayoutRoutes)
router.use('/billings',      billingRoutes)
router.use('/billings',      paymentRoutes)
router.use('/vendors',       vendorRoutes)
router.use('/',              financeCheckRoutes)

export default router
