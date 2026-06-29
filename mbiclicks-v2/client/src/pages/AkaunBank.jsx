import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Plus, Pencil, ToggleLeft, ToggleRight, Landmark } from 'lucide-react'
import api from '@/lib/api'
import {
  Button, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
  Input, Label, Spinner,
} from '@/components/ui'

function BankForm({ record, onClose }) {
  const qc = useQueryClient()
  const isEdit = !!record?.id
  const [form, setForm] = useState(
    record
      ? { code: record.code, name: record.name, bankName: record.bankName, accNo: record.accNo }
      : { code: '', name: '', bankName: '', accNo: '' }
  )

  const mut = useMutation({
    mutationFn: (body) => isEdit ? api.put(`/bank-accounts/${record.id}`, body) : api.post('/bank-accounts', body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bank-accounts'] })
      toast.success(isEdit ? 'Akaun bank dikemaskini' : 'Akaun bank ditambah')
      onClose()
    },
    onError: (e) => toast.error(e.response?.data?.message ?? 'Gagal menyimpan'),
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.code.trim())    return toast.error('Kod wajib diisi')
    if (!form.name.trim())    return toast.error('Nama akaun wajib diisi')
    if (!form.bankName.trim()) return toast.error('Nama bank wajib diisi')
    if (!form.accNo.trim())   return toast.error('No. akaun wajib diisi')
    mut.mutate(form)
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Kemaskini Akaun Bank' : 'Tambah Akaun Bank'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Kod <span className="text-red-500">*</span></Label>
              <Input className="mt-1" placeholder="Cth: MBB01" value={form.code}
                onChange={e => set('code', e.target.value)} disabled={isEdit} />
            </div>
            <div>
              <Label>Nama Bank <span className="text-red-500">*</span></Label>
              <Input className="mt-1" placeholder="Cth: Maybank" value={form.bankName}
                onChange={e => set('bankName', e.target.value)} />
            </div>
          </div>
          <div>
            <Label>Nama Akaun <span className="text-red-500">*</span></Label>
            <Input className="mt-1" placeholder="Nama pemilik akaun" value={form.name}
              onChange={e => set('name', e.target.value)} />
          </div>
          <div>
            <Label>No. Akaun <span className="text-red-500">*</span></Label>
            <Input className="mt-1" placeholder="Cth: 1234567890" value={form.accNo}
              onChange={e => set('accNo', e.target.value)} />
          </div>
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

  const { data, isLoading } = useQuery({
    queryKey: ['bank-accounts'],
    queryFn: () => api.get('/bank-accounts').then(r => r.data),
  })

  const toggleMut = useMutation({
    mutationFn: (id) => api.patch(`/bank-accounts/${id}/toggle`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['bank-accounts'] }),
    onError: () => toast.error('Gagal kemaskini status'),
  })

  const banks = data?.data ?? []

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Akaun Bank</h1>
          <p className="text-sm text-gray-500 mt-0.5">Akaun bank MBI untuk pembayaran permohonan</p>
        </div>
        <Button onClick={() => { setSelected(null); setShowForm(true) }}>
          <Plus className="w-4 h-4 mr-1.5" /> Tambah Akaun Bank
        </Button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-16"><Spinner /></div>
        ) : banks.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Landmark className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Tiada akaun bank didaftarkan</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 text-left">Kod</th>
                <th className="px-4 py-3 text-left">Nama Akaun</th>
                <th className="px-4 py-3 text-left">Bank</th>
                <th className="px-4 py-3 text-left">No. Akaun</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {banks.map(b => (
                <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">{b.code}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">{b.name}</td>
                  <td className="px-4 py-3 text-gray-600">{b.bankName}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">{b.accNo}</td>
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
