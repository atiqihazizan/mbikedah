/**
 * ApplicationViewModel
 *
 * Context: Pemohon — "Permohonan saya di mana?"
 * Semua orang yang buat permohonan (staff, HOD, CEO, finance) gunakan VM ini
 * untuk melihat status permohonan mereka sendiri.
 *
 * ADR-008: React membaca vm.x sahaja. Dilarang baca billing.status secara langsung.
 */

// ─── Display config per step status ──────────────────────────────────────────
const STEP_DISPLAY = {
  completed: { color: 'green',  icon: 'check'   },
  current:   { color: 'blue',   icon: 'clock'   },
  pending:   { color: 'gray',   icon: 'circle'  },
  cancelled: { color: 'red',    icon: 'x'       },
}

// ─── Status display (badge + warna keseluruhan) ───────────────────────────────
const STATUS_DISPLAY = {
  // Dari workflow.steps "current" key
  SUBMIT:    { badge: 'Draf',               color: 'gray'   },
  APPROVAL:  { badge: 'Menunggu Kelulusan', color: 'yellow' },
  FINANCE:   { badge: 'Sedang Diproses',    color: 'blue'   },
  PAYMENT:   { badge: 'Proses Bayaran',     color: 'indigo' },
  COMPLETE:  { badge: 'Selesai',            color: 'green'  },
}

// ─── Terminal state messages (ADR-009) ───────────────────────────────────────
const LOCKED_MESSAGES = {
  REJECTED:     'Permohonan ini telah ditolak dan tidak boleh diubah.',
  CLOSED:       'Permohonan ini telah ditutup. Lihat sejarah kelulusan untuk maklumat penutupan.',
  PAID:         'Permohonan ini telah dibayar dan ditutup.',
  PARTIAL_PAID: 'Permohonan ini telah dibayar dan ditutup.',
}

// ─── Status display untuk list items (tanpa workflow) ───────────────────────
const STATUS_DISPLAY_MAP = {
  DRAFT:                    { badge: 'Draf',                color: 'gray'   },
  PENDING_HOD:              { badge: 'Menunggu KJ',         color: 'yellow' },
  PENDING_CEO:              { badge: 'Menunggu KE',         color: 'orange' },
  PENDING_FINANCE_CHECK:    { badge: 'Semakan Kewangan',    color: 'blue'   },
  PENDING_FINANCE_VERIFY:   { badge: 'Pengesahan Kewangan', color: 'indigo' },
  PENDING_FINANCE_APPROVAL: { badge: 'Kelulusan Kewangan',  color: 'purple' },
  PENDING_CEO_FINAL:        { badge: 'Kelulusan Muktamad',  color: 'orange' },
  APPROVED:                 { badge: 'Diluluskan',          color: 'green'  },
  PARTIAL_PAID:             { badge: 'Bayaran Ansuran',     color: 'teal'   },
  PAID:                     { badge: 'Selesai Dibayar',     color: 'teal'   },
  CLOSED:                   { badge: 'Ditutup',             color: 'gray'   },
  REJECTED:                 { badge: 'Ditolak',             color: 'red'    },
  RETURNED:                 { badge: 'Dikembalikan',        color: 'orange' },
}

