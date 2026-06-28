import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  ChevronLeft, CheckCircle, AlertTriangle, FileText,
  Download, ExternalLink, Building2,
} from 'lucide-react'
import { useAuthStore } from '@/store/auth'
import { Button, Spinner, Label, SearchableSelect } from '@/components/ui'
import api from '@/lib/api'

function fmtRM(v) {
  return 'RM ' + (parseFloat(v) || 0).toLocaleString('ms-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function fmtDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('ms-MY', { day: 'numeric', month: 'long', year: 'numeric' })
}

const PAYMENT_METHODS = [
  { value: 'ONLINE', label: 'Dalam Talian (Online)' },
  { value: 'CHEQUE', label: 'Cek' },
  { value: 'CASH',   label: 'Tunai' },
]

function BudgetBadge({ bal, amount }) {
  if (bal === undefined) return <span className="text-xs text-gray-400 italic">Memeriksa bajet...</span>
  if (bal === null) return (
    <div className="text-xs rounded-lg px-3 py-2 bg-red-50 border border-red-200">
      <p className="text-red-600 font-medium flex items-center gap-1">
        <AlertTriangle className="w-3 h-3" /> Tiada rekod bajet untuk kod ini
      </p>
    </div>
  )
  const cukup = bal.baki >= amount
  return (
    <div className={`text-xs rounded-lg px-3 py-2 ${cukup ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
      <div className="grid grid-cols-3 gap-2">
        <div>
          <p className="text-gray-400">Peruntukan</p>
          <p className="font-medium text-gray-700">{fmtRM(bal.peruntukan)}</p>
        </div>
        <div>
          <p className="text-gray-400">Belanja + Tertangguh</p>
          <p className="font-medium text-gray-700">{fmtRM(bal.belanja + bal.tertangguh)}</p>
        </div>
        <div>
          <p className={`font-semibold ${cukup ? 'text-green-700' : 'text-red-700'}`}>Baki</p>
          <p className={`font-bold ${cukup ? 'text-green-700' : 'text-red-700'}`}>{fmtRM(bal.baki)}</p>
        </div>
      </div>
      {!cukup && (
        <p className="mt-1.5 text-red-600 font-medium flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" /> Baki tidak mencukupi untuk item ini
        </p>
      )}
    </div>
  )
}

export default function FinanceSemakan() {
  const { id }    = useParams()
  const navigate  = useNavigate()
  const qc        = useQueryClient()
  const { user }  = useAuthStore()
  const roleSlug  = user?.role?.slug

  // Hanya role 'finance' sahaja — bukan finance_hod, bukan admin
  useEffect(() => {
    if (roleSlug && roleSlug !== 'finance') {
      navigate('/permohonan', { replace: true })
    }
  }, [roleSlug, navigate])

  const [items, setItems]             = useState([])
  const [payingBankId, setPayingBankId] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('')
  const [remarks, setRemarks]         = useState('')

  // Fetch data semakan
  const { data: checkData, isLoading, error } = useQuery({
    queryKey: ['finance-check', id],
    queryFn:  () => api.get(`/billings/${id}/finance-check`).then(r => r.data),
    enabled:  !!id,
    retry:    (count, err) => err?.response?.status !== 400 && count < 2,
  })

  // Fetch bank accounts
  const { data: bankData } = useQuery({
    queryKey: ['bank-accounts'],
    queryFn:  () => api.get('/bank-accounts?status=active').then(r => r.data),
  })

  // Fetch accounts untuk dropdown accNo
  const { data: accountData } = useQuery({
    queryKey: ['accounts-belanja'],
    queryFn:  () => api.get('/accounts', { params: { type: 'BELANJA', status: 'active', limit: 2000 } }).then(r => r.data),
  })

  const billing          = checkData?.data
  const serverBudgetMap  = checkData?.budgetMap ?? {}
  const banks            = bankData?.data ?? []
  const accounts         = accountData?.data ?? []

  // localBudgetMap: cache balances yang di-fetch on-demand bila accNo bertukar
  const [localBudgetMap, setLocalBudgetMap] = useState({})

  // Gabung server budgetMap + local overrides
  const budgetMap = { ...serverBudgetMap, ...localBudgetMap }

  // Sync items apabila data dimuatkan
  useEffect(() => {
    if (!billing) return
    setItems(billing.items.map(i => ({ id: i.id, accNo: i.accNo ?? '', description: i.description, amount: i.amount })))
    if (billing.payingBankId) setPayingBankId(String(billing.payingBankId))
    if (billing.paymentMethod) setPaymentMethod(billing.paymentMethod)
  }, [billing])

  const submitMut = useMutation({
    mutationFn: (body) => api.post(`/billings/${id}/finance-check`, body).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['finance-check', id] })
      qc.invalidateQueries({ queryKey: ['billings'] })
      toast.success('Semakan kewangan berjaya diluluskan')
      navigate('/permohonan')
    },
    onError: (e) => {
      const msg = e.response?.data?.message ?? 'Gagal menyimpan semakan'
      const insufficient = e.response?.data?.insufficientAccNos
      if (insufficient?.length) {
        toast.error(`${msg}: ${insufficient.map(i => `${i.accNo} (baki: ${fmtRM(i.baki)})`).join(', ')}`)
      } else {
        toast.error(msg)
      }
    },
  })

  function handleSubmit() {
    if (!payingBankId) return toast.error('Sila pilih akaun bank pembayar')
    if (!paymentMethod) return toast.error('Sila pilih jenis bayaran')
    if (items.some(i => !i.accNo)) return toast.error('Semua butiran mesti ada kod bajet')

    submitMut.mutate({
      payingBankId:  parseInt(payingBankId),
      paymentMethod,
      items: items.map(i => ({ id: i.id, accNo: i.accNo || null })),
      remarks: remarks || null,
    })
  }

  const updateItemAccNo = (itemId, accNo) => {
    setItems(prev => prev.map(i => i.id === itemId ? { ...i, accNo: accNo ?? '' } : i))

    // Fetch balance untuk accNo baru jika belum ada dalam budgetMap (gabungan server+local)
    if (accNo && !(accNo in budgetMap)) {
      api.get('/budget-balance', { params: { accNo, excludeBillingId: id } })
        .then(r => {
          if (r.data?.data) {
            setLocalBudgetMap(prev => ({ ...prev, [accNo]: r.data.data }))
          }
        })
        .catch(() => {
          // Jika gagal, set null supaya BudgetBadge papar "Tiada rekod bajet"
          setLocalBudgetMap(prev => ({ ...prev, [accNo]: null }))
        })
    }
  }

  const accOpts = accounts.map(a => ({ value: a.accNo, label: a.accNo, sub: a.name }))
  const bankOpts = banks.map(b => ({ value: String(b.id), label: b.name, sub: `${b.bankName} · ${b.accNo}` }))

  // Semak baki tidak mencukupi untuk mana-mana item (hanya jika data ada)
  const hasBudgetIssue = items.some(item => {
    if (!item.accNo) return false
    const bal = budgetMap[item.accNo]
    // Jika tiada rekod bajet (bal === null atau undefined), anggap tidak mencukupi
    if (bal === undefined) return false  // masih loading, jangan block
    if (bal === null) return true        // tiada rekod — block submit
    return bal.baki < parseFloat(item.amount)
  })

  if (isLoading) return <div className="flex justify-center py-20"><Spinner /></div>
  if (error?.response?.status === 400) return (
    <div className="p-10 text-center text-gray-400">
      <AlertTriangle className="w-10 h-10 mx-auto mb-3 opacity-40" />
      <p>{error.response?.data?.message ?? 'Permohonan ini tidak dalam peringkat Semakan Kewangan'}</p>
      <button onClick={() => navigate('/permohonan')} className="mt-4 text-blue-600 text-sm hover:underline">← Kembali</button>
    </div>
  )
  if (!billing) return null

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
              <h1 className="text-xl font-semibold text-gray-900">{billing.refNo}</h1>
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                Semakan Kewangan
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-0.5">
              Dikemukakan oleh {billing.applicant?.name} · {billing.department?.name} · {fmtDate(billing.createdAt)}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-5">

        {/* Maklumat Asas */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">A: Maklumat Permohonan</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-gray-400">Penerima / Pembekal</p>
              <p className="font-medium text-gray-900 mt-0.5">{billing.vendor?.name ?? '—'}</p>
              {billing.vendor?.bankName && (
                <p className="text-xs text-gray-400 mt-0.5">{billing.vendor.bankName} · {billing.vendor.bankAcc}</p>
              )}
            </div>
            <div>
              <p className="text-xs text-gray-400">Jumlah Bayaran</p>
              <p className="text-xl font-bold text-gray-900 mt-0.5">{fmtRM(billing.totalAmount)}</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-gray-400">Tujuan Pembayaran</p>
              <p className="text-gray-800 mt-0.5 leading-relaxed">{billing.description}</p>
            </div>
          </div>
        </div>

        {/* B: Semakan Kod Bajet */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-1">B: Semakan & Pengesahan Kod Bajet</h2>
          <p className="text-xs text-gray-400 mb-4">Semak dan betulkan kod bajet jika perlu. Pastikan baki mencukupi.</p>

          <div className="space-y-4">
            {items.map((item, i) => {
              const bal = budgetMap[item.accNo] ?? null
              const cukup = !item.accNo || !bal || bal.baki >= parseFloat(item.amount)
              return (
                <div key={item.id} className={`border rounded-lg p-4 ${!cukup ? 'border-red-200 bg-red-50/30' : 'border-gray-100'}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Butiran #{i + 1}</p>
                      <p className="text-sm font-medium text-gray-800">{item.description}</p>
                    </div>
                    <p className="font-bold text-gray-900 text-sm shrink-0 ml-4">{fmtRM(item.amount)}</p>
                  </div>

                  <div className="mb-3">
                    <Label>Kod Bajet <span className="text-red-500">*</span></Label>
                    <SearchableSelect
                      className="mt-1"
                      value={item.accNo || null}
                      onChange={(v) => updateItemAccNo(item.id, v)}
                      options={accOpts}
                      placeholder="Pilih kod bajet..."
                      clearable
                      renderOption={opt => (
                        <div>
                          <span className="font-mono text-xs text-gray-500 mr-2">{opt.value}</span>
                          <span>{opt.sub}</span>
                        </div>
                      )}
                    />
                  </div>

                  {item.accNo && (
                    <BudgetBadge bal={budgetMap[item.accNo]} amount={parseFloat(item.amount)} />
                  )}
                  {!item.accNo && (
                    <p className="text-xs text-amber-600 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Kod bajet belum dipilih
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* C: Maklumat Pembayaran */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">C: Maklumat Pembayaran</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Akaun Bank Pembayar <span className="text-red-500">*</span></Label>
              <SearchableSelect
                className="mt-1"
                value={payingBankId || null}
                onChange={(v) => setPayingBankId(v ?? '')}
                options={bankOpts}
                placeholder="Pilih bank..."
                clearable
                renderOption={opt => (
                  <div>
                    <p className="font-medium text-sm">{opt.label}</p>
                    <p className="text-xs text-gray-400">{opt.sub}</p>
                  </div>
                )}
              />
              {payingBankId && (
                <div className="mt-2 flex items-center gap-2 text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
                  <Building2 className="w-3.5 h-3.5 shrink-0" />
                  <span>{banks.find(b => String(b.id) === payingBankId)?.bankName} · {banks.find(b => String(b.id) === payingBankId)?.accNo}</span>
                </div>
              )}
            </div>

            <div>
              <Label>Jenis Bayaran <span className="text-red-500">*</span></Label>
              <div className="mt-1 grid grid-cols-1 gap-2">
                {PAYMENT_METHODS.map(m => (
                  <label key={m.value}
                    className={`flex items-center gap-2.5 border rounded-lg px-3 py-2.5 cursor-pointer transition-colors
                      ${paymentMethod === m.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                    <input type="radio" name="paymentMethod" value={m.value}
                      checked={paymentMethod === m.value}
                      onChange={() => setPaymentMethod(m.value)}
                      className="hidden" />
                    <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0
                      ${paymentMethod === m.value ? 'border-blue-500' : 'border-gray-300'}`}>
                      {paymentMethod === m.value && <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
                    </div>
                    <span className={`text-sm ${paymentMethod === m.value ? 'text-blue-700 font-medium' : 'text-gray-600'}`}>
                      {m.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="col-span-2">
              <Label>Ulasan Semakan</Label>
              <textarea
                className="w-full mt-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={2}
                placeholder="Ulasan optional..."
                value={remarks}
                onChange={e => setRemarks(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* D: Lampiran */}
        {billing.attachments?.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">D: Lampiran</h2>
            <div className="space-y-2">
              {billing.attachments.map(att => (
                <div key={att.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <FileText className="w-4 h-4 text-gray-400 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm text-gray-700 truncate">{att.originalName}</p>
                      <p className="text-xs text-gray-400">{att.uploadedBy?.name} · {fmtDate(att.uploadedAt)}</p>
                    </div>
                  </div>
                  <a
                    href={`/api/billings/${billing.id}/attachments/${att.id}/download`}
                    target="_blank" rel="noreferrer"
                    className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 shrink-0 ml-3"
                  >
                    <Download className="w-3.5 h-3.5" /> Muat turun
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer Actions */}
        {hasBudgetIssue && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <p>Terdapat kod bajet dengan baki tidak mencukupi. Semakan tidak dapat diluluskan.</p>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={() => navigate('/permohonan')}>Batal</Button>
          <Button
            disabled={submitMut.isPending || hasBudgetIssue}
            onClick={handleSubmit}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
          >
            {submitMut.isPending ? <Spinner className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
            Lulus Semakan Kewangan
          </Button>
        </div>

      </div>
    </div>
  )
}
