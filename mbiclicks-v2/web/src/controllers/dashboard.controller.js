import prisma from '../lib/prisma.js'
import { buildBillingScope } from './billing.controller.js'

export async function getDashboard(req, res, next) {
  try {
    const user = req.user

    // Scope sama seperti listBillings — non-owner hanya nampak yang belum diambil tindakan
    const scopeWhere = buildBillingScope(user, null)

    // Billing stats — ikut scope user
    const billingStats = {}
    const billingStatuses = [
      'DRAFT',
      'PENDING_HOD',
      'PENDING_CEO',
      'PENDING_FINANCE_CHECK',
      'PENDING_FINANCE_VERIFY',
      'PENDING_FINANCE_APPROVAL',
      'PENDING_CEO_FINAL',
      'APPROVED',
      'PARTIAL_PAID',
      'PAID',
      'REJECTED',
      'RETURNED',
    ]

    for (const status of billingStatuses) {
      billingStats[status] = await prisma.billing.count({
        where: { ...scopeWhere, status },
      })
    }

    const totalBilling = await prisma.billing.count({ where: scopeWhere })

    // Recent billings — ikut scope user
    const recentBillings = await prisma.billing.findMany({
      where: scopeWhere,
      take: 5,
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        refNo: true,
        status: true,
        totalAmount: true,
        applicant: { select: { name: true, id: true } },
        department: { select: { name: true } },
        createdAt: true,
        updatedAt: true,
      },
    })

    // Aggregate totals — ikut scope user
    const totalAmount = await prisma.billing.aggregate({
      where: { ...scopeWhere, status: { in: ['APPROVED', 'PAID'] } },
      _sum: { totalAmount: true },
    })

    // User stats
    const totalUsers = await prisma.user.count()
    const totalDepartments = await prisma.department.count()

    // Summary untuk cards
    const pendingApproval = billingStats.PENDING_HOD +
      billingStats.PENDING_CEO +
      billingStats.PENDING_FINANCE_CHECK +
      billingStats.PENDING_FINANCE_VERIFY +
      billingStats.PENDING_FINANCE_APPROVAL +
      billingStats.PENDING_CEO_FINAL

    const approvedAmount = totalAmount._sum?.totalAmount ?? 0

    res.json({
      stats: {
        totalBilling,
        billingByStatus: billingStats,
        pendingApproval,
        approvedAmount: parseFloat(approvedAmount),
      },
      recent: recentBillings,
      system: {
        totalUsers,
        totalDepartments,
      },
    })
  } catch (err) { next(err) }
}
