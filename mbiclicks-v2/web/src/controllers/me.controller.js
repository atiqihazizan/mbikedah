import prisma from '../lib/prisma.js'
import { TASK_QUEUE_MAP } from '../lib/workflowRules.js'

// Status yang boleh ada task untuk pegawai
const TASK_STATUSES = Object.keys(TASK_QUEUE_MAP)

const PRIORITY_THRESHOLDS = { urgent: 3, high: 1 } // hari menunggu

function computePriority(daysWaiting) {
  if (daysWaiting >= PRIORITY_THRESHOLDS.urgent) return 'urgent'
  if (daysWaiting >= PRIORITY_THRESHOLDS.high)   return 'high'
  return 'normal'
}

// ─── GET /me/tasks ────────────────────────────────────────────────────────────
export async function getMyTasks(req, res, next) {
  try {
    const role       = req.user.role?.slug
    const userId     = req.user.id
    const deptId     = req.user.departmentId

    // Bina where clause berdasarkan role — baca dari TASK_QUEUE_MAP
    // [COMPATIBILITY LAYER] — guna role.slug untuk tentukan task scope
    let where = { isDeleted: false, status: { in: TASK_STATUSES } }

    if (role === 'admin') {
      // admin nampak semua
    } else if (role === 'hod' || role === 'finance_hod') {
      where = { ...where, OR: [
        { status: 'PENDING_HOD', departmentId: deptId },
        ...(role === 'finance_hod' ? [
          { status: { in: ['PENDING_FINANCE_CHECK', 'PENDING_FINANCE_VERIFY', 'PENDING_FINANCE_APPROVAL'] } },
          { status: 'APPROVED' },
          { status: 'PARTIAL_PAID' },
        ] : []),
      ]}
    } else if (role === 'ceo') {
      where = { ...where, status: { in: ['PENDING_CEO', 'PENDING_CEO_FINAL'] } }
    } else if (role === 'finance') {
      where = { ...where, status: { in: ['PENDING_FINANCE_CHECK', 'PENDING_FINANCE_VERIFY', 'APPROVED', 'PARTIAL_PAID'] } }
    } else {
      // staff / role tidak dikenali → tiada task
      return res.json({ summary: { totalPending: 0, urgent: 0, high: 0 }, items: [] })
    }

    const billings = await prisma.billing.findMany({
      where,
      orderBy:  { updatedAt: 'asc' },
      include: {
        applicant:  { select: { id: true, name: true } },
        department: { select: { id: true, name: true } },
      },
    })

    const now = Date.now()

    const items = billings.map(b => {
      const taskDef     = TASK_QUEUE_MAP[b.status]
      const daysWaiting = Math.floor((now - new Date(b.updatedAt).getTime()) / 86_400_000)
      const priority    = computePriority(daysWaiting)

      return {
        billingId:   b.id,
        refNo:       b.refNo,
        queue:       taskDef?.queue ?? b.status.toLowerCase(),
        amount:      parseFloat(b.totalAmount),
        applicant:   b.applicant?.name ?? '—',
        department:  b.department?.name ?? '—',
        daysWaiting,
        priority,
        isUrgent:    priority === 'urgent',
      }
    })

    const summary = {
      totalPending: items.length,
      urgent:       items.filter(i => i.priority === 'urgent').length,
      high:         items.filter(i => i.priority === 'high').length,
    }

    res.json({ summary, items })
  } catch (err) { next(err) }
}