// ─── ApplicationViewModel ─────────────────────────────────────────────────────
export const ApplicationViewModel = {
  /**
   * @param {{ billing, workflow, payments, viewer }} data
   * viewer optional — hantar untuk flags isOwner/canEdit/lockedMessage
   * @returns {Object|null} ViewModel
   */
  build({ billing, workflow, payments = [], viewer = null }) {
    if (!billing || !workflow) return null

    const steps = workflow.steps ?? []

    // ── step semasa ────────────────────────────────────────────────────────
    const currentStep     = steps.find(s => s.status === 'current')
    const currentStepIdx  = steps.findIndex(s => s.status === 'current')
    const completedCount  = steps.filter(s => s.status === 'completed').length
    const totalSteps      = steps.length
    const progress        = totalSteps > 0
      ? Math.round((completedCount / totalSteps) * 100)
      : 0

    // ── display ───────────────────────────────────────────────────────────
    const statusKey = currentStep?.key ?? 'COMPLETE'
    const statusCfg = STATUS_DISPLAY[statusKey] ?? { badge: currentStep?.label ?? '—', color: 'gray' }

    const display = {
      color: statusCfg.color,
      icon:  statusKey === 'COMPLETE' ? 'check-circle' : 'clock',
      badge: statusCfg.badge,
    }

    // ── steps dengan display ──────────────────────────────────────────────
    const stepsWithDisplay = steps.map((s, idx) => ({
      key:     s.key,
      label:   s.label,
      status:  s.status,
      display: STEP_DISPLAY[s.status] ?? STEP_DISPLAY.pending,
      index:   idx + 1,
    }))

    // ── terminal state (ADR-009: dibenarkan baca billing.status untuk terminal) ──
    const rawStatus     = billing.status
    const isLocked      = ['REJECTED', 'PAID', 'PARTIAL_PAID', 'CLOSED'].includes(rawStatus)
    const lockedMessage = isLocked ? (LOCKED_MESSAGES[rawStatus] ?? 'Permohonan ini telah ditutup.') : null

    // ── viewer-dependent flags (optional — hantar viewer untuk page context) ──
    const isOwner = viewer != null ? billing.applicantId === viewer.id : null
    const canEdit = !!(isOwner && !isLocked && (rawStatus === 'DRAFT' || rawStatus === 'RETURNED'))

    // ── payment summary ringkas ───────────────────────────────────────────────
    const paymentSummary = _buildPaymentSummary(billing, payments)

    return {
      refNo:            billing.refNo,
      description:      billing.description,
      totalAmount:      parseFloat(billing.totalAmount ?? 0),
      status:           currentStep?.label ?? '—',
      display,
      steps:            stepsWithDisplay,
      currentStepIndex: currentStepIdx + 1,
      totalSteps,
      progress,
      paymentSummary,
      workflowType:     workflow.workflowType,
      isLocked,
      lockedMessage,
      isOwner,
      canEdit,
    }
  },

  /**
   * Untuk list pages — list item tidak ada workflow.
   * Gunakan status string untuk display + kira actionPath ikut role.
   * ADR-008: Page tidak perlu import BILLING_STATUS atau semak billing.status.
   */
  buildFromListItem(billing, viewer = null) {
    const status  = billing.status ?? ''
    const display = STATUS_DISPLAY_MAP[status] ?? { badge: status, color: 'gray' }
    const id      = billing.id
    const role    = viewer?.role?.slug ?? ''

    // Kira actionPath dalam ViewModel — page hanya navigate(vm.actionPath)
    let actionPath  = `/permohonan/${id}`
    let actionLabel = 'Lihat'
    let actionColor = 'gray'

    if (role === 'hod' || role === 'finance_hod' || role === 'admin') {
      if (status === 'PENDING_HOD') {
        actionPath = `/permohonan/${id}/hod`; actionLabel = 'Semak & Lulus'; actionColor = 'green'
      }
    }
    if (role === 'ceo' || role === 'admin') {
      if (status === 'PENDING_CEO' || status === 'PENDING_CEO_FINAL') {
        actionPath = `/permohonan/${id}/ceo`; actionLabel = 'Semak'; actionColor = 'rose'
      }
    }
    if (role === 'finance' || role === 'finance_hod' || role === 'admin') {
      if (status === 'PENDING_FINANCE_CHECK') {
        actionPath = `/permohonan/${id}/semakan-kewangan`; actionLabel = 'Semak'; actionColor = 'blue'
      } else if (status === 'PENDING_FINANCE_VERIFY') {
        actionPath = `/permohonan/${id}/pengesahan-kewangan`; actionLabel = 'Sahkan'; actionColor = 'indigo'
      }
    }
    if (role === 'finance_hod' || role === 'admin') {
      if (status === 'PENDING_FINANCE_APPROVAL') {
        actionPath = `/permohonan/${id}/kelulusan-kewangan`; actionLabel = 'Lulus'; actionColor = 'purple'
      }
    }

    return {
      display:      { color: display.color, badge: display.badge },
      isLocked:     ['REJECTED', 'PAID', 'PARTIAL_PAID', 'CLOSED'].includes(status),
      refNo:        billing.refNo,
      totalAmount:  parseFloat(billing.totalAmount ?? 0),
      actionPath,
      actionLabel,
      actionColor,
    }
  },
}

// ─── Helper: payment summary untuk application context ───────────────────────
function _buildPaymentSummary(billing, payments) {
  if (!payments || payments.length === 0) return null

  const totalAmount  = parseFloat(billing.totalAmount ?? 0)
  const paidPayments = payments.filter(p => p.paidAt)
  const paidAmount   = paidPayments.reduce((s, p) => s + parseFloat(p.amount ?? 0), 0)
  const balanceAmount = Math.max(0, totalAmount - paidAmount)

  const last = paidPayments.sort((a, b) => new Date(b.paidAt) - new Date(a.paidAt))[0]

  return {
    paidAmount,
    balanceAmount,
    remainingPercentage: totalAmount > 0
      ? Math.round((balanceAmount / totalAmount) * 100)
      : 0,
    lastPaymentAmount:    last ? parseFloat(last.amount) : null,
    lastPaymentDate:      last?.paidAt ?? null,
    lastPaymentReference: last?.paymentRef ?? null,
    paymentCount:         paidPayments.length,
    isCompleted:          balanceAmount <= 0,
  }
}
