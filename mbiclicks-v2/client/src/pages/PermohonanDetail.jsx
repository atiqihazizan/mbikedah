import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ChevronLeft, Send, CreditCard, Pencil, Upload } from 'lucide-react'
import { BillingService } from '@/billing/services/BillingService'
import { useAuthStore } from '@/store/auth'
import { Button, Spinner } from '@/components/ui'
import api from '@/lib/api'
import PaymentModal from '@/components/PaymentModal'
import PaymentProgress from '@/components/PaymentProgress'
import { ApplicationViewModel, TaskViewModel, PaymentViewModel } from '@/billing/viewmodels'
import {
  VmStatusBadge, ApplicationTimeline, ApprovalHistory, PaymentSummaryCard,
  ActionDialog, CloseKesDialog, VendorModal,
  BillingFormInfo, BillingFormItems, BillingAttachments,
} from '@/billing/components'
import LoadingState from '@/components/LoadingState'
import ErrorState   from '@/components/ErrorState'

const EMPTY_ITEM = { accNo: '', description: '', invoiceNo: '', qty: 1, unitCost: '' }

export default function PermohonanDetail() {
  const { id }   = useParams()
  const navigate = useNavigate()
  const qc       = useQueryClient()
  const { user } = useAuthStore()

  const [editMode, setEditMode]       = useState(!id)
  const [dialog, setDialog]           = useState(null)
  const [vendorModal, setVendorModal] = useState(null)
  const [form, setForm]               = useState({ vendorId: '', projectNo: '', description: '' })
  const [items, setItems]             = useState([{ ...EMPTY_ITEM }])
  const [files, setFiles]             = useState([])
  const [attachments, setAttachments] = useState([])

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['billing', id],
    queryFn:  ({ signal }) => BillingService.get(id, { signal }),
    enabled:  !!id,
    retry:    (count, err) => err?.status !== 403 && count < 2,
  })
  const { data: vendorData } = useQuery({
    queryKey: ['vendors', 'active'],
    queryFn:  ({ signal }) => BillingService.listVendors({ status: 'active', limit: 500 }, { signal }),
  })
  const { data: accountData } = useQuery({
    queryKey: ['accounts-belanja-leaf'],
    queryFn:  () => api.get('/accounts', { params: { type: 'BELANJA', status: 'active', leafOnly: 'true', limit: 2000 } }).then(r => r.data),
  })

  const { billing, workflow, payments = [], approvalHistory = [] } = data ?? {}
  const vendors  = vendorData?.items ?? []
  const accounts = accountData?.data ?? []

  const appVm  = billing ? ApplicationViewModel.build({ billing, workflow, payments, viewer: user }) : null
  const taskVm = billing ? TaskViewModel.build({ billing, workflow, viewer: user }) : null
  const payVm  = billing ? PaymentViewModel.build({ billing, payments }) : null

  const isLocked = appVm?.isLocked  ?? false
  const canEdit  = !id || (appVm?.canEdit ?? false)
  const canPay   = taskVm?.actions?.includes('PAY') ?? false

  useEffect(() => {
    if (!editMode || !billing) return
    setForm({ vendorId: billing.vendorId ?? '', projectNo: billing.projectNo ?? '', description: billing.description ?? '' })
    setItems(billing.items.map(i => ({ accNo: i.accNo ?? '', description: i.description, invoiceNo: i.invoiceNo ?? '', qty: Number(i.qty), unitCost: Number(i.unitCost) })))
    setAttachments(billing.attachments ?? [])
  }, [editMode, billing])

  const canSubmit = canEdit && form.description.trim() && items.some(i => i.description.trim()) && form.vendorId

  const submitMut    = useMutation({ mutationFn: () => BillingService.submit(id), onSuccess: () => { qc.invalidateQueries({ queryKey: ['billing', id] }); qc.invalidateQueries({ queryKey: ['billings'] }); toast.success('Permohonan dihantar'); setEditMode(false) }, onError: (e) => toast.error(e.message ?? 'Gagal') })
  const saveMut      = useMutation({
    mutationFn: (body) => id ? BillingService.update(id, body) : BillingService.create(body),
    onSuccess: async (res) => {
      const bid = id || res.data?.id
      for (const f of files) { try { await BillingService.uploadAtt(bid, f) } catch {} }
      qc.invalidateQueries({ queryKey: ['billing', bid] }); qc.invalidateQueries({ queryKey: ['billings'] })
      toast.success(id ? 'Permohonan dikemaskini' : 'Draf berjaya disimpan')
      if (!id) navigate(`/permohonan/${bid}`)
      setEditMode(false); setFiles([])
    },
    onError: (e) => toast.error(e.message ?? 'Gagal menyimpan'),
  })
  const actionMut    = useMutation({ mutationFn: ({ action, remarks }) => BillingService.action(id, action, { remarks }), onSuccess: () => { qc.invalidateQueries({ queryKey: ['billing', id] }); qc.invalidateQueries({ queryKey: ['billings'] }); toast.success('Tindakan berjaya'); setDialog(null) }, onError: (e) => toast.error(e.message ?? 'Gagal') })
  const closeMut     = useMutation({ mutationFn: (reason) => BillingService.close(id, { reason }), onSuccess: () => { qc.invalidateQueries({ queryKey: ['billing', id] }); qc.invalidateQueries({ queryKey: ['billings'] }); toast.success('Permohonan berjaya ditutup'); setDialog(null) }, onError: (e) => toast.error(e.message ?? 'Gagal menutup permohonan') })
  const deleteAttMut = useMutation({ mutationFn: (attId) => BillingService.deleteAtt(id, attId), onSuccess: (_, attId) => setAttachments(prev => prev.filter(a => a.id !== attId)), onError: () => toast.error('Gagal memadam lampiran') })

  function handleSave() {
    const validItems = items.filter(i => i.description.trim())
    if (!validItems.length) return toast.error('Sekurang-kurangnya satu butiran diperlukan')
    if (!form.description.trim()) return toast.error('Tujuan pembayaran wajib diisi')
    if (!form.vendorId) return toast.error('Sila pilih penerima')
    saveMut.mutate({ vendorId: parseInt(form.vendorId), projectNo: form.projectNo || null, description: form.description, items: validItems.map(i => ({ accNo: i.accNo || null, description: i.description, invoiceNo: i.invoiceNo || null, qty: parseFloat(i.qty) || 1, unitCost: parseFloat(i.unitCost) || 0 })) })
  }

  function handleVendorChange(vid) {
    setForm(f => ({ ...f, vendorId: vid ?? '' }))
    const v = vendors.find(x => String(x.id) === String(vid))
    if (v?.accNo && items.length === 1 && !items[0].accNo) setItems(p => p.map((item, i) => i === 0 ? { ...item, accNo: v.accNo } : item))
  }

  const selectedVendor = vendors.find(v => String(v.id) === String(form.vendorId))
  const showPayment    = payVm && (payVm.transactions.length > 0 || payVm.paymentSummary?.isCompleted)

  if (isLoading) return <LoadingState />
  if (id && error)   return <div className="p-6"><ErrorState error={error} onRetry={refetch} /></div>
  if (id && !billing) return <div className="p-6 text-center text-gray-400">Permohonan tidak dijumpai</div>

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/permohonan')} className="text-gray-400 hover:text-gray-600">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold text-gray-900">{!id ? 'Permohonan Pembayaran Baru' : billing?.refNo}</h1>
              {appVm && <VmStatusBadge display={appVm.display} />}
            </div>
            <p className="text-sm text-gray-400 mt-0.5">MENTERI BESAR KEDAH INCORPORATED</p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          {canEdit && <Button variant={editMode ? 'outline' : 'default'} onClick={() => editMode ? setEditMode(false) : setEditMode(true)}><Pencil className="w-4 h-4 mr-1.5" />{editMode ? 'Batal Edit' : 'Edit'}</Button>}
          {editMode && <Button onClick={handleSave} disabled={saveMut.isPending || !canSubmit}>{saveMut.isPending ? <Spinner className="w-4 h-4 mr-1.5" /> : <Upload className="w-4 h-4 mr-1.5" />}{id ? 'Simpan' : 'Simpan Draf'}</Button>}
          {!editMode && appVm?.canEdit && <Button onClick={() => submitMut.mutate()} disabled={submitMut.isPending}>{submitMut.isPending ? <Spinner className="w-4 h-4 mr-1.5" /> : <Send className="w-4 h-4 mr-1.5" />}Hantar</Button>}
          {!editMode && canPay && <Button onClick={() => setDialog({ type: 'pay' })} className="bg-teal-600 hover:bg-teal-700 text-white"><CreditCard className="w-4 h-4 mr-1.5" /> Rekod Bayaran</Button>}
          {!editMode && canPay && <Button onClick={() => setDialog({ type: 'close' })} variant="outline" className="border-red-300 text-red-600 hover:bg-red-50">Tutup Kes</Button>}
        </div>
      </div>

      <div className="space-y-6">
        <BillingFormInfo editMode={editMode} billing={billing} form={form} setForm={setForm} user={user}
          vendors={vendors} accounts={accounts} selectedVendor={selectedVendor}
          onVendorChange={handleVendorChange}
          onVendorEdit={(v) => setVendorModal({ initial: v })}
          onVendorAdd={() => setVendorModal({})} />

        {appVm && <ApplicationTimeline vm={appVm} />}

        <BillingFormItems editMode={editMode} billing={billing} items={items} accounts={accounts}
          onAddItem={() => setItems(p => [...p, { ...EMPTY_ITEM }])}
          onRemoveItem={(idx) => setItems(p => p.filter((_, i) => i !== idx))}
          onUpdateItem={(idx, f, v) => setItems(p => p.map((item, i) => i === idx ? { ...item, [f]: v } : item))} />

        <BillingAttachments editMode={editMode} billingId={id} attachments={editMode ? attachments : (billing?.attachments ?? [])}
          pendingFiles={files}
          onDeleteAtt={(attId) => deleteAttMut.mutate(attId)}
          onFilePick={(valid) => { if (valid.length === 0) toast.warning('Hanya JPG/PNG/PDF sehingga 10MB'); setFiles(p => [...p, ...valid]) }}
          onFileRemove={(i) => setFiles(p => p.filter((_, j) => j !== i))} />

        {showPayment && (
          payVm.transactions.length > 0
            ? <PaymentProgress billing={{ ...billing, payments }} canPay={canPay} queryKey={['billing', id]} />
            : <PaymentSummaryCard vm={payVm} />
        )}

        <ApprovalHistory history={approvalHistory} />

        {isLocked && appVm?.lockedMessage && (
          <section className="bg-gray-50 border border-gray-200 rounded-lg p-5 text-center">
            <p className="text-sm text-gray-600">{appVm.lockedMessage}</p>
          </section>
        )}
      </div>

      {/* Dialogs */}
      <ActionDialog open={dialog?.type === 'action'} action={dialog?.action} onClose={() => setDialog(null)}
        onConfirm={(remarks) => actionMut.mutate({ action: dialog.action, remarks })} isPending={actionMut.isPending} />
      {dialog?.type === 'pay' && billing && (
        <PaymentModal billing={{ ...billing, payments }} queryKey={['billing', id]} onClose={() => setDialog(null)} />
      )}
      {dialog?.type === 'close' && (
        <CloseKesDialog payVm={payVm} onClose={() => setDialog(null)}
          onConfirm={(reason) => closeMut.mutate(reason)} isPending={closeMut.isPending} />
      )}
      <VendorModal open={vendorModal !== null} initial={vendorModal?.initial} accounts={accounts}
        onClose={() => setVendorModal(null)}
        onSaved={(vendor) => { if (!vendorModal?.initial) setForm(f => ({ ...f, vendorId: vendor.id })) }} />
    </div>
  )
}
