import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CheckCircle, XCircle, RotateCcw, Download, AlertCircle, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { billingApi } from '@/lib/billing'
import { useAuthStore } from '@/store/auth'
import { Button, Spinner } from '@/components/ui'
import { TaskViewModel } from '@/billing/viewmodels'

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('ms-MY', { day: 'numeric', month: 'short', year: 'numeric' })
}

function fmtRM(v) {
  return 'RM ' + Number(v).toLocaleString('ms-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const STATUS_COLOR = {
  gray:   'bg-gray-100 text-gray-700',   yellow: 'bg-yellow-100 text-yellow-800',
  orange: 'bg-orange-100 text-orange-800', blue: 'bg-blue-100 text-blue-800',
  indigo: 'bg-indigo-100 text-indigo-800', purple: 'bg-purple-100 text-purple-800',
  green:  'bg-green-100 text-green-700',  red:   'bg-red-100 text-red-700',
  teal:   'bg-teal-100 text-teal-700',
}

const ACTION_LABELS = { SUBMIT: 'Dihantar', APPROVE: 'Diluluskan', VERIFY: 'Disahkan',
  REJECT: 'Ditolak', RETURN: 'Dikembalikan', PAY: 'Dibayar' }
const ACTION_COLOR = { SUBMIT: 'text-blue-600', APPROVE: 'text-green-600', VERIFY: 'text-green-600',
  REJECT: 'text-red-600', RETURN: 'text-orange-600', PAY: 'text-teal-600' }
const STEP_LABELS = { SUBMIT: 'Pemohon', HOD: 'Ketua Jabatan', FINANCE_CHECK: 'Semakan Kewangan',
  FINANCE_VERIFY: 'Pengesahan Kewangan', FINANCE_APPROVAL: 'Kelulusan Kewangan', PAYMENT: 'Pembayaran' }

// ─── Dialog Tindakan ──────────────────────────────────────────────────────────
function ActionDialog({ action, onClose, onSubmit, isLoading }) {
  const [remarks, setRemarks] = useState('')
  if (!action) return null

  const cfg = {
    APPROVE: { title: 'Luluskan Permohonan',     btnColor: 'bg-green-600 hover:bg-green-700',   icon: <CheckCircle className="w-5 h-5" /> },
    REJECT:  { title: 'Tolak Permohonan',        btnColor: 'bg-red-600 hover:bg-red-700',       icon: <XCircle className="w-5 h-5" /> },
    RETURN:  { title: 'Kembalikan Permohonan',   btnColor: 'bg-orange-600 hover:bg-orange-700', icon: <RotateCcw className="w-5 h-5" /> },
  }[action]

  const needRemarks = action !== 'APPROVE'

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center gap-3 mb-4">
          <span className={action === 'APPROVE' ? 'text-green-600' : action === 'REJECT' ? 'text-red-600' : 'text-orange-600'}>
            {cfg.icon}
          </span>
          <h3 className="text-base font-semibold text-gray-900">{cfg.title}</h3>
        </div>
        <div className="mb-4">
          <label className="text-sm font-medium text-gray-700">
            Ulasan {needRemarks && <span className="text-red-500">*</span>}
          </label>
          <textarea
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none mt-1"
            rows={3}
            placeholder={needRemarks ? 'Nyatakan sebab...' : 'Ulasan (pilihan)...'}
            value={remarks}
            onChange={e => setRemarks(e.target.value)}
          />
        </div>
        <div className="flex justify-end gap-3">
          <button onClick={onClose} disabled={isLoading}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50">
            Batal
          </button>
          <button
            disabled={isLoading || (needRemarks && !remarks.trim())}
            onClick={() => onSubmit({ action, remarks })}
            className={`px-4 py-2 rounded-lg text-white text-sm font-medium flex items-center gap-2 disabled:opacity-50 ${cfg.btnColor}`}
          >
            {isLoading && <Spinner className="w-4 h-4" />}
            Sahkan
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── ApprovalQueue — main page ────────────────────────────────────────────────
export default function ApprovalQueue() {
  const { id }      = useParams()
  const navigate    = useNavigate()
  const queryClient = useQueryClient()
  const { user }    = useAuthStore()
  const [pendingAction, setPendingAction] = useState(null)

  // GET /billings/:id → { billing, workflow, payments, approvalHistory }
  const { data, isLoading, isError } = useQuery({
    queryKey: ['billing-view', id],
    queryFn:  () => billingApi.get(id),
  })

  const actionMut = useMutation({
    mutationFn: ({ action, remarks }) => billingApi.action(id, action, { remarks }),
    onSuccess: () => {
      toast.success('Tindakan berjaya')
      setPendingAction(null)
      queryClient.invalidateQueries({ queryKey: ['billings-aktif'] })
      queryClient.invalidateQueries({ queryKey: ['billings-sejarah'] })
      setTimeout(() => navigate('/permohonan'), 800)
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

  if (isError || !data) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-900">Permohonan tidak dijumpai</h3>
            <p className="text-sm text-red-700 mt-1">Permohonan tidak wujud atau anda tidak mempunyai kebenaran.</p>
            <button onClick={() => navigate('/permohonan')}
              className="mt-3 text-sm font-medium text-red-600 hover:text-red-700 underline">
              Kembali ke Permohonan
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Destructure API contract
  const { billing, workflow, payments = [], approvalHistory = [] } = data

  // TaskViewModel — ADR-008: React membaca vm.x sahaja
  const taskVm     = billing ? TaskViewModel.build({ billing, workflow, viewer: user }) : null
  const canApprove = taskVm?.actions?.includes('APPROVE') ?? false
  const canReject  = taskVm?.actions?.includes('REJECT')  ?? false
  const canReturn  = taskVm?.actions?.includes('RETURN')  ?? false
  const hasActions = canApprove || canReject || canReturn

  const statusCls  = STATUS_COLOR[taskVm?.display?.color ?? 'gray']
  const isActing   = actionMut.isPending || actionMut.isSuccess

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <button onClick={() => navigate('/permohonan')}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-2">
            <ArrowLeft className="w-4 h-4" /> Kembali
          </button>
          <h1 className="text-2xl font-semibold text-gray-900">{billing.refNo}</h1>
          <div className="flex items-center gap-2 mt-1">
            {taskVm && (
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusCls}`}>
                {taskVm.title}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Maklumat Permohonan */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Maklumat Permohonan</h2>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-xs text-gray-400 uppercase">Pemohon</p>
            <p className="font-medium text-gray-900 mt-1">{billing.applicant?.name}</p>
            <p className="text-xs text-gray-500 mt-0.5">{billing.applicant?.staffNo} • {billing.applicant?.position?.name}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase">Jabatan</p>
            <p className="font-medium text-gray-900 mt-1">{billing.department?.name}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase">Penerima</p>
            <p className="font-medium text-gray-900 mt-1">{billing.vendor?.name}</p>
            {billing.vendor?.bankName && (
              <p className="text-xs text-gray-500 mt-0.5">{billing.vendor.bankName} • {billing.vendor.bankAcc}</p>
            )}
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase">Jumlah</p>
            <p className="text-xl font-bold text-gray-900 mt-1">{fmtRM(billing.totalAmount)}</p>
          </div>
          {billing.payingBank && (
            <div className="col-span-2">
              <p className="text-xs text-gray-400 uppercase">Bank Pembayar</p>
              <p className="font-medium text-gray-900 mt-1">{billing.payingBank.name} • {billing.payingBank.accNo}</p>
            </div>
          )}
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-400 uppercase">Tujuan</p>
          <p className="text-sm text-gray-700 mt-1">{billing.description}</p>
        </div>
      </div>

      {/* Butiran Item */}
      {billing.items?.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
            Butiran Item ({billing.items.length})
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-400 uppercase tracking-wide">
                <tr>
                  <th className="px-4 py-2 text-left">Kod Akaun</th>
                  <th className="px-4 py-2 text-left">Penerangan</th>
                  <th className="px-4 py-2 text-left">Invois</th>
                  <th className="px-4 py-2 text-right">Qty</th>
                  <th className="px-4 py-2 text-right">Unit</th>
                  <th className="px-4 py-2 text-right">Jumlah</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {billing.items.map((item, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-4 py-2 font-mono text-xs text-gray-500">{item.accNo || '—'}</td>
                    <td className="px-4 py-2 text-gray-700">{item.description}</td>
                    <td className="px-4 py-2 text-xs text-gray-500">{item.invoiceNo || '—'}</td>
                    <td className="px-4 py-2 text-right text-gray-700">{item.qty}</td>
                    <td className="px-4 py-2 text-right text-xs text-gray-500">{fmtRM(item.unitCost)}</td>
                    <td className="px-4 py-2 text-right font-medium text-gray-900">{fmtRM(item.amount)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 border-t border-gray-200">
                <tr>
                  <td colSpan={5} className="px-4 py-2 text-right text-sm font-semibold text-gray-700">Jumlah Keseluruhan</td>
                  <td className="px-4 py-2 text-right font-bold text-gray-900">{fmtRM(billing.totalAmount)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Sejarah Tindakan — dari approvalHistory (API contract) */}
      {approvalHistory?.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Sejarah Tindakan</h2>
          <div className="space-y-4">
            {approvalHistory.map((t, i) => (
              <div key={i} className="flex gap-4 text-sm">
                <div className="w-28 shrink-0 text-xs text-gray-400 pt-0.5">{fmtDate(t.actionedAt)}</div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{t.actor?.name}
                    {t.actor?.position && <span className="text-xs text-gray-400 ml-1">• {t.actor.position?.name ?? t.actor.position}</span>}
                  </p>
                  <p className={`text-xs mt-0.5 ${ACTION_COLOR[t.action] ?? 'text-gray-500'}`}>
                    {ACTION_LABELS[t.action] ?? t.action} • {STEP_LABELS[t.step] ?? t.step}
                  </p>
                  {t.remarks && <p className="text-xs text-gray-600 italic mt-1">"{t.remarks}"</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lampiran */}
      {billing.attachments?.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Lampiran</h2>
          <div className="space-y-2">
            {billing.attachments.map(att => (
              <div key={att.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div>
                  <p className="text-sm font-medium text-gray-900">{att.originalName}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{(att.size / 1024).toFixed(0)} KB • {fmtDate(att.uploadedAt)}</p>
                </div>
                <a href={billingApi.downloadUrl(billing.id, att.id)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded" target="_blank" rel="noreferrer">
                  <Download className="w-4 h-4" />
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Butang Tindakan — dari TaskViewModel.actions (ADR-008) */}
      {hasActions && (
        <div className="flex flex-wrap gap-3 bg-gray-50 p-5 rounded-lg border border-gray-200">
          {canApprove && (
            <button onClick={() => setPendingAction('APPROVE')} disabled={isActing}
              className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg disabled:opacity-50">
              <CheckCircle className="w-4 h-4" /> Luluskan
            </button>
          )}
          {canReturn && (
            <button onClick={() => setPendingAction('RETURN')} disabled={isActing}
              className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg disabled:opacity-50">
              <RotateCcw className="w-4 h-4" /> Kembalikan
            </button>
          )}
          {canReject && (
            <button onClick={() => setPendingAction('REJECT')} disabled={isActing}
              className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg disabled:opacity-50">
              <XCircle className="w-4 h-4" /> Tolak
            </button>
          )}
          <button onClick={() => navigate('/permohonan')} disabled={isActing}
            className="flex items-center gap-2 px-5 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-100 text-sm font-medium rounded-lg disabled:opacity-50 ml-auto">
            Tutup
          </button>
        </div>
      )}

      <ActionDialog
        action={pendingAction}
        onClose={() => setPendingAction(null)}
        onSubmit={({ action, remarks }) => actionMut.mutate({ action, remarks })}
        isLoading={actionMut.isPending}
      />
    </div>
  )
}
