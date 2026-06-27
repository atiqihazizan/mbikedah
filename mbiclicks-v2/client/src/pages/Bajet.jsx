import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Plus, ChevronRight, CheckCircle2, Lock, Trash2, Eye } from 'lucide-react'
import { budgetApi, STATUS_LABEL, STATUS_COLOR } from '@/lib/budget'
import { useAuthStore } from '@/store/auth'
import { Button, Badge, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Label, Select } from '@/components/ui'

function fmtRM(n) {
  return Number(n).toLocaleString('ms-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function Bajet() {
  const navigate  = useNavigate()
  const qc        = useQueryClient()
  const hasRole   = useAuthStore((s) => s.hasRole)

  const isFinance = hasRole('finance_hod', 'finance')
  const canView   = hasRole('finance_hod', 'finance', 'admin', 'hod', 'ceo', 'staff')

  const [showCreate, setShowCreate]   = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [form, setForm]               = useState({ year: new Date().getFullYear() + 1, adjLimit: 2, nextBudgetMonth: 10 })

  const { data: years = [], isLoading } = useQuery({
    queryKey: ['budget-years'],
    queryFn:  budgetApi.listYears,
  })

  const createMut = useMutation({
    mutationFn: budgetApi.createYear,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['budget-years'] }); setShowCreate(false); toast.success('Tahun bajet berjaya dicipta') },
    onError:   (e) => toast.error(e.response?.data?.message ?? 'Gagal cipta'),
  })

  const activateMut = useMutation({
    mutationFn: budgetApi.activateYear,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['budget-years'] }); toast.success('Bajet diaktifkan') },
    onError:   (e) => toast.error(e.response?.data?.message ?? 'Gagal aktifkan'),
  })

  const deleteMut = useMutation({
    mutationFn: budgetApi.deleteYear,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['budget-years'] }); setDeleteTarget(null); toast.success('Bajet dipadam') },
    onError:   (e) => toast.error(e.response?.data?.message ?? 'Gagal padam'),
  })

  const activeYear = years.find((y) => y.status === 'ACTIVE')

  // Auto-cipta DRAF untuk tahun semasa jika tiada rekod langsung (finance sahaja)
  useEffect(() => {
    if (!isFinance || isLoading || createMut.isPending) return
    if (years.length > 0) return
    const thisYear = new Date().getFullYear()
    createMut.mutate({ year: thisYear, adjLimit: 2, nextBudgetMonth: 10 })
  }, [isLoading, years.length, isFinance])

  return (
    <div className="max-w-[1000px] mx-auto px-4 sm:px-6 py-6 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Pengurusan Bajet</h1>
          <p className="text-sm text-gray-500 mt-0.5">Semak dan urus peruntukan bajet tahunan</p>
        </div>
        {isFinance && (
          <Button onClick={() => setShowCreate(true)} className="gap-2">
            <Plus className="w-4 h-4" /> Bajet Baru
          </Button>
        )}
      </div>

      {/* Bajet Aktif — ringkasan */}
      {activeYear && (
        <div className="bg-green-50 border border-green-200 rounded-xl px-5 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-green-700 uppercase tracking-wide">Bajet Semasa</p>
              <h2 className="text-2xl font-bold text-green-800 mt-0.5">Tahun {activeYear.year}</h2>
              <p className="text-xs text-green-600 mt-0.5">
                Pindaan: {activeYear.adjCount}/{activeYear.adjLimit}
              </p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => navigate(`/bajet/${activeYear.id}`)} className="gap-1.5">
                <Eye className="w-4 h-4" /> {isFinance ? 'Urus' : 'Lihat'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Senarai semua bajet */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700">Semua Tahun Bajet</h3>
        </div>

        {isLoading ? (
          <div className="py-10 text-center text-sm text-gray-400">Memuatkan...</div>
        ) : years.length === 0 ? (
          <div className="py-10 text-center text-sm text-gray-400">Tiada rekod bajet</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {years.map((y) => (
              <div key={y.id} className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">Bajet {y.year}</span>
                      <Badge variant={y.status === 'ACTIVE' ? 'green' : y.status === 'DRAFT' ? 'default' : 'red'}>
                        {STATUS_LABEL[y.status]}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {y._count?.lines ?? 0} baris akaun
                      {y.status === 'ACTIVE' && ` · Pindaan ${y.adjCount}/${y.adjLimit}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Aktifkan — finance, DRAFT sahaja */}
                  {isFinance && y.status === 'DRAFT' && (
                    <Button size="sm" variant="outline"
                      onClick={() => { if (confirm(`Aktifkan bajet ${y.year}? Bajet semasa akan ditutup.`)) activateMut.mutate(y.id) }}
                      className="gap-1.5 text-green-700 border-green-300 hover:bg-green-50">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Aktifkan
                    </Button>
                  )}

                  {/* Padam — finance, DRAFT sahaja */}
                  {isFinance && y.status === 'DRAFT' && (
                    <button onClick={() => setDeleteTarget(y)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Padam">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}

                  {/* Tutup — CLOSED, read only */}
                  {y.status === 'CLOSED' && (
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <Lock className="w-3.5 h-3.5" /> Tutup
                    </span>
                  )}

                  {/* Buka detail */}
                  <button onClick={() => navigate(`/bajet/${y.id}`)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Dialog cipta bajet baru */}
      <Dialog open={showCreate} onClose={() => setShowCreate(false)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Bajet Baharu</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Tahun</Label>
              <input type="number" value={form.year}
                onChange={(e) => setForm((f) => ({ ...f, year: +e.target.value }))}
                min={new Date().getFullYear()}
                className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <Label>Had Pindaan Bajet</Label>
              <Select value={form.adjLimit} onChange={(e) => setForm((f) => ({ ...f, adjLimit: +e.target.value }))} className="mt-1">
                {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n} pindaan</option>)}
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Batal</Button>
            <Button onClick={() => createMut.mutate(form)} disabled={createMut.isPending}>
              {createMut.isPending ? 'Mencipta...' : 'Cipta'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog konfirm padam */}
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Padam Bajet {deleteTarget?.year}?</DialogTitle></DialogHeader>
          <p className="text-sm text-gray-600 py-2">Semua baris bajet akan dipadam bersekali. Tindakan ini tidak boleh dibatalkan.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Batal</Button>
            <Button variant="destructive" onClick={() => deleteMut.mutate(deleteTarget.id)} disabled={deleteMut.isPending}>
              {deleteMut.isPending ? 'Memadam...' : 'Ya, Padam'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
