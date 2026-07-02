import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CheckCircle, XCircle, RotateCcw, Download, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { BillingService } from '@/billing/services/BillingService'
import { useAuthStore } from '@/store/auth'
import { Button, Spinner } from '@/components/ui'
import { TaskViewModel } from '@/billing/viewmodels'
import { VmStatusBadge, ApprovalHistory, ActionDialog, BillingFormItems } from '@/billing/components'
import LoadingState from '@/components/LoadingState'
import ErrorState   from '@/components/ErrorState'

function fmtDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('ms-MY', { day: 'numeric', month: 'short', year: 'numeric' })
}

function fmtRM(v) {
  return 'RM ' + Number(v).toLocaleString('ms-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function ApprovalQueue() {
  const { id }      = useParams()
  const navigate    = useNavigate()
  const queryClient = useQueryClient()
  const { user }    = useAuthStore()
  const [pendingAction, setPendingAction] = useState(null)

  const APPROVER_ROLES = ['hod', 'finance_hod', 'finance', 'ceo', 'admin']
  useEffect(() => {
    const role = user?.role?.slug
    if (role && !APPROVER_ROLES.includes(role)) navigate(`/permohonan/${id}`, { replace: true })
  }, [user, id, navigate])

  const { data, isLoading, isError } = useQuery({
    queryKey: ['billing-view', id],
    queryFn:  ({ signal }) => BillingService.get(id, { signal }),
  })

  const actionMut = useMutation({
    mutationFn: ({ action, remarks }) => BillingService.action(id, action, { remarks }),
    onSuccess: () => {
      toast.success('Tindakan berjaya')
      setPendingAction(null)
      queryClient.invalidateQueries({ queryKey: ['billings-aktif'] })
      queryClient.invalidateQueries({ queryKey: ['billings-sejarah'] })
      setTimeout(() => navigate('/permohonan'), 800)
    },
    onError: (e) => toast.error(e.message ?? 'Gagal'),
  })

  if (isLoading) return <LoadingState className="min-h-screen" />
  if (isError || !data) return (
    <div className="max-w-4xl mx-auto p-6">
      <ErrorState error={data?.error} onRetry={() => navigate('/permohonan')} />
    </div>
  )

  const { billing, workflow, payments = [], approvalHistory = [] } = data

  const taskVm     = billing ? TaskViewModel.build({ billing, workflow, viewer: user }) : null
  const canApprove = taskVm?.actions?.includes('APPROVE') ?? false
  const canReject  = taskVm?.actions?.includes('REJECT')  ?? false
  const canReturn  = taskVm?.actions?.includes('RETURN')  ?? false
  const hasActions = canApprove || canReject || canReturn
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
          <div className="mt-1">
            {taskVm && <VmStatusBadge display={taskVm.display} />}
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

      {billing.items?.length > 0 && (
        <BillingFormItems editMode={false} billing={billing} items={[]} accounts={[]} />
      )}

      <ApprovalHistory history={approvalHistory} />

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
                <a href={BillingService.downloadUrl(billing.id, att.id)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded" target="_blank" rel="noreferrer">
                  <Download className="w-4 h-4" />
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Panel Tindakan */}
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

      <ActionDialog open={!!pendingAction} action={pendingAction} onClose={() => setPendingAction(null)}
        onConfirm={(remarks) => actionMut.mutate({ action: pendingAction, remarks })}
        isPending={actionMut.isPending} />
    </div>
  )
}
