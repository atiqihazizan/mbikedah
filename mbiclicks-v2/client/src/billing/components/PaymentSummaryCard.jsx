// ADR-021: Terima vm={PaymentViewModel} sahaja.
import { CheckCircle2, CreditCard } from 'lucide-react'

function fmtRM(v) {
  return 'RM ' + (parseFloat(v) || 0).toLocaleString('ms-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
function fmtDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('ms-MY', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function PaymentSummaryCard({ vm }) {
  if (!vm) return null
  const { paymentSummary, transactions } = vm

  if (!paymentSummary && !transactions?.length) return null

  // Bayaran ansuran
  if (transactions?.length > 0) {
    return (
      <section className="bg-white border border-gray-200 rounded-lg p-5">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">
          <CreditCard className="w-3.5 h-3.5 inline mr-1.5 mb-0.5" />
          Rekod Bayaran
        </h2>
        <div className="space-y-2">
          {transactions.map((t, i) => (
            <div key={i} className={`flex items-center justify-between p-3 rounded-lg border ${t.isPaid ? 'bg-teal-50 border-teal-200' : 'bg-gray-50 border-gray-200'}`}>
              <div>
                <p className="text-sm font-medium text-gray-900">Fasa {t.phase}</p>
                {t.paymentRef && <p className="text-xs text-gray-500 mt-0.5">Ref: {t.paymentRef}</p>}
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-900">{fmtRM(t.amount)}</p>
                {t.isPaid
                  ? <p className="text-xs text-teal-600 flex items-center gap-1 mt-0.5 justify-end"><CheckCircle2 className="w-3 h-3" /> {fmtDate(t.paidAt)}</p>
                  : <p className="text-xs text-gray-400 mt-0.5">Belum dibayar</p>}
              </div>
            </div>
          ))}
        </div>
        {paymentSummary && (
          <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-2 gap-3 text-sm">
            <div><span className="text-gray-400 text-xs">Sudah Dibayar</span><p className="font-semibold text-teal-700">{fmtRM(paymentSummary.paidAmount)}</p></div>
            <div><span className="text-gray-400 text-xs">Baki</span><p className="font-semibold text-gray-800">{fmtRM(paymentSummary.balanceAmount)}</p></div>
          </div>
        )}
      </section>
    )
  }

  // Bayaran penuh selesai
  if (paymentSummary?.isCompleted) {
    return (
      <section className="bg-teal-50 border border-teal-200 rounded-lg p-5">
        <h2 className="text-xs font-semibold text-teal-700 uppercase tracking-wide mb-3 flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5" /> Bayaran Selesai
        </h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><span className="text-gray-500 text-xs">Jumlah Dibayar</span><p className="font-bold text-teal-700 mt-0.5">{fmtRM(paymentSummary.paidAmount)}</p></div>
          {paymentSummary.lastPaymentDate && (
            <div><span className="text-gray-500 text-xs">Tarikh Bayar</span><p className="font-medium mt-0.5">{fmtDate(paymentSummary.lastPaymentDate)}</p></div>
          )}
          {paymentSummary.lastPaymentReference && (
            <div className="col-span-2"><span className="text-gray-500 text-xs">No. Rujukan</span><p className="font-mono font-medium mt-0.5">{paymentSummary.lastPaymentReference}</p></div>
          )}
        </div>
      </section>
    )
  }

  return null
}
