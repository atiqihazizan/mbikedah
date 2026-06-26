import { Router } from 'express'
import prisma from '../lib/prisma.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()
router.use(authenticate)

// GET /api/dashboard/pending-approvals
// KJ  → staff dalam jabatan + count PENDING_HOD milik mereka
// CEO → semua jabatan (KJ) + count PENDING_CEO_FINAL
router.get('/pending-approvals', async (req, res, next) => {
  try {
    const role = req.user.role?.slug

    if (role === 'hod' || role === 'finance_hod') {
      const deptId = req.user.departmentId

      // Ambil semua staff dalam jabatan yang sama (bukan diri sendiri)
      const staff = await prisma.user.findMany({
        where: { departmentId: deptId, id: { not: req.user.id }, isActive: true },
        select: {
          id: true, name: true, staffNo: true,
          position: { select: { name: true } },
          _count: {
            select: {
              billingsCreated: {
                where: { status: role === 'finance_hod' ? 'PENDING_FINANCE_APPROVAL' : 'PENDING_HOD' },
              },
            },
          },
        },
        orderBy: { name: 'asc' },
      })

      return res.json({
        type: 'hod',
        label: 'Permohonan Menunggu Kelulusan Anda',
        items: staff.map((s) => ({
          id: s.id,
          name: s.name,
          staffNo: s.staffNo,
          position: s.position?.name ?? '',
          pendingCount: s._count.billingsCreated,
        })),
      })
    }

    if (role === 'ceo') {
      // Ambil semua jabatan (kecuali root MBI) dengan count PENDING_CEO_FINAL
      const depts = await prisma.department.findMany({
        where: { code: { not: 'MBI' } },
        select: {
          id: true, name: true, code: true,
          head: { select: { id: true, name: true, staffNo: true, position: { select: { name: true } } } },
          _count: {
            select: {
              billings: { where: { status: 'PENDING_CEO_FINAL' } },
            },
          },
        },
        orderBy: { code: 'asc' },
      })

      return res.json({
        type: 'ceo',
        label: 'Permohonan Menunggu Kelulusan Muktamad',
        items: depts.map((d) => ({
          id: d.id,
          name: d.name,
          code: d.code,
          head: d.head ? { name: d.head.name, staffNo: d.head.staffNo, position: d.head.position?.name ?? '' } : null,
          pendingCount: d._count.billings,
        })),
      })
    }

    // Role lain — tiada data
    return res.json({ type: null, items: [] })
  } catch (err) {
    next(err)
  }
})

export default router
