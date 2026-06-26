import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Plus, ChevronRight, CheckCircle2, Lock, RotateCcw } from 'lucide-react'
import { budgetApi, STATUS_LABEL, STATUS_COLOR, MONTHS } from '@/lib/budget'
import { useAuthStore } from '@/store/auth'
import {
  Button, Card, CardHeader, CardTitle, CardContent,
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
  Input, Label, Select, Badge,
} from '@/components/ui'

export default function Bajet() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const can = useAuthStore((s) => s.can)
  const hasRole = useAuthStore((s) => s.hasRole)
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ year: new Date().getFullYear() + 1, adjLimit: 2, nextBudgetMonth: 10 })

  const { data: years = [], isLoading } = useQuery({
    queryKey: ['budget-years'],
    queryFn: budgetApi.listYears,
  })

  const createMut = useMutation({
    mutationFn: budgetApi.createYear,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['budget-years'] })
      setShowCreate(false)
      toast.success('Tahun bajet berjaya dicipta')
    },
    onError: (err) => toast.error(err.response?.data?.message ?? 'Gagal cipta'),
  })

  const activateMut = useMutation({
    mutationFn: budgetApi.activateYear,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['budget-years'] })
      toast.success('Tahun bajet diaktifkan')
    },
    onError: (err) => toast.error(err.response?.data?.message ?? 'Gagal aktifkan'),
  })

  const activeYear = years.find((y) => y.status === 'ACTIVE')

  function canManage() {
    return hasRole('admin', 'finance_hod', 'finance')
  }

  return (
    <div className="p-6 space-y-5 max-w-[900px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Pengurusan Bajet</h1>
          <p className="text-sm text-gray-500 mt-0.5">Semak dan urus peruntukan bajet tahunan</p>
        </div>
        {canManage() && can('budget', 'canCreate') && (
          <Button onClick={() => setShowCreate(true)}>
            <Plus size={15} />
            Tahun Baru
          </Button>
        )}
      </div>

      {/* Active year highlight */}
      {activeYear && (
        <div className="rounded-xl p-5 text-white bg-green-700 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-48 h-48 rounded-full bg-white/10 translate-x-1/4 -translate-y-1/4" />
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-green-200 text-xs font-medium uppercase tracking-wider">Bajet Semasa</p>
              <h2 className="text-3xl font-bold mt-1">{activeYear.year}</h2>
              <p className="text-green-100 text-sm mt-1">
                Pindaan: {activeYear.adjCount}/{activeYear.adjLimit} &bull;{' '}
                {activeYear.adjCount >= activeYear.adjLimit
                  ? 'Had pindaan dicapai'
                  : `${activeYear.adjLimit - activeYear.adjCount} pindaan berbaki`}
              </p>
            </div>
            <CheckCircle2 size={48} className="text-white/20" />
          </div>
          <button
            onClick={() => navigate(`/bajet/${activeYear.id}`)}
            className="relative z-10 mt-4 flex items-center gap-1.5 text-sm text-green-100 hover:text-white font-medium transition-colors"
          >
            Buka Bajet <ChevronRight size={14} />
          </button>
        </div>
      )}

      {/* All years list */}
      {isLoading ? (
        <div className="text-center py-12 text-gray-400">Memuatkan...</div>
      ) : (
        <div className="space-y-2">
          {years.filter((y) => y.status !== 'ACTIVE').map((year) => (
            <Card key={year.id} className="hover:border-green-200 transition-colors cursor-pointer"
              onClick={() => navigate(`/bajet/${year.id}`)}>
              <CardContent className="py-4 px-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                      {year.status === 'CLOSED' ? (
                        <Lock size={16} className="text-gray-400" />
                      ) : (
                        <span className="font-bold text-gray-500 text-sm">{String(year.year).slice(-2)}</span>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Bajet {year.year}</p>
                      <p className="text-xs text-gray-500">
                        Pindaan: {year.adjCount}/{year.adjLimit} &bull; {year._count?.lines ?? 0} akaun
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={year.status === 'CLOSED' ? 'default' : 'green'}>
                      {STATUS_LABEL[year.status]}
                    </Badge>
                    {year.status === 'DRAFT' && canManage() && can('budget', 'canApprove') && (
                      <Button
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); activateMut.mutate(year.id) }}
                        disabled={activateMut.isPending}
                      >
                        Aktifkan
                      </Button>
                    )}
                    <ChevronRight size={16} className="text-gray-300" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {years.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <p>Belum ada rekod bajet</p>
            </div>
          )}
        </div>
      )}

      {/* Create dialog */}
      <Dialog open={showCreate} onClose={() => setShowCreate(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cipta Tahun Bajet Baru</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label>Tahun</Label>
              <Input
                type="number"
                value={form.year}
                onChange={(e) => setForm((f) => ({ ...f, year: +e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Had Pindaan</Label>
              <Select
                value={form.adjLimit}
                onChange={(e) => setForm((f) => ({ ...f, adjLimit: +e.target.value }))}
              >
                <option value={1}>1 pindaan</option>
                <option value={2}>2 pindaan</option>
                <option value={3}>3 pindaan</option>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Mula Persediaan Bajet Tahun Depan (Bulan)</Label>
              <Select
                value={form.nextBudgetMonth}
                onChange={(e) => setForm((f) => ({ ...f, nextBudgetMonth: +e.target.value }))}
              >
                {MONTHS.map((m, i) => (
                  <option key={i} value={i + 1}>{m} (Bulan {i + 1})</option>
                ))}
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
    </div>
  )
}
