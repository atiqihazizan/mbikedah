/**
 * PaymentViewModel
 *
 * Context: Finance — "Baki berapa? Rujukan apa?"
 * Menghasilkan PaymentSummary dan transaction list untuk halaman detail.
 * Timeline hanya papar ringkasan — bukan senarai transaksi penuh.
 *
 * ADR-008: React membaca vm.x sahaja. Dilarang baca payments[] secara langsung.
 */

// ─── Payment status display ───────────────────────────────────────────────────
const PAYMENT_STATUS_DISPLAY = {
  PENDING:  { color: 'gray',   badge: 'Belum Dibayar',     icon: 'clock'        },
  PARTIAL:  { color: 'blue',   badge: 'Bayaran Separa',    icon: 'half-circle'  },
  PAID:     { color: 'green',  badge: 'Selesai Dibayar',   icon: 'check-circle' },
  STOPPED:  { color: 'red',    badge: 'Diberhentikan',     icon: 'x-circle'     },
}

// ─── PaymentViewModel ─────────────────────────────────────────────────────────
export const PaymentViewModel = {
  /**
   * @param {{ billing, payments }} data
   * @returns {Object} ViewModel
   */
  build({ billing, payments = [] }) {
    if (!billing) return null

    const totalAmount  = parseFloat(billing.totalAmount ?? 0)
    const paidPayments = (payments ?? []).filter(p => p.paidAt)
    const paidAmount   = paidPayments.reduce((s, p) => s + parseFloat(p.amount ?? 0), 0)
    const balanceAmount = Math.max(0, totalAmount - paidAmount)
    const paymentCount  = paidPayments.length

    // Sort: terkini dahulu
    const sorted = [...paidPayments].sort((a, b) => new Date(b.paidAt) - new Date(a.paidAt))
    const last   = sorted[0] ?? null

    // Status
    const isStopped   = billing.status === 'CLOSED'
    const isCompleted = balanceAmount <= 0 || billing.status === 'PAID'

    let paymentStatus = 'PENDING'
    if (isStopped)        paymentStatus = 'STOPPED'
    else if (isCompleted) paymentStatus = 'PAID'
    else if (paidAmount > 0) paymentStatus = 'PARTIAL'

    // nextAction — frontend tidak perlu buat keputusan sendiri
    let nextAction = 'WAIT_PAYMENT'
    if (isCompleted) nextAction = 'COMPLETED'
    if (isStopped)   nextAction = 'STOPPED'

    const remainingPercentage = totalAmount > 0
      ? Math.round((balanceAmount / totalAmount) * 100)
      : 0

    const display = PAYMENT_STATUS_DISPLAY[paymentStatus] ?? PAYMENT_STATUS_DISPLAY.PENDING

    const paymentSummary = {
      status:               paymentStatus,
      display,
      totalAmount,
      paidAmount,
      balanceAmount,
      remainingPercentage,
      lastPaymentAmount:    last ? parseFloat(last.amount) : null,
      lastPaymentDate:      last?.paidAt ?? null,
      lastPaymentReference: last?.paymentRef ?? null,
      paymentCount,
      isCompleted,
      nextAction,
    }

    // Timeline — ringkasan sahaja (bukan senarai penuh)
    const timeline = _buildTimeline(paymentSummary)

    // Transactions — untuk halaman detail sahaja
    const transactions = payments
      .filter(p => p.paidAt)
      .sort((a, b) => new Date(a.paidAt) - new Date(b.paidAt))
      .map((p, idx) => ({
        phase:     p.phase ?? idx + 1,
        amount:    parseFloat(p.amount ?? 0),
        paidAt:    p.paidAt,
        reference: p.paymentRef ?? '—',
        remarks:   p.remarks ?? null,
        label:     _phaseLabel(p.phase ?? idx + 1, payments.filter(x => x.paidAt).length),
      }))

    return { paymentSummary, timeline, transactions }
  },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function _buildTimeline(summary) {
  if (summary.paymentCount === 0) return null

  return {
    label:          summary.paymentCount > 1 ? 'Bayaran Ansuran' : 'Bayaran',
    paidAmount:     summary.paidAmount,
    lastPaymentDate: summary.lastPaymentDate,
    balanceAmount:  summary.balanceAmount,
    remainingPercentage: summary.remainingPercentage,
    isCompleted:    summary.isCompleted,
  }
}

function _phaseLabel(phase, total) {
  if (total === 1)          return 'Bayaran Penuh'
  if (phase === total)      return 'Bayaran Akhir'
  if (phase === 1)          return 'Ansuran Pertama'
  return `Ansuran Ke-${phase}`
}
