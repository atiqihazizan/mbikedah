import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { X, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { BillingService } from '@/billing/services/BillingService'
import { Button, Spinner } from '@/components/ui'

function fmtRM(v) {
  return 'RM ' + Number(v).toLocaleString('ms-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function PaymentModal({ billing, onClose, queryKey }) {
  const qc = useQueryClient()
  const [type, setType] = useState('FULL')
  const [paymentRef, setPaymentRef] = useState('')
  const [remarks, setRemarks] = useState('')
  // Untuk PARTIAL: senarai fasa
  const [phases, setPhases] = useState([{ amount: '', dueDate: '' }])

  const totalAmount = parseFloat(billing.totalAmount)
  const alreadyPaid = (billing.payments ?? [])
    .filter(p => p.paidAt)
    .reduce((s, p) => s + parseFloat(p.amount), 0)
  const remaining = totalAmount - alreadyPaid

  const phasesTotal = phases.reduce((s, p) => s + (parseFloat(p.amount) || 0), 0)
  const phasesValid = phases.every(p => parseFloat(p.amount) > 0)
  const phasesExceed = phasesTotal > remaining + 0.005

  const mut = useMutation({
    mutationFn: (body) => BillingService.pay(billing.id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey })
      toast.success(type === 'FULL' ? 'Bayaran penuh berjaya direkodkan' : 'Bayaran ansuran berjaya direkodkan')
      onClose()
    },
    onError: (e) => toast.error(e.message ?? 'Gagal merekodkan bayaran'),
  })

  function handleSubmit(e) {
    e.preventDefault()
    if (type === 'FULL') {
      mut.mutate({ type: 'FULL', amount: remaining, paymentRef: paymentRef || null, remarks: remarks || null })
    } else {
      if (!phasesValid) return toast.error('Sila isi jumlah untuk setiap fasa')
      if (phasesExceed) return toast.error(`Jumlah fasa (${fmtRM(phasesTotal)}) melebihi baki (${fmtRM(remaining)})`)
      mut.mutate({
        type: 'PARTIAL',
        amount: parseFloat(phases[0].amount),
        paymentRef: paymentRef || null,
        remarks: remarks || null,
        phases: phases.map(p => ({ amount: parseFloat(p.amount), dueDate: p.dueDate || null })),
      })
    }
  }

  function addPhase() { setPhases(ps => [...ps, { amount: '', dueDate: '' }]) }
  function removePhase(i) { setPhases(ps => ps.filter((_, idx) => idx !== i)) }
  function updatePhase(i, k, v) { setPhases(ps => ps.map((p, idx) => idx === i ? { ...p, [k]: v } : p)) }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <div>
            <h3 className="font-semibold text-gray-900">Rekod Bayaran</h3>
            <p className="text-xs text-gray-400 mt-0.5">{billing.refNo}</p>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100"><X className="w-4 h-4" /></button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden">
          <div className="overflow-y-auto px-5 py-4 space-y-4">
            {/* Ringkasan */}
            <div className="bg-gray-50 rounded-lg p-3 text-sm space-y-1">
              <div className="flex justify-between"><span className="text-gray-500">Jumlah Permohonan</span><span className="font-medium">{fmtRM(totalAmount)}</span></div>
              {alreadyPaid > 0 && <div className="flex justify-between"><span className="text-gray-500">Sudah Dibayar</span><span className="text-teal-600 font-medium">{fmtRM(alreadyPaid)}</span></div>}
              <div className="flex justify-between border-t border-gray-200 pt-1 mt-1"><span className="text-gray-700 font-medium">Baki Perlu Dibayar</span><span className="font-semibold text-blue-700">{fmtRM(remaining)}</span></div>
            </div>

            {/* Jenis Bayaran */}
            <div>
              <label className="text-xs font-medium text-gray-600 mb-2 block">Jenis Bayaran</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { val: 'FULL', label: 'Bayar Penuh', sub: fmtRM(remaining) },
                  { val: 'PARTIAL', label: 'Bayaran Ansuran', sub: 'Pecah kepada beberapa fasa' },
                ].map(opt => (
                  <button type="button" key={opt.val}
                    onClick={() => setType(opt.val)}
                    className={`p-3 rounded-lg border-2 text-left transition-colors
                      ${type === opt.val ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <div className={`text-sm font-medium ${type === opt.val ? 'text-blue-700' : 'text-gray-700'}`}>{opt.label}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{opt.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Fasa untuk ansuran */}
            {type === 'PARTIAL' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-gray-600">Fasa Bayaran</label>
                  <span className={`text-xs font-medium ${phasesExceed ? 'text-red-600' : 'text-gray-500'}`}>
                    Jumlah: {fmtRM(phasesTotal)} / {fmtRM(remaining)}
                  </span>
                </div>
                {phases.map((p, i) => (
                  <div key={i} className="flex gap-2 items-start">
                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center shrink-0 mt-2">{i + 1}</div>
                    <div className="flex-1 grid grid-cols-2 gap-2">
                      <div>
                        <input type="number" step="0.01" min="0.01" placeholder="Jumlah (RM)"
                          value={p.amount}
                          onChange={e => updatePhase(i, 'amount', e.target.value)}
                          className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none" />
                      </div>
                      <div>
                        <input type="date" placeholder="Tarikh sasaran"
                          value={p.dueDate}
                          onChange={e => updatePhase(i, 'dueDate', e.target.value)}
                          className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none" />
                      </div>
                    </div>
                    {phases.length > 1 && (
                      <button type="button" onClick={() => removePhase(i)} className="mt-1.5 p-1 text-red-400 hover:text-red-600 rounded">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={addPhase}
                  className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium mt-1">
                  <Plus className="w-3 h-3" /> Tambah Fasa
                </button>
                <p className="text-xs text-gray-400">Fasa 1 akan dibayar sekarang. Fasa seterusnya boleh dibayar kemudian.</p>
              </div>
            )}

            {/* No. Rujukan */}
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">
                No. Rujukan {type === 'PARTIAL' ? '(Fasa 1)' : ''}
              </label>
              <input type="text" placeholder="No. cek / rujukan transaksi"
                value={paymentRef}
                onChange={e => setPaymentRef(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none" />
            </div>

            {/* Catatan */}
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Catatan</label>
              <textarea rows={2} placeholder="Catatan tambahan (jika ada)"
                value={remarks}
                onChange={e => setRemarks(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none resize-none" />
            </div>
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-gray-100 flex justify-end gap-2 shrink-0">
            <Button type="button" variant="outline" onClick={onClose}>Batal</Button>
            <Button type="submit" disabled={mut.isPending || (type === 'PARTIAL' && phasesExceed)}>
              {mut.isPending ? <Spinner size="sm" /> : type === 'FULL' ? 'Rekod Bayaran Penuh' : 'Rekod Bayaran Ansuran'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
