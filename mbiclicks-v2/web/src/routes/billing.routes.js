import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'
import { mkdirSync, unlinkSync } from 'fs'
import { authenticate, requireRole } from '../middleware/auth.js'
import {
  listBillings, listAktif, listSejarah,
  getBilling, getBillingReview,
  getHodReview, getCeoReview, getFinanceVerifyReview, getFinanceApprovalReview,
  createBilling, updateBilling,
  submitBilling, workflowAction, markPaid, deleteBilling,
} from '../controllers/billing.controller.js'
import prisma from '../lib/prisma.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const UPLOAD_DIR = resolve(__dirname, '../../uploads/billing')
mkdirSync(UPLOAD_DIR, { recursive: true })

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename:    (_req, file, cb) => {
    const ext  = path.extname(file.originalname)
    const name = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`
    cb(null, name)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
    cb(null, allowed.includes(file.mimetype))
  },
})

const router = Router()
router.use(authenticate)

// Senarai & detail
router.get('/',          listBillings)
router.get('/aktif',     listAktif)    // Permohonan aktif/dalam proses ikut role
router.get('/sejarah',   listSejarah)  // Sejarah siap (PAID/REJECTED/CLOSED) ikut role
router.get('/:id/review',             getBillingReview)         // Dashboard modal
router.get('/:id/hod',                getHodReview)             // HOD action page
router.get('/:id/ceo',                getCeoReview)             // CEO action page
router.get('/:id/pengesahan-kewangan', getFinanceVerifyReview)  // Finance Verify page
router.get('/:id/kelulusan-kewangan',  getFinanceApprovalReview)// Finance Approval page
router.get('/:id',                    getBilling)               // Owner/admin sahaja

// Create & edit — semua role (scope dalam controller)
router.post('/',    createBilling)
router.put('/:id',  updateBilling)
router.delete('/:id', deleteBilling)

// Submit
router.post('/:id/submit', submitBilling)

// Workflow — approve | reject | return
router.post('/:id/action/:action', workflowAction)

// Mark paid — finance sahaja
router.post('/:id/pay', requireRole('finance', 'finance_hod', 'admin'), markPaid)

// Upload attachment
router.post('/:id/attachments', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Fail tidak sah atau melebihi had 10MB' })
    const id      = parseInt(req.params.id)
    const billing = await prisma.billing.findFirst({ where: { id, isDeleted: false }, select: { id: true, status: true, applicantId: true } })
    if (!billing) { unlinkSync(req.file.path); return res.status(404).json({ message: 'Permohonan tidak dijumpai' }) }

    const canUpload = billing.applicantId === req.user.id || ['finance', 'finance_hod', 'admin'].includes(req.user.role?.slug)
    if (!canUpload) { unlinkSync(req.file.path); return res.status(403).json({ message: 'Tiada kebenaran' }) }

    const data = await prisma.billingAttachment.create({
      data: {
        billingId:    id,
        filename:     req.file.filename,
        originalName: req.file.originalname,
        mimeType:     req.file.mimetype,
        size:         req.file.size,
        path:         req.file.path,
        uploadedById: req.user.id,
      },
    })
    res.status(201).json({ data })
  } catch (err) { if (req.file) unlinkSync(req.file.path).catch?.(() => {}); next(err) }
})

// Delete attachment (soft delete)
router.delete('/:id/attachments/:attId', async (req, res, next) => {
  try {
    const id    = parseInt(req.params.id)
    const attId = parseInt(req.params.attId)
    const att   = await prisma.billingAttachment.findFirst({ where: { id: attId, billingId: id, isDeleted: false } })
    if (!att) return res.status(404).json({ message: 'Lampiran tidak dijumpai' })

    const billing = await prisma.billing.findFirst({ where: { id, isDeleted: false }, select: { applicantId: true, status: true } })
    const canDelete = billing?.applicantId === req.user.id || ['finance', 'finance_hod', 'admin'].includes(req.user.role?.slug)
    if (!canDelete) return res.status(403).json({ message: 'Tiada kebenaran' })

    await prisma.billingAttachment.update({ where: { id: attId }, data: { isDeleted: true, deletedAt: new Date() } })
    try { unlinkSync(att.path) } catch {}
    res.json({ message: 'Lampiran dipadam' })
  } catch (err) { next(err) }
})

// Serve/download attachment
router.get('/:id/attachments/:attId/download', async (req, res, next) => {
  try {
    const att = await prisma.billingAttachment.findFirst({
      where: { id: parseInt(req.params.attId), billingId: parseInt(req.params.id), isDeleted: false },
    })
    if (!att) return res.status(404).json({ message: 'Lampiran tidak dijumpai' })
    res.download(att.path, att.originalName)
  } catch (err) { next(err) }
})

export default router
