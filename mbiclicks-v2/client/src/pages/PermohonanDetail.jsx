import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  ChevronLeft, Send, CheckCircle, XCircle, RotateCcw, FileText, Download,
  Trash2, Upload, X, Plus, Pencil, Building2, User2, CreditCard,
} from 'lucide-react'
import { billingApi, vendorApi, BILLING_STATUS } from '@/lib/billing'
import { useAuthStore } from '@/store/auth'
import { Button, Input, Label, Spinner, SearchableSelect } from '@/components/ui'
import api from '@/lib/api'
import PaymentModal from '@/components/PaymentModal'
import PaymentProgress from '@/components/PaymentProgress'

function CloseKesDialog({ billing, onClose, onConfirm, isPending }) {
  const [reason, setReason] = useState('')
  const paid = (billing?.payments ?? []).filter(p => p.paidAt).reduce((s, p) => s + parseFloat(p.amount), 0)
  const remaining = parseFloat(billing?.totalAmount ?? 0) - paid

  function handleSubmit(e) {
    e.preventDefault()
    if (!reason.trim()) return
    onConfirm(reason.trim())
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <XCircle className="w-4 h-4 text-red-500" /> Tutup Kes
          </h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm space-y-1">
            {paid > 0 && (
              <div className="flex justify-between text-amber-800">
                <span>Sudah dibayar</span>
                <span className="font-medium">RM {paid.toLocaleString('ms-MY', { minimumFractionDigits: 2 })}</span>
              </div>
            )}
            <div className="flex justify-between text-red-700 font-medium">
              <span>Baki tidak akan dibayar</span>
              <span>RM {remaining.toLocaleString('ms-MY', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Sebab Penutupan <span className="text-red-500">*</span></label>
            <textarea
              rows={3} value={reason} onChange={e => setReason(e.target.value)}
              placeholder="Contoh: Kerja tidak disiapkan, kontrak dibatalkan..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
              required
            />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={onClose}>Batal</Button>
            <Button type="submit" disabled={isPending || !reason.trim()} className="bg-red-600 hover:bg-red-700 text-white">
              {isPending ? <Spinner size="sm" /> : 'Sahkan Tutup Kes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

const EMPTY_ITEM   = { accNo: '', description: '', invoiceNo: '', qty: 1, unitCost: '' }
const EMPTY_VENDOR = { code: '', name: '', type: 'VENDOR', email: '', phone: '', address: '', bankName: '', bankAcc: '', accNo: '' }

function fmtDate(d, withTime = false) {
  if (!d) return '—'
  const opts = { day: 'numeric', month: 'short', year: 'numeric' }
  if (withTime) { opts.hour = '2-digit'; opts.minute = '2-digit' }
  return new Date(d).toLocaleDateString('ms-MY', opts)
}

function fmtRM(v) {
  return 'RM ' + (parseFloat(v) || 0).toLocaleString('ms-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function StatusBadge({ status }) {
  const cfg = BILLING_STATUS[status] ?? { label: status, color: 'gray' }
  const colorMap = {
    gray: 'bg-gray-100 text-gray-700', amber: 'bg-amber-100 text-amber-700',
    blue: 'bg-blue-100 text-blue-700', indigo: 'bg-indigo-100 text-indigo-700',
    purple: 'bg-purple-100 text-purple-700', green: 'bg-green-100 text-green-700',
    teal: 'bg-teal-100 text-teal-700', red: 'bg-red-100 text-red-700',
    orange: 'bg-orange-100 text-orange-700',
  }
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${colorMap[cfg.color] ?? colorMap.gray}`}>
      {cfg.label}
    </span>
  )
}

const STEP_LABELS = { SUBMIT: 'Pemohon', HOD: 'Ketua Jabatan', FINANCE_CHECK: 'Semakan Kewangan',
  FINANCE_VERIFY: 'Pengesahan Kewangan', FINANCE_APPROVAL: 'Kelulusan Kewangan', PAYMENT: 'Pembayaran' }
const ACTION_LABELS = { SUBMIT: 'Dihantar', APPROVE: 'Diluluskan', VERIFY: 'Disahkan',
  REJECT: 'Ditolak', RETURN: 'Dikembalikan', PAY: 'Dibayar' }
const ACTION_COLOR = { SUBMIT: 'text-blue-600', APPROVE: 'text-green-600', VERIFY: 'text-green-600',
  REJECT: 'text-red-600', RETURN: 'text-orange-600', PAY: 'text-teal-600' }

// ─── Modal tambah/edit penerima ───────────────────────────────────────────────
function VendorModal({ open, initial, accounts, onClose, onSaved }) {
  const qc = useQueryClient()
  const [form, setForm] = useState(EMPTY_VENDOR)

  useEffect(() => {
    setForm(initial ? { ...EMPTY_VENDOR, ...initial, accNo: initial.accNo ?? '' } : { ...EMPTY_VENDOR })
  }, [open, initial])

  const isEdit = !!initial?.id

  const mut = useMutation({
    mutationFn: (body) => isEdit ? vendorApi.update(initial.id, body) : vendorApi.create(body),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['vendors', 'active'] })
      toast.success(isEdit ? 'Maklumat dikemaskini' : 'Penerima baru ditambah')
      onSaved(res.data)
      onClose()
    },
    onError: (e) => toast.error(e.response?.data?.message ?? 'Gagal menyimpan'),
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim()) return toast.error('Nama wajib diisi')
    if (!form.code.trim()) return toast.error('Kod wajib diisi')
    mut.mutate({
      code: form.code, name: form.name, type: form.type,
      email: form.email || null, phone: form.phone || null,
      address: form.address || null,
      bankName: form.bankName || null, bankAcc: form.bankAcc || null,
      accNo: form.accNo || null,
    })
  }

  if (!open) return null

  const accOpts = accounts.map(a => ({ value: a.accNo, label: a.accNo, sub: a.name }))

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <h3 className="font-semibold text-gray-900">{isEdit ? 'Edit Maklumat Penerima' : 'Tambah Penerima Baru'}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
          <div>
            <Label>Jenis Penerima</Label>
            <div className="flex gap-3 mt-1">
              {[{ v: 'VENDOR', Icon: Building2, label: 'Vendor / Kontraktor' },
                { v: 'STAFF',  Icon: User2,     label: 'Kakitangan Dalaman' }
              ].map(({ v, Icon, label }) => (
                <label key={v} className={`flex-1 flex items-center gap-2 border rounded-lg px-3 py-2.5 cursor-pointer transition-colors
                  ${form.type === v ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                  <input type="radio" name="type" value={v} checked={form.type === v}
                    onChange={() => set('type', v)} className="hidden" />
                  <Icon className={`w-4 h-4 ${form.type === v ? 'text-blue-600' : 'text-gray-400'}`} />
                  <span className={`text-sm ${form.type === v ? 'text-blue-700 font-medium' : 'text-gray-600'}`}>{label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Kod <span className="text-red-500">*</span></Label>
              <Input className="mt-1" placeholder="Cth: V001" value={form.code}
                onChange={e => set('code', e.target.value.toUpperCase().replace(/\s/g, ''))} />
            </div>
            <div>
              <Label>No. Tel</Label>
              <Input className="mt-1" placeholder="01x-xxxxxxx" value={form.phone}
                onChange={e => set('phone', e.target.value)} />
            </div>
            <div className="col-span-2">
              <Label>Nama Penuh <span className="text-red-500">*</span></Label>
              <Input className="mt-1" placeholder="Nama syarikat / individu" value={form.name}
                onChange={e => set('name', e.target.value)} />
            </div>
            <div className="col-span-2">
              <Label>E-mel</Label>
              <Input className="mt-1" type="email" placeholder="email@domain.com" value={form.email}
                onChange={e => set('email', e.target.value)} />
            </div>
          </div>

          <div className="border-t border-gray-100 pt-3">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Maklumat Bank</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Nama Bank</Label>
                <Input className="mt-1" placeholder="Cth: Maybank" value={form.bankName}
                  onChange={e => set('bankName', e.target.value)} />
              </div>
              <div>
                <Label>No. Akaun Bank</Label>
                <Input className="mt-1" placeholder="0000-0000-0000" value={form.bankAcc}
                  onChange={e => set('bankAcc', e.target.value)} />
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-3">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Pautan Kod Akaun</p>
            <p className="text-xs text-gray-400 mb-3">Diisi automatik dalam borang permohonan apabila penerima ini dipilih.</p>
            <SearchableSelect
              value={form.accNo}
              onChange={v => set('accNo', v ?? '')}
              options={accOpts}
              placeholder="Pilih kod akaun (optional)"
              clearable
              renderOption={opt => (
                <div><span className="font-mono text-xs text-gray-500 mr-2">{opt.value}</span><span>{opt.sub}</span></div>
              )}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Batal</Button>
            <Button type="submit" disabled={mut.isPending}>
              {mut.isPending && <Spinner className="w-4 h-4 mr-2" />}
              {isEdit ? 'Kemaskini' : 'Tambah'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Modal tindakan kelulusan ────────────────────────────────────────────────
function ActionDialog({ open, action, onClose, onConfirm, isPending }) {
  const [remarks, setRemarks] = useState('')
  if (!open) return null

  const cfg = {
    APPROVE: { title: 'Luluskan Permohonan', color: 'bg-green-600 hover:bg-green-700', icon: <CheckCircle className="w-5 h-5" /> },
    REJECT:  { title: 'Tolak Permohonan',    color: 'bg-red-600 hover:bg-red-700',   icon: <XCircle className="w-5 h-5" /> },
    RETURN:  { title: 'Kembalikan Permohonan', color: 'bg-orange-600 hover:bg-orange-700', icon: <RotateCcw className="w-5 h-5" /> },
  }[action] ?? {}

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
          <Label>Ulasan {action !== 'APPROVE' && <span className="text-red-500">*</span>}</Label>
          <textarea
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none mt-1"
            rows={3}
            placeholder={action === 'APPROVE' ? 'Ulasan (optional)...' : 'Nyatakan sebab...'}
            value={remarks}
            onChange={e => setRemarks(e.target.value)}
          />
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>Batal</Button>
          <button
            disabled={isPending || (action !== 'APPROVE' && !remarks.trim())}
            onClick={() => onConfirm(remarks)}
            className={`px-4 py-2 rounded-lg text-white text-sm font-medium flex items-center gap-2 disabled:opacity-50 ${cfg.color}`}
          >
            {isPending && <Spinner className="w-4 h-4" />}
            Sahkan
          </button>
        </div>
      </div>
    </div>
  )
}



// ─── Page Utama ──────────────────────────────────────────────────────────────
export default function PermohonanDetail() {
  const { id }     = useParams()
  const navigate   = useNavigate()
  const qc         = useQueryClient()
  const { user }   = useAuthStore()

  const [editMode, setEditMode]     = useState(!id) // Auto edit mode jika create baru
  const [dialog, setDialog]         = useState(null)
  const [vendorModal, setVendorModal] = useState(null)

  // Form state (hanya untuk edit mode)
  const [form, setForm]             = useState({ vendorId: '', projectNo: '', description: '' })
  const [items, setItems]           = useState([{ ...EMPTY_ITEM }])
  const [files, setFiles]           = useState([])
  const [attachments, setAttachments] = useState([])

  // Data
  const { data, isLoading, error } = useQuery({
    queryKey: ['billing', id],
    queryFn:  () => billingApi.get(id),
    enabled:  !!id,  // Skip jika create mode (tidak ada id)
    retry:    (count, err) => err?.response?.status !== 403 && count < 2,
  })

  const { data: vendorData } = useQuery({
    queryKey: ['vendors', 'active'],
    queryFn:  () => vendorApi.list({ status: 'active', limit: 500 }),
  })

  const { data: accountData } = useQuery({
    queryKey: ['accounts-belanja-leaf'],
    queryFn:  () => api.get('/accounts', { params: { type: 'BELANJA', status: 'active', leafOnly: 'true', limit: 2000 } }).then(r => r.data),
  })

  const billing = data?.data
  const vendors  = vendorData?.data ?? []
  const accounts = accountData?.data ?? []

  // Sync form dengan billing saat edit mode aktif
  useEffect(() => {
    if (!editMode || !billing) return
    setForm({ vendorId: billing.vendorId ?? '', projectNo: billing.projectNo ?? '', description: billing.description ?? '' })
    setItems(billing.items.map(i => ({
      accNo: i.accNo ?? '', description: i.description,
      invoiceNo: i.invoiceNo ?? '', qty: Number(i.qty), unitCost: Number(i.unitCost),
    })))
    setAttachments(billing.attachments ?? [])
  }, [editMode, billing])

  // Tentukan apakah boleh edit & submit
  const canEdit   = !id || ((billing?.status === 'DRAFT' || billing?.status === 'RETURNED') && billing?.applicantId === user?.id)
  const canSubmit = canEdit && (form.description.trim() && items.some(i => i.description.trim()) && form.vendorId)
  const canAction = billing && (billing?.status?.startsWith('PENDING_') || billing?.status === 'APPROVED') && billing?.status !== 'DRAFT'

  // Role checks
  const roleSlug   = user?.role?.slug
  const isOwner    = billing?.applicantId === user?.id
  const isFinance  = ['finance', 'finance_hod', 'admin'].includes(roleSlug)
  // HOD boleh approve PENDING_HOD, dan Finance HOD boleh juga act sebagai HOD
  const isHod      = ['hod', 'finance_hod', 'admin'].includes(roleSlug)
  const canHodAct  = isHod && billing?.status === 'PENDING_HOD'
  const canFinAct  = isFinance && ['PENDING_FINANCE_CHECK', 'PENDING_FINANCE_VERIFY', 'PENDING_FINANCE_APPROVAL'].includes(billing?.status)
  const canFinAppr = ['finance_hod', 'admin'].includes(roleSlug) && billing?.status === 'PENDING_FINANCE_APPROVAL'
  const canPay     = isFinance && ['APPROVED', 'PARTIAL_PAID'].includes(billing?.status)
  const canClose   = isFinance && ['APPROVED', 'PARTIAL_PAID'].includes(billing?.status)
  const showActions = canHodAct || canFinAct || canFinAppr

  // Mutations
  const submitMut = useMutation({
    mutationFn: () => billingApi.submit(id, {}),
    onSuccess:  () => { qc.invalidateQueries({ queryKey: ['billing', id] }); qc.invalidateQueries({ queryKey: ['billings'] }); toast.success('Permohonan dihantar'); setEditMode(false) },
    onError:    (e) => toast.error(e.response?.data?.message ?? 'Gagal'),
  })

  const saveMut = useMutation({
    mutationFn: (body) => id ? billingApi.update(id, body) : billingApi.create(body),
    onSuccess: async (res) => {
      const billingId = id || res.data?.id
      for (const f of files) {
        try { await billingApi.uploadAtt(billingId, f) } catch {}
      }
      qc.invalidateQueries({ queryKey: ['billing', billingId] })
      qc.invalidateQueries({ queryKey: ['billings'] })
      toast.success(id ? 'Permohonan dikemaskini' : 'Draf berjaya disimpan')
      if (!id) navigate(`/permohonan/${billingId}`)
      setEditMode(false)
      setFiles([])
    },
    onError: (e) => toast.error(e.response?.data?.message ?? 'Gagal menyimpan'),
  })

  const actionMut = useMutation({
    mutationFn: ({ action, remarks }) => billingApi.action(id, action, { remarks }),
    onSuccess:  () => { qc.invalidateQueries({ queryKey: ['billing', id] }); qc.invalidateQueries({ queryKey: ['billings'] }); toast.success('Tindakan berjaya'); setDialog(null) },
    onError:    (e) => toast.error(e.response?.data?.message ?? 'Gagal'),
  })

  const closeMut = useMutation({
    mutationFn: (reason) => billingApi.close(id, { reason }),
    onSuccess:  () => { qc.invalidateQueries({ queryKey: ['billing', id] }); qc.invalidateQueries({ queryKey: ['billings'] }); toast.success('Permohonan berjaya ditutup'); setDialog(null) },
    onError:    (e) => toast.error(e.response?.data?.message ?? 'Gagal menutup permohonan'),
  })


  const deleteAttMut = useMutation({
    mutationFn: (attId) => billingApi.deleteAtt(id, attId),
    onSuccess:  (_, attId) => setAttachments(prev => prev.filter(a => a.id !== attId)),
    onError:    () => toast.error('Gagal memadam lampiran'),
  })

  // Helpers
  function handleEditToggle() {
    if (editMode) setEditMode(false)
    else if (canEdit) setEditMode(true)
  }

  function handleSave() {
    const validItems = items.filter(i => i.description.trim())
    if (validItems.length === 0) return toast.error('Sekurang-kurangnya satu butiran diperlukan')
    if (!form.description.trim()) return toast.error('Tujuan pembayaran wajib diisi')
    if (!form.vendorId) return toast.error('Sila pilih penerima')
    // TODO: Re-enable attachment validation in future
    // if (files.length === 0 && attachments.length === 0)
    //   return toast.error('Lampiran (resit/invois) wajib disertakan')

    saveMut.mutate({
      vendorId:    parseInt(form.vendorId),
      projectNo:   form.projectNo || null,
      description: form.description,
      items: validItems.map(i => ({
        accNo:       i.accNo || null,
        description: i.description,
        invoiceNo:   i.invoiceNo || null,
        qty:         parseFloat(i.qty) || 1,
        unitCost:    parseFloat(i.unitCost) || 0,
      })),
    })
  }

  function handleVendorChange(vid) {
    setForm(f => ({ ...f, vendorId: vid ?? '' }))
    if (!vid) return
    const v = vendors.find(x => String(x.id) === String(vid))
    if (v?.accNo && items.length === 1 && !items[0].accNo) {
      setItems(prev => prev.map((item, i) => i === 0 ? { ...item, accNo: v.accNo } : item))
    }
  }

  const addItem    = () => setItems(p => [...p, { ...EMPTY_ITEM }])
  const removeItem = (idx) => setItems(p => p.filter((_, i) => i !== idx))
  const updateItem = (idx, field, value) =>
    setItems(p => p.map((item, i) => i === idx ? { ...item, [field]: value } : item))

  const total = items.reduce((s, i) => s + (parseFloat(i.qty) || 0) * (parseFloat(i.unitCost) || 0), 0)

  const onFileChange = (e) => {
    const picked  = Array.from(e.target.files)
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
    const valid   = picked.filter(f => allowed.includes(f.type) && f.size <= 10 * 1024 * 1024)
    if (valid.length !== picked.length) toast.warning('Hanya JPG/PNG/PDF sehingga 10MB diterima')
    setFiles(prev => [...prev, ...valid])
    e.target.value = ''
  }

  const vendorOpts = vendors.map(v => ({
    value: v.id,
    label: v.name,
    sub:   [v.type === 'STAFF' ? 'Kakitangan' : 'Vendor/Kontraktor', v.bankName, v.bankAcc].filter(Boolean).join(' · '),
    raw:   v,
  }))

  const accOpts = accounts.map(a => ({
    value: a.accNo,
    label: a.accNo,
    sub:   a.name,
  }))

  const selectedVendor = vendors.find(v => String(v.id) === String(form.vendorId))
console.log(id, billing);

  if (isLoading) return <div className="flex justify-center py-20"><Spinner /></div>
  if (id && error?.response?.status === 403) return null
  if (id && !billing)  return <div className="p-10 text-center text-gray-400">Permohonan tidak dijumpai</div>

  // Lock mode: REJECTED, PAID, CLOSED (tidak boleh edit)
  const isLocked = billing && ['REJECTED', 'PAID', 'PARTIAL_PAID', 'CLOSED'].includes(billing.status)

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
              <h1 className="text-xl font-semibold text-gray-900">
                {!id ? 'Permohonan Pembayaran Baru' : billing?.refNo}
              </h1>
              {billing && <StatusBadge status={billing.status} />}
            </div>
            <p className="text-sm text-gray-400 mt-0.5">MENTERI BESAR KEDAH INCORPORATED</p>
          </div>
        </div>
        <div className="flex gap-2">
          {canEdit && (
            <Button variant={editMode ? 'outline' : 'default'} onClick={handleEditToggle}>
              <Pencil className="w-4 h-4 mr-1.5" />
              {editMode ? 'Batal Edit' : 'Edit'}
            </Button>
          )}
          {editMode && (
            <Button onClick={handleSave} disabled={saveMut.isPending || !canSubmit}>
              {saveMut.isPending ? <Spinner className="w-4 h-4 mr-1.5" /> : <Upload className="w-4 h-4 mr-1.5" />}
              {id ? 'Simpan' : 'Simpan Draf'}
            </Button>
          )}
          {!editMode && canEdit && (billing.status === 'DRAFT' || billing.status === 'RETURNED') && (
            <Button onClick={() => submitMut.mutate()} disabled={submitMut.isPending}>
              {submitMut.isPending ? <Spinner className="w-4 h-4 mr-1.5" /> : <Send className="w-4 h-4 mr-1.5" />}
              Hantar
            </Button>
          )}
          {!editMode && canPay && (
            <Button onClick={() => setDialog({ type: 'pay' })} className="bg-teal-600 hover:bg-teal-700 text-white">
              <CreditCard className="w-4 h-4 mr-1.5" /> Rekod Bayaran
            </Button>
          )}
          {!editMode && canClose && (
            <Button onClick={() => setDialog({ type: 'close' })} variant="outline" className="border-red-300 text-red-600 hover:bg-red-50">
              <XCircle className="w-4 h-4 mr-1.5" /> Tutup Kes
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {/* A: Maklumat Permohonan */}
        <section className="bg-white border border-gray-200 rounded-lg p-5">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">A: Maklumat Permohonan</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-gray-400">Tarikh Permohonan</Label>
              {editMode ? (
                <Input value={new Date().toLocaleDateString('ms-MY')} disabled className="bg-gray-50 mt-1" />
              ) : (
                <p className="mt-1 text-sm text-gray-900">{fmtDate(billing.createdAt)}</p>
              )}
            </div>
            <div>
              <Label className="text-xs text-gray-400">Permohonan Oleh</Label>
              {editMode ? (
                <Input value={user?.name ?? ''} disabled className="bg-gray-50 mt-1" />
              ) : (
                <p className="mt-1 text-sm text-gray-900">{billing.applicant?.name}</p>
              )}
            </div>
            <div>
              <Label className="text-xs text-gray-400">Jabatan</Label>
              {editMode ? (
                <Input value={user?.department?.name ?? '—'} disabled className="bg-gray-50 mt-1" />
              ) : (
                <p className="mt-1 text-sm text-gray-900">{billing.department?.name}</p>
              )}
            </div>
            <div>
              <Label className="text-xs text-gray-400">No. Projek (optional)</Label>
              {editMode ? (
                <Input className="mt-1" placeholder="N/A atau no. projek" value={form.projectNo}
                  onChange={e => setForm(f => ({ ...f, projectNo: e.target.value }))} />
              ) : (
                <p className="mt-1 text-sm text-gray-900">{billing.projectNo || '—'}</p>
              )}
            </div>

            {/* Pembekal */}
            <div className="col-span-2">
              <Label className="text-xs text-gray-400">Nama Pembekal / Kontraktor / Penerima</Label>
              {editMode ? (
                <div className="flex gap-2 mt-1">
                  <SearchableSelect
                    className="flex-1"
                    value={form.vendorId}
                    onChange={handleVendorChange}
                    options={vendorOpts}
                    placeholder="Cari dan pilih penerima..."
                    clearable
                    renderOption={opt => (
                      <div className="flex items-start gap-2">
                        {opt.raw?.type === 'STAFF'
                          ? <User2 className="w-3.5 h-3.5 text-purple-400 mt-0.5 shrink-0" />
                          : <Building2 className="w-3.5 h-3.5 text-blue-400 mt-0.5 shrink-0" />}
                        <div className="overflow-hidden">
                          <div className="font-medium truncate">{opt.label}</div>
                          {opt.sub && <div className="text-xs text-gray-400 mt-0.5 truncate">{opt.sub}</div>}
                        </div>
                      </div>
                    )}
                  />
                  {selectedVendor && (
                    <button type="button" onClick={() => setVendorModal({ initial: selectedVendor })}
                      className="px-3 py-2 border border-gray-300 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-50">
                      <Pencil className="w-4 h-4" />
                    </button>
                  )}
                  <button type="button" onClick={() => setVendorModal({})}
                    className="flex items-center gap-1.5 px-3 py-2 border border-dashed border-blue-300 text-blue-600 rounded-md text-sm hover:bg-blue-50 whitespace-nowrap">
                    <Plus className="w-4 h-4" /> Tambah
                  </button>
                </div>
              ) : (
                <p className="mt-1 text-sm text-gray-900">{billing.vendor?.name ?? '—'}</p>
              )}
              {editMode && selectedVendor && (
                <div className="mt-1.5 text-xs text-gray-400 flex flex-wrap gap-3">
                  {selectedVendor.bankName && <span>Bank: <span className="text-gray-600">{selectedVendor.bankName}</span></span>}
                  {selectedVendor.bankAcc  && <span>No. Akaun: <span className="text-gray-600">{selectedVendor.bankAcc}</span></span>}
                  {selectedVendor.phone    && <span>Tel: <span className="text-gray-600">{selectedVendor.phone}</span></span>}
                </div>
              )}
            </div>

            <div className="col-span-2">
              <Label className="text-xs text-gray-400">Tujuan / Penerangan Pembayaran</Label>
              {editMode ? (
                <textarea className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none mt-1"
                  rows={2} placeholder="Nyatakan tujuan pembayaran..."
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              ) : (
                <p className="mt-1 text-sm text-gray-900">{billing.description}</p>
              )}
            </div>
          </div>
        </section>

        {/* B: Butiran */}
        <section className="bg-white border border-gray-200 rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">B: Maklumat Keperluan</h2>
            {editMode && <span className="text-xs text-gray-400">JUMLAH: {fmtRM(total)}</span>}
          </div>

          <div className="space-y-3">
            {(editMode ? items : billing.items ?? []).map((item, idx) => (
              <div key={idx} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-medium text-gray-700">Butiran #{idx + 1}</h4>
                  {editMode && items.length > 1 && (
                    <button onClick={() => removeItem(idx)} className="text-gray-300 hover:text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="mb-3">
                  <Label className="text-xs text-gray-500">Butir Bekalan / Perkhidmatan</Label>
                  {editMode ? (
                    <textarea
                      className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none mt-1"
                      rows={2}
                      placeholder="Butiran bekalan/perkhidmatan..."
                      value={item.description}
                      onChange={e => updateItem(idx, 'description', e.target.value)}
                    />
                  ) : (
                    <p className="mt-1 text-sm text-gray-700">{item.description}</p>
                  )}
                </div>

                <div className="grid grid-cols-4 gap-3">
                  <div>
                    <Label className="text-xs text-gray-500">Kod Bajet</Label>
                    {editMode ? (
                      <SearchableSelect
                        value={item.accNo}
                        onChange={v => updateItem(idx, 'accNo', v ?? '')}
                        options={accOpts}
                        placeholder="—"
                        clearable
                        renderOption={opt => (
                          <div className='ml-3'>
                            <div className="font-mono text-xs text-gray-500">{opt.value}</div>
                            <div className="text-xs truncate">{opt.sub}</div>
                          </div>
                        )}
                      />
                    ) : (
                      <p className="mt-1 text-sm font-mono text-gray-900">{item.accNo || '—'}</p>
                    )}
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">No. Invois</Label>
                    {editMode ? (
                      <Input className="text-sm mt-1" placeholder="INV-001" value={item.invoiceNo}
                        onChange={e => updateItem(idx, 'invoiceNo', e.target.value)} />
                    ) : (
                      <p className="mt-1 text-sm text-gray-900">{item.invoiceNo || '—'}</p>
                    )}
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Bil/Unit</Label>
                    {editMode ? (
                      <Input type="number" min="0.001" step="0.001" className="text-sm mt-1 text-right"
                        value={item.qty}
                        onChange={e => updateItem(idx, 'qty', e.target.value)} />
                    ) : (
                      <p className="mt-1 text-sm text-gray-900">{item.qty}</p>
                    )}
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Kos/Unit (RM)</Label>
                    {editMode ? (
                      <Input type="number" min="0" step="0.01" className="text-sm mt-1 text-right" placeholder="0.00"
                        value={item.unitCost}
                        onChange={e => updateItem(idx, 'unitCost', e.target.value)} />
                    ) : (
                      <p className="mt-1 text-sm text-gray-900">{fmtRM(item.unitCost)}</p>
                    )}
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t border-gray-100 text-right">
                  <p className="text-sm font-medium text-gray-700">
                    Jumlah: <span className="text-gray-900">{fmtRM((parseFloat(item.qty) || 0) * (parseFloat(item.unitCost) || 0))}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>

          {editMode && (
            <button onClick={addItem}
              className="mt-4 flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700">
              <Plus className="w-4 h-4" /> Tambah Butiran
            </button>
          )}

          {!editMode && (
            <div className="mt-4 pt-4 border-t border-gray-200 text-right">
              <p className="text-base font-bold text-gray-900">JUMLAH BAYARAN: {fmtRM(billing.totalAmount)}</p>
            </div>
          )}
        </section>

        {/* Lampiran */}
        {(editMode || billing?.attachments?.length > 0) && (
          <section className="bg-white border border-gray-200 rounded-lg p-5">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Lampiran {editMode && !id && <span className="text-red-500">*</span>}
            </h2>
            <div className="space-y-2">
              {!editMode && billing?.attachments?.map(att => (
                <div key={att.id} className="flex items-center gap-2 text-sm bg-gray-50 rounded px-3 py-2">
                  <FileText className="w-4 h-4 text-gray-400 shrink-0" />
                  <a href={billingApi.downloadUrl(id, att.id)} target="_blank" rel="noreferrer"
                    className="text-blue-600 hover:underline truncate flex-1">{att.originalName}</a>
                  <span className="text-xs text-gray-400">{(att.size / 1024).toFixed(0)} KB</span>
                </div>
              ))}
              {editMode && attachments.map(att => (
                <div key={att.id} className="flex items-center gap-2 text-sm bg-gray-50 rounded px-3 py-2">
                  <FileText className="w-4 h-4 text-gray-400 shrink-0" />
                  <a href={billingApi.downloadUrl(id, att.id)} target="_blank" rel="noreferrer"
                    className="text-blue-600 hover:underline truncate flex-1">{att.originalName}</a>
                  <span className="text-xs text-gray-400">{(att.size / 1024).toFixed(0)} KB</span>
                  <button onClick={() => deleteAttMut.mutate(att.id)} className="text-gray-300 hover:text-red-500">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              {editMode && files.map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-sm bg-blue-50 rounded px-3 py-2">
                  <FileText className="w-4 h-4 text-blue-400 shrink-0" />
                  <span className="truncate flex-1 text-gray-700">{f.name}</span>
                  <span className="text-xs text-gray-400">{(f.size / 1024).toFixed(0)} KB</span>
                  <button onClick={() => setFiles(p => p.filter((_, j) => j !== i))} className="text-gray-300 hover:text-red-500">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
            {editMode && (
              <label className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors w-fit mt-3">
                <Upload className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-500">Pilih Fail</span>
                <input type="file" multiple accept=".jpg,.jpeg,.png,.webp,.pdf" className="hidden" onChange={onFileChange} />
              </label>
            )}
          </section>
        )}

        {/* Kemajuan bayaran */}
        {['APPROVED', 'PARTIAL_PAID', 'PAID'].includes(billing?.status) && (billing?.payments?.length > 0 || billing?.status === 'PAID') && (
          billing?.payments?.length > 0
            ? <PaymentProgress billing={billing} canPay={canPay} queryKey={['billing', id]} />
            : billing?.status === 'PAID' && (
              <section className="bg-teal-50 border border-teal-200 rounded-lg p-5">
                <h2 className="text-xs font-semibold text-teal-700 uppercase tracking-wide mb-3">Maklumat Pembayaran</h2>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-gray-500">No. Rujukan</span><p className="font-mono font-medium mt-0.5">{billing.paymentRef ?? '—'}</p></div>
                  <div><span className="text-gray-500">Tarikh Bayar</span><p className="font-medium mt-0.5">{fmtDate(billing.paidAt)}</p></div>
                  <div><span className="text-gray-500">Dibayar Oleh</span><p className="font-medium mt-0.5">{billing.paidBy?.name}</p></div>
                  <div><span className="text-gray-500">Jumlah</span><p className="font-bold text-teal-700 mt-0.5">{fmtRM(billing.totalAmount)}</p></div>
                </div>
              </section>
            )
        )}

        {/* Sejarah */}
        {billing?.approvals?.length > 0 && (
          <section className="bg-white border border-gray-200 rounded-lg p-5">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">Sejarah Tindakan</h2>
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-200" />
              <div className="space-y-4">
                {billing.approvals.map((appr, i) => (
                  <div key={appr.id} className="relative flex gap-4 pl-10">
                    <div className={`absolute left-2.5 w-3 h-3 rounded-full border-2 border-white top-1 ${appr.action === 'APPROVE' ? 'bg-green-600' : appr.action === 'REJECT' ? 'bg-red-600' : 'bg-orange-600'}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span className={`text-sm font-medium ${ACTION_COLOR[appr.action] ?? 'text-gray-600'}`}>
                          {ACTION_LABELS[appr.action] ?? appr.action}
                        </span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500">{STEP_LABELS[appr.step] ?? appr.step}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {appr.actor?.name} · {fmtDate(appr.actionedAt, true)}
                      </div>
                      {appr.remarks && (
                        <div className="mt-1 text-xs text-gray-600 bg-gray-50 rounded px-2 py-1">{appr.remarks}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Panel tindakan kelulusan */}
        {/* {!editMode && !isLocked && showActions && (
          <section className="bg-amber-50 border border-amber-200 rounded-lg p-5">
            <h2 className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-4">Tindakan Diperlukan</h2>
            <div className="flex flex-wrap gap-3">
              <button onClick={() => setDialog({ type: 'action', action: 'APPROVE' })}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg">
                <CheckCircle className="w-4 h-4" /> Lulus
              </button>
              <button onClick={() => setDialog({ type: 'action', action: 'RETURN' })}
                className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg">
                <RotateCcw className="w-4 h-4" /> Kembalikan
              </button>
              <button onClick={() => setDialog({ type: 'action', action: 'REJECT' })}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg">
                <XCircle className="w-4 h-4" /> Tolak
              </button>
            </div>
          </section>
        )} */}

        {isLocked && (
          <section className="bg-gray-50 border border-gray-200 rounded-lg p-5 text-center">
            <p className="text-sm text-gray-600">
              {billing.status === 'REJECTED'
                ? 'Permohonan ini telah ditolak dan tidak boleh diubah.'
                : billing.status === 'CLOSED'
                ? 'Permohonan ini telah ditutup. Lihat sejarah kelulusan untuk maklumat penutupan.'
                : 'Permohonan ini telah dibayar dan ditutup.'}
            </p>
          </section>
        )}
      </div>

      {/* Dialogs */}
      <ActionDialog
        open={dialog?.type === 'action'}
        action={dialog?.action}
        onClose={() => setDialog(null)}
        onConfirm={(remarks) => actionMut.mutate({ action: dialog.action, remarks })}
        isPending={actionMut.isPending}
      />
      {dialog?.type === 'pay' && billing && (
        <PaymentModal
          billing={billing}
          queryKey={['billing', id]}
          onClose={() => setDialog(null)}
        />
      )}
      {dialog?.type === 'close' && (
        <CloseKesDialog
          billing={billing}
          onClose={() => setDialog(null)}
          onConfirm={(reason) => closeMut.mutate(reason)}
          isPending={closeMut.isPending}
        />
      )}
      <VendorModal
        open={vendorModal !== null}
        initial={vendorModal?.initial}
        accounts={accounts}
        onClose={() => setVendorModal(null)}
        onSaved={(vendor) => {
          if (!vendorModal?.initial) {
            setForm(f => ({ ...f, vendorId: vendor.id }))
          }
        }}
      />
    </div>
  )
}
