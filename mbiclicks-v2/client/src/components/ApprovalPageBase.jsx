import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { CheckCircle, XCircle, RotateCcw, Download, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Button, Spinner } from '@/components/ui'
import { billingApi, BILLING_STATUS } from '@/lib/billing'

function fmtDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('ms-MY', { day: 'numeric', month: 'short', year: 'numeric' })
}

function fmtRM(v) {
  return 'RM ' + Number(v).toLocaleString('ms-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// ─── ActionDialog — untuk approval/reject/return ───────────────────────────────
function ActionDialog({ action, onClose, onSubmit, isLoading }) {
  const [remarks, setRemarks] = useState('')

  if (!action) return null

  const cfg = {
    APPROVE: { title: 'Luluskan Permohonan', color: 'bg-green-600 hover:bg-green-700', icon: <CheckCircle className="w-5 h-5" /> },
    REJECT:  { title: 'Tolak Permohonan', color: 'bg-red-600 hover:bg-red-700', icon: <XCircle className="w-5 h-5" /> },
    RETURN:  { title: 'Kembalikan Permohonan', color: 'bg-orange-600 hover:bg-orange-700', icon: <RotateCcw className="w-5 h-5" /> },
  }[action]

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center gap-3 mb-4">
          <span className={`${action === 'APPROVE' ? 'text-green-600' : action === 'REJECT' ? 'text-red-600' : 'text-orange-600'}`}>
            {cfg.icon}
          </span>
          <h3 className="text-base font-semibold text-gray-900">{cfg.title}</h3>
        </div>
        <div className="mb-4">
          <label className="text-sm font-medium text-gray-700">
            Ulasan {action !== 'APPROVE' && <span className="text-red-500">*</span>}
          </label>
          <textarea
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none mt-1"
            rows={3}
            placeholder={action === 'APPROVE' ? 'Ulasan (optional)...' : 'Nyatakan sebab...'}
            value={remarks}
            onChange={e => setRemarks(e.target.value)}
          />
        </div>
        <div className="flex justify-end gap-3">
          <button onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
            Batal
          </button>
          <button
            disabled={isLoading || (action !== 'APPROVE' && !remarks.trim())}
            onClick={() => onSubmit({ action, remarks })}
            className={`px-4 py-2 rounded-lg text-white text-sm font-medium flex items-center gap-2 disabled:opacity-50 ${cfg.color}`}
          >
            {isLoading && <Spinner className="w-4 h-4" />}
            Sahkan
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── ApprovalPageBase — reusable page layout ────────────────────────────────
export default function ApprovalPageBase({ billing, isLoading, title, actions = ['APPROVE', 'RETURN', 'REJECT'], onAction, isActionDisabled = false }) {
  const navigate = useNavigate()
  const [action, setAction] = useState(null)

  const actionMut = useMutation({
    mutationFn: ({ action, remarks }) => billingApi.action(billing.id, action, { remarks }),
    onSuccess: () => {
      toast.success('Tindakan berjaya')
      setAction(null)
      setTimeout(() => navigate('/permohonan'), 1500)
    },
    onError: (e) => toast.error(e.response?.data?.message ?? 'Gagal'),
  })

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner />
      </div>
    )
  }

  if (!billing) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-red-900">Permohonan tidak dijumpai</h3>
            <p className="text-sm text-red-700 mt-1">Permohonan tidak wujud atau anda tidak mempunyai kebenaran untuk melihatnya.</p>
            <button onClick={() => navigate('/permohonan')} className="mt-3 text-sm font-medium text-red-600 hover:text-red-700 underline">
              Kembali ke Permohonan
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
          <p className="text-sm text-gray-600 mt-1">{billing.refNo}</p>
        </div>
        <button onClick={() => navigate('/permohonan')} className="text-gray-400 hover:text-gray-600">
          ✕
        </button>
      </div>

      {/* Section A: Maklumat Permohonan */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">Maklumat Permohonan</h2>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-xs text-gray-500 uppercase">Pemohon</p>
            <p className="font-medium text-gray-900 mt-1">{billing.applicant?.name}</p>
            <p className="text-xs text-gray-500 mt-0.5">{billing.applicant?.staffNo} • {billing.applicant?.position?.name}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase">Jabatan</p>
            <p className="font-medium text-gray-900 mt-1">{billing.department?.name}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase">Penerima</p>
            <p className="font-medium text-gray-900 mt-1">{billing.vendor?.name}</p>
            {billing.vendor?.bankName && (
              <p className="text-xs text-gray-500 mt-0.5">{billing.vendor.bankName} • {billing.vendor.bankAcc}</p>
            )}
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase">Jumlah</p>
            <p className="text-lg font-bold text-gray-900 mt-1">{fmtRM(billing.totalAmount)}</p>
          </div>
          {billing.payingBank && (
            <div className="col-span-2">
              <p className="text-xs text-gray-500 uppercase">Bank Pembayar</p>
              <p className="font-medium text-gray-900 mt-1">{billing.payingBank.name} • {billing.payingBank.accNo}</p>
            </div>
          )}
          {billing.paymentMethod && (
            <div>
              <p className="text-xs text-gray-500 uppercase">Kaedah Pembayaran</p>
              <p className="font-medium text-gray-900 mt-1">
                {{ CHEQUE: 'Cek', CASH: 'Tunai', ONLINE: 'Dalam Talian' }[billing.paymentMethod]}
              </p>
            </div>
          )}
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-500 uppercase">Tujuan</p>
          <p className="text-sm text-gray-700 mt-1">{billing.description}</p>
        </div>
      </div>

      {/* Section B: Butiran Item */}
      {billing.items?.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">Butiran Item ({billing.items.length})</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                <tr>
                  <th className="px-4 py-2 text-left">Kod Akaun</th>
                  <th className="px-4 py-2 text-left">Penerangan</th>
                  <th className="px-4 py-2 text-left">Inv</th>
                  <th className="px-4 py-2 text-right">Qty</th>
                  <th className="px-4 py-2 text-right">Unit</th>
                  <th className="px-4 py-2 text-right">Jumlah</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {billing.items.map((item, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-4 py-2 font-mono text-xs text-gray-600">{item.accNo || '—'}</td>
                    <td className="px-4 py-2 text-gray-700">{item.description}</td>
                    <td className="px-4 py-2 text-xs text-gray-600">{item.invoiceNo || '—'}</td>
                    <td className="px-4 py-2 text-right">{item.qty}</td>
                    <td className="px-4 py-2 text-right text-xs text-gray-600">{fmtRM(item.unitCost)}</td>
                    <td className="px-4 py-2 text-right font-medium">{fmtRM(item.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Section C: Sejarah Tindakan */}
      {billing.approvals?.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">Sejarah Tindakan</h2>
          <div className="space-y-3">
            {billing.approvals.map((appr, i) => (
              <div key={i} className="flex gap-4 text-sm">
                <div className="w-24 text-xs text-gray-500 uppercase font-medium">{fmtDate(appr.actionedAt)}</div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    {appr.actor?.name} • {appr.actor?.position?.name}
                  </p>
                  <p className="text-xs text-gray-600 mt-0.5">
                    {appr.step} • {appr.action} • {appr.fromStatus} → {appr.toStatus}
                  </p>
                  {appr.remarks && (
                    <p className="text-xs text-gray-700 mt-1 italic">{appr.remarks}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section D: Lampiran */}
      {billing.attachments?.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">Lampiran</h2>
          <div className="space-y-2">
            {billing.attachments.map(att => (
              <div key={att.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div>
                  <p className="text-sm font-medium text-gray-900">{att.originalName}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{(att.size / 1024).toFixed(0)} KB • {fmtDate(att.uploadedAt)}</p>
                </div>
                <a href={`/api/billings/${billing.id}/attachments/${att.id}/download`}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                  <Download className="w-4 h-4" />
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {!isActionDisabled && (
        <div className="flex gap-3 bg-gray-50 p-6 rounded-lg border border-gray-200">
          {actions.includes('APPROVE') && (
            <button onClick={() => setAction('APPROVE')}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg">
              <CheckCircle className="w-4 h-4" /> Luluskan
            </button>
          )}
          {actions.includes('RETURN') && (
            <button onClick={() => setAction('RETURN')}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg">
              <RotateCcw className="w-4 h-4" /> Kembalikan
            </button>
          )}
          {actions.includes('REJECT') && (
            <button onClick={() => setAction('REJECT')}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg">
              <XCircle className="w-4 h-4" /> Tolak
            </button>
          )}
          <button onClick={() => navigate('/permohonan')}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-100 text-sm font-medium rounded-lg">
            Tutup
          </button>
        </div>
      )}

      <ActionDialog action={action} onClose={() => setAction(null)} onSubmit={mut => actionMut.mutate(mut)} isLoading={actionMut.isPending} />
    </div>
  )
}
