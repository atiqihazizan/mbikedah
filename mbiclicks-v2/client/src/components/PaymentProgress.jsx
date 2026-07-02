import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { CheckCircle2, Clock, CreditCard } from 'lucide-react'
import { toast } from 'sonner'
import { BillingService } from '@/billing/services/BillingService'
import { Button, Spinner } from '@/components/ui'

function fmtRM(v) {
  return 'RM ' + Number(v).toLocaleString('ms-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
function fmtDate(d) {
  if (!d) return null
  return new Date(d).toLocaleDateString('ms-MY', { day: 'numeric', month: 'short', year: 'numeric' })
}

// Dialog untuk tandakan fasa sebagai dibayar (finance sahaja)
function PayPhaseDialog({ billingId, phase, onClose, queryKey }) {
  const qc = useQueryClient()
  const [paymentRef, setPaymentRef] = useState('')
  const [remarks, setRemarks] = useState('')

  const mut = useMutation({
    mutationFn: () => BillingService.payPhase(billingId, phase.id, { paymentRef: paymentRef || null, remarks: remarks || null }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey })
      toast.success(`Fasa ${phase.phase} berjaya ditandakan sebagai dibayar`)
      onClose()
    },
    onError: (e) => toast.error(e.message ?? 'Gagal kemaskini'),
  })

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-5 space-y-4">
        <h3 className="font-semibold text-gray-900">Tandakan Fasa {phase.phase} Dibayar</h3>
        <p className="text-sm text-gray-600">Jumlah: <span className="font-medium">{fmtRM(phase.amount)}</span></p>
        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">No. Rujukan</label>
          <input type="text" value={paymentRef} onChange={e => setPaymentRef(e.target.value)}
            placeholder="No. cek / rujukan transaksi"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">Catatan</label>
          <textarea rows={2} value={remarks} onChange={e => setRemarks(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none resize-none" />
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Batal</Button>
          <Button onClick={() => mut.mutate()} disabled={mut.isPending}>
            {mut.isPending ? <Spinner size="sm" /> : 'Sahkan Dibayar'}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function PaymentProgress({ billing, canPay = false, queryKey }) {
  const [payingPhase, setPayingPhase] = useState(null)

  const payments = billing.payments ?? []
  if (payments.length === 0) return null

  const totalAmount = parseFloat(billing.totalAmount)
  const totalPaid   = payments.filter(p => p.paidAt).reduce((s, p) => s + parseFloat(p.amount), 0)
  const pct         = Math.min(100, Math.round((totalPaid / totalAmount) * 100))
  const isFullyPaid = billing.status === 'PAID'

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-blue-500" />
          Kemajuan Bayaran
        </h3>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${isFullyPaid ? 'bg-teal-100 text-teal-700' : 'bg-cyan-100 text-cyan-700'}`}>
          {isFullyPaid ? 'Selesai Dibayar' : 'Bayaran Ansuran'}
        </span>
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Dibayar {fmtRM(totalPaid)}</span>
          <span>{pct}% daripada {fmtRM(totalAmount)}</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-teal-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Senarai fasa */}
      <div className="space-y-2">
        {payments.map(p => (
          <div key={p.id} className={`flex items-center gap-3 p-3 rounded-lg border ${p.paidAt ? 'bg-teal-50 border-teal-100' : 'bg-gray-50 border-gray-100'}`}>
            <div className="shrink-0">
              {p.paidAt
                ? <CheckCircle2 className="w-5 h-5 text-teal-500" />
                : <Clock className="w-5 h-5 text-gray-400" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-gray-800">Fasa {p.phase}</span>
                <span className="text-sm font-semibold text-gray-900">{fmtRM(p.amount)}</span>
              </div>
              <div className="text-xs text-gray-400 mt-0.5">
                {p.paidAt ? (
                  <span className="text-teal-600">Dibayar pada {fmtDate(p.paidAt)}{p.paymentRef ? ` · Ruj: ${p.paymentRef}` : ''}</span>
                ) : (
                  <span>{p.dueDate ? `Sasaran: ${fmtDate(p.dueDate)}` : 'Belum dibayar'}</span>
                )}
              </div>
            </div>
            {canPay && !p.paidAt && (
              <button onClick={() => setPayingPhase(p)}
                className="shrink-0 text-xs font-medium text-blue-600 hover:text-blue-700 px-2 py-1 rounded hover:bg-blue-50">
                Bayar
              </button>
            )}
          </div>
        ))}
      </div>

      {payingPhase && (
        <PayPhaseDialog
          billingId={billing.id}
          phase={payingPhase}
          queryKey={queryKey}
          onClose={() => setPayingPhase(null)}
        />
      )}
    </div>
  )
}
