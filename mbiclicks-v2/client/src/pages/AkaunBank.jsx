import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Plus, Pencil, ToggleLeft, ToggleRight, Landmark, Wallet } from 'lucide-react'
import api from '@/lib/api'
import {
  Button, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
  Input, Label, Spinner,
} from '@/components/ui'

const TYPE_LABEL = { BANK: 'Bank', PETTY_CASH: 'Panjar/Tunai' }
const TYPE_COLOR = {
  BANK:       'bg-blue-100 text-blue-700',
  PETTY_CASH: 'bg-amber-100 text-amber-700',
}

function BankForm({ record, onClose }) {
  const qc = useQueryClient()
  const isEdit = !!record?.id
  const [form, setForm] = useState(
    record
      ? { code: record.code, name: record.name, bankName: record.bankName, accNo: record.accNo ?? '', type: record.type ?? 'BANK' }
      : { code: '', name: '', bankName: '', accNo: '', type: 'BANK' }
  )

  const mut = useMutation({
    mutationFn: (body) => isEdit
      ? api.put(`/bank-accounts/${record.id}`, body)
      : api.post('/bank-accounts', body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bank-accounts'] })
      toast.success(isEdit ? 'Rekod dikemaskini' : 'Rekod ditambah')
      onClose()
    },
    onError: (e) => toast.error(e.response?.data?.message ?? 'Gagal menyimpan'),
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const isPettyCash = form.type === 'PETTY_CASH'

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.code.trim()) return toast.error('Kod wajib diisi')
    if (!form.name.trim()) return toast.error('Nama wajib diisi')
    if (!isPettyCash && !form.accNo.trim()) return toast.error('No. akaun wajib diisi untuk akaun bank')
    mut.mutate({
      code:     form.code,
      name:     form.name,
      bankName: isPettyCash ? 'Panjar' : form.bankName,
      accNo:    form.accNo.trim() || null,
      type:     form.type,
    })
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Kemaskini Rekod' : 'Tambah Akaun Bank / Panjar'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3 mt-2">
          {/* Jenis */}
          <div>
            <Label>Jenis</Label>
            <div className="grid grid-cols-2 gap-2 mt-1">
              {[
                { val: 'BANK',       label: 'Akaun Bank',    sub: 'Cek / online banking' },
                { val: 'PETTY_CASH', label: 'Panjar / Tunai', sub: 'Wang runcit / tunai' },
              ].map(opt => (
                <button type="button" key={opt.val} disabled={isEdit}
                  onClick={() => set('type', opt.val)}
                  className={`p-2.5 rounded-lg border-2 text-left transition-colors
                    ${form.type === opt.val ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}
                    ${isEdit ? 'opacity-60 cursor-not-allowed' : ''}`}>
                  <div className={`text-sm font-medium ${form.type === opt.val ? 'text-blue-700' : 'text-gray-700'}`}>{opt.label}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{opt.sub}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Kod <span className="text-red-500">*</span></Label>
              <Input className="mt-1" placeholder="Cth: MBB01" value={form.code}
                onChange={e => set('code', e.target.value)} disabled={isEdit} />
            </div>
            {!isPettyCash && (
              <div>
                <Label>Nama Bank <span className="text-red-500">*</span></Label>
                <Input className="mt-1" placeholder="Cth: Maybank" value={form.bankName}
                  onChange={e => set('bankName', e.target.value)} />
              </div>
            )}
          </div>

          <div>
            <Label>Nama {isPettyCash ? 'Panjar' : 'Akaun'} <span className="text-red-500">*</span></Label>
            <Input className="mt-1"
              placeholder={isPettyCash ? 'Cth: Panjar Wang Runcit' : 'Nama pemilik akaun'}
              value={form.name} onChange={e => set('name', e.target.value)} />
          </div>

          {!isPettyCash && (
            <div>
              <Label>No. Akaun <span className="text-red-500">*</span></Label>
              <Input className="mt-1" placeholder="Cth: 1234567890" value={form.accNo}
                onChange={e => set('accNo', e.target.value)} />
            </div>
          )}

          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={onClose}>Batal</Button>
            <Button type="submit" disabled={mut.isPending}>
              {mut.isPending && <Spinner className="w-4 h-4 mr-1.5" />}
              {isEdit ? 'Simpan' : 'Tambah'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default function AkaunBank() {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [selected, setSelected] = useState(null)
  const [filterType, setFilterType] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['bank-accounts'],
    queryFn: () => api.get('/bank-accounts').then(r => r.data),
  })

  const toggleMut = useMutation({
    mutationFn: (id) => api.patch(`/bank-accounts/${id}/toggle`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['bank-accounts'] }),
    onError: () => toast.error('Gagal kemaskini status'),
  })

  const all   = data?.data ?? []
  const banks = filterType ? all.filter(b => b.type === filterType) : all

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Akaun Bank & Panjar</h1>
          <p className="text-sm text-gray-500 mt-0.5">Akaun bank dan wang panjar MBI untuk pembayaran permohonan</p>
        </div>
        <Button onClick={() => { setSelected(null); setShowForm(true) }}>
          <Plus className="w-4 h-4 mr-1.5" /> Tambah
        </Button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4">
        {[
          { val: '',           label: `Semua (${all.length})` },
          { val: 'BANK',       label: `Bank (${all.filter(b => b.type === 'BANK').length})` },
          { val: 'PETTY_CASH', label: `Panjar/Tunai (${all.filter(b => b.type === 'PETTY_CASH').length})` },
        ].map(f => (
          <button key={f.val} onClick={() => setFilterType(f.val)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors
              ${filterType === f.val ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {f.label}
          </button>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-16"><Spinner /></div>
        ) : banks.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Landmark className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Tiada rekod</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 text-left">Kod</th>
                <th className="px-4 py-3 text-left">Jenis</th>
                <th className="px-4 py-3 text-left">Nama</th>
                <th className="px-4 py-3 text-left">Bank</th>
                <th className="px-4 py-3 text-left">No. Akaun</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {banks.map(b => (
                <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{b.code}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${TYPE_COLOR[b.type] ?? 'bg-gray-100 text-gray-600'}`}>
                      {TYPE_LABEL[b.type] ?? b.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-800">{b.name}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{b.type === 'BANK' ? b.bankName : '—'}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">{b.accNo ?? '—'}</td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => toggleMut.mutate(b.id)} disabled={toggleMut.isPending}>
                      {b.isActive
                        ? <ToggleRight className="w-6 h-6 text-green-500 mx-auto" />
                        : <ToggleLeft  className="w-6 h-6 text-gray-300 mx-auto" />}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => { setSelected(b); setShowForm(true) }}
                      className="p-1.5 text-gray-400 hover:text-blue-600 rounded hover:bg-blue-50">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showForm && (
        <BankForm record={selected} onClose={() => { setShowForm(false); setSelected(null) }} />
      )}
    </div>
  )
}
