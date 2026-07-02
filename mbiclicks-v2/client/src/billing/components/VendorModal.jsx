import { useState, useEffect } from 'react'
import { useQueryClient, useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { X, Building2, User2 } from 'lucide-react'
import { Button, Input, Label, Spinner, SearchableSelect } from '@/components/ui'
import { BillingService } from '@/billing/services/BillingService'

const EMPTY = { code: '', name: '', type: 'VENDOR', email: '', phone: '', address: '', bankName: '', bankAcc: '', accNo: '' }

export default function VendorModal({ open, initial, accounts, onClose, onSaved }) {
  const qc     = useQueryClient()
  const [form, setForm] = useState(EMPTY)
  const isEdit = !!initial?.id

  useEffect(() => {
    setForm(initial ? { ...EMPTY, ...initial, accNo: initial.accNo ?? '' } : { ...EMPTY })
  }, [open, initial])

  const mut = useMutation({
    mutationFn: (body) => isEdit ? BillingService.updateVendor(initial.id, body) : BillingService.createVendor(body),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['vendors', 'active'] })
      toast.success(isEdit ? 'Maklumat dikemaskini' : 'Penerima baru ditambah')
      onSaved(res.data)
      onClose()
    },
    onError: (e) => toast.error(e.message ?? 'Gagal menyimpan'),
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
              <Input className="mt-1" placeholder="01x-xxxxxxx" value={form.phone} onChange={e => set('phone', e.target.value)} />
            </div>
            <div className="col-span-2">
              <Label>Nama Penuh <span className="text-red-500">*</span></Label>
              <Input className="mt-1" placeholder="Nama syarikat / individu" value={form.name} onChange={e => set('name', e.target.value)} />
            </div>
            <div className="col-span-2">
              <Label>E-mel</Label>
              <Input className="mt-1" type="email" placeholder="email@domain.com" value={form.email} onChange={e => set('email', e.target.value)} />
            </div>
          </div>
          <div className="border-t border-gray-100 pt-3">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Maklumat Bank</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Nama Bank</Label>
                <Input className="mt-1" placeholder="Cth: Maybank" value={form.bankName} onChange={e => set('bankName', e.target.value)} />
              </div>
              <div>
                <Label>No. Akaun Bank</Label>
                <Input className="mt-1" placeholder="0000-0000-0000" value={form.bankAcc} onChange={e => set('bankAcc', e.target.value)} />
              </div>
            </div>
          </div>
          <div className="border-t border-gray-100 pt-3">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Pautan Kod Akaun</p>
            <p className="text-xs text-gray-400 mb-3">Diisi automatik dalam borang permohonan apabila penerima ini dipilih.</p>
            <SearchableSelect value={form.accNo} onChange={v => set('accNo', v ?? '')} options={accOpts}
              placeholder="Pilih kod akaun (optional)" clearable
              renderOption={opt => (
                <div><span className="font-mono text-xs text-gray-500 mr-2">{opt.value}</span><span>{opt.sub}</span></div>
              )} />
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
