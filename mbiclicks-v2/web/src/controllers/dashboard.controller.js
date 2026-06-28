import prisma from '../lib/prisma.js'

export async function getDashboard(req, res, next) {
  try {
    const user = req.user

    // Billing stats — jangan count soft deleted
    const billingStats = {}
    const billingStatuses = [
      'DRAFT',
      'PENDING_HOD',
      'PENDING_FINANCE_CHECK',
      'PENDING_FINANCE_VERIFY',
      'PENDING_FINANCE_APPROVAL',
      'APPROVED',
      'PAID',
      'REJECTED',
      'RETURNED',
    ]

    for (const status of billingStatuses) {
      billingStats[status] = await prisma.billing.count({
        where: { status, isDeleted: false },
      })
    }

    const totalBilling = await prisma.billing.count({ where: { isDeleted: false } })

    // Recent billings — untuk user view maklumat permohonan terbaru (diurutkan by updated, bukan created)
    const recentBillings = await prisma.billing.findMany({
      where: { isDeleted: false },
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

    // Aggregate totals
    const totalAmount = await prisma.$queryRaw`
      SELECT SUM(CAST(total_amount AS DECIMAL(15,2))) as total
      FROM billings
      WHERE is_deleted = false AND status IN ('APPROVED', 'PAID')
    `

    // User stats
    const totalUsers = await prisma.user.count()
    const totalDepartments = await prisma.department.count()

    // Summary untuk cards
    const pendingApproval = billingStats.PENDING_HOD +
      billingStats.PENDING_FINANCE_CHECK +
      billingStats.PENDING_FINANCE_VERIFY +
      billingStats.PENDING_FINANCE_APPROVAL

    const approvedAmount = totalAmount[0]?.total ?? 0

    res.json({
      stats: {
        totalBilling,
        billingByStatus: billingStats,
        pendingApproval,
        approvedAmount: parseFloat(approvedAmount),
        totalAmount,
      },
      recent: recentBillings,
      system: {
        totalUsers,
        totalDepartments,
      },
    })
  } catch (err) { next(err) }
}
