import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ArrowLeft, Save, Lock, Info, ChevronDown, ChevronRight, FileText, Settings } from 'lucide-react'
import { budgetApi, MONTHS, MONTH_KEYS, STATUS_LABEL, STATUS_COLOR } from '@/lib/budget'
import { useAuthStore } from '@/store/auth'
import { Button, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Label, Select } from '@/components/ui'

function fmtRM(n) {
  return Number(n).toLocaleString('ms-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function sumChildren(rows, parentNo, month) {
  return rows
    .filter((r) => r.parentAccNo === parentNo)
    .reduce((sum, r) => {
      if (r.isGroup) return sum + sumChildren(rows, r.accNo, month)
      return sum + (r.values[month] ?? 0)
    }, 0)
}

export default function BajetDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const hasRole = useAuthStore((s) => s.hasRole)

  const isFinance = hasRole('finance_hod', 'finance')

  const [editValues, setEditValues] = useState({})
  const [collapsed, setCollapsed] = useState(new Set())
  const [activeTab, setActiveTab] = useState('HASIL')
  const [showConfig, setShowConfig] = useState(false)
  const [configForm, setConfigForm] = useState({ adjLimit: 2 })

  const { data: budgetYear } = useQuery({
    queryKey: ['budget-year', id],
    queryFn: () => budgetApi.getYear(Number(id)),
  })

  const { data: lines = [], isLoading: linesLoading } = useQuery({
    queryKey: ['budget-lines', id],
    queryFn: () => budgetApi.getLines(Number(id)),
    enabled: !!id,
  })


  useEffect(() => {
    if (budgetYear) setConfigForm({ adjLimit: budgetYear.adjLimit })
  }, [budgetYear])

  const isReadOnly =
    !isFinance ||
    budgetYear?.status === 'CLOSED' ||
    (budgetYear?.status === 'ACTIVE' && budgetYear.adjCount >= budgetYear.adjLimit)

  useEffect(() => {
    if (lines.length > 0) {
      const init = {}
      for (const line of lines) {
        init[line.accNo] = Object.fromEntries(MONTH_KEYS.map((m) => [m, Number(line[m] ?? 0)]))
      }
      setEditValues(init)
    }
  }, [lines])

  const rows = useMemo(() => {
    return lines.map((l) => ({
      accNo:       l.account.accNo,
      name:        l.account.name,
      accType:     l.account.accType,
      parentAccNo: l.account.parentAccNo,
      level:       l.account.level,
      isGroup:     l.isGroup ?? false,
      values:      editValues[l.account.accNo] ?? Object.fromEntries(MONTH_KEYS.map((m) => [m, 0])),
    }))
  }, [lines, editValues])

  const filtered = rows.filter((r) => r.accType === activeTab)

  function setValue(accNo, month, val) {
    const n = parseFloat(val) || 0
    setEditValues((prev) => ({ ...prev, [accNo]: { ...(prev[accNo] ?? {}), [month]: n } }))
  }

  function rowTotal(accNo) {
    return MONTH_KEYS.reduce((s, m) => s + (editValues[accNo]?.[m] ?? 0), 0)
  }

  function toggleCollapse(accNo) {
    setCollapsed((prev) => {
      const next = new Set(prev)
      next.has(accNo) ? next.delete(accNo) : next.add(accNo)
      return next
    })
  }

  function isHidden(row) {
    if (!row.parentAccNo) return false
    if (collapsed.has(row.parentAccNo)) return true
    const parent = rows.find((r) => r.accNo === row.parentAccNo)
    if (!parent) return false
    return parent.parentAccNo ? isHidden(parent) : false
  }

  const initMut = useMutation({
    mutationFn: () => budgetApi.initLines(Number(id)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['budget-lines', id] })
      toast.success('Senarai akaun dimuatkan')
    },
    onError: (err) => toast.error(err.response?.data?.message ?? 'Gagal'),
  })

  const saveMut = useMutation({
    mutationFn: () => {
      // Akaun kumpulan (ada anak) tidak disimpan — nilai mereka dikira auto dari anak-anak
      const groupSet = new Set(rows.filter((r) => r.isGroup).map((r) => r.accNo))
      const payload = Object.entries(editValues)
        .filter(([accNo]) => !groupSet.has(accNo))
        .map(([accNo, vals]) => ({
          accNo, ...Object.fromEntries(MONTH_KEYS.map((m) => [m, vals[m] ?? 0])),
        }))
      return budgetApi.saveLines(Number(id), payload)
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['budget-lines', id] })
      qc.invalidateQueries({ queryKey: ['budget-years'] })
      qc.invalidateQueries({ queryKey: ['budget-year', id] })
      toast.success(data.message ?? 'Bajet disimpan')
    },
    onError: (err) => toast.error(err.response?.data?.message ?? 'Gagal menyimpan'),
  })

  const configMut = useMutation({
    mutationFn: () => budgetApi.updateConfig(Number(id), configForm),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['budget-year', id] })
      qc.invalidateQueries({ queryKey: ['budget-years'] })
      setShowConfig(false)
      toast.success('Konfigurasi dikemaskini')
    },
    onError: (err) => toast.error(err.response?.data?.message ?? 'Gagal kemaskini'),
  })

  // Grand total — skip virtual group rows (mereka aggregate sahaja, bukan nilai sebenar)
  const grandTotal = useMemo(() => {
    return filtered
      .filter((r) => !r.isGroup)
      .reduce((sum, r) => sum + rowTotal(r.accNo), 0)
  }, [filtered, editValues])

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/bajet')}>
            <ArrowLeft size={15} /> Kembali
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900">Bajet {budgetYear?.year}</h1>
              {budgetYear && (
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[budgetYear.status]}`}>
                  {STATUS_LABEL[budgetYear.status]}
                </span>
              )}
            </div>
            {budgetYear?.status === 'ACTIVE' && (
              <p className="text-xs text-gray-500">
                Pindaan: {budgetYear.adjCount}/{budgetYear.adjLimit} &bull;{' '}
                {budgetYear.adjCount >= budgetYear.adjLimit ? 'Had dicapai' : `${budgetYear.adjLimit - budgetYear.adjCount} berbaki`}
              </p>
            )}
            {budgetYear?.status === 'DRAFT' && (
              <p className="text-xs text-gray-500">Bajet hadapan — belum digunakan dalam permohonan</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isFinance && budgetYear?.status !== 'CLOSED' && (
            <Button variant="outline" size="sm" onClick={() => setShowConfig(true)}>
              <Settings size={14} /> Konfigurasi
            </Button>
          )}
          {isReadOnly ? (
            <div className="flex items-center gap-1.5 text-sm text-gray-400">
              <Lock size={14} />
              {!isFinance ? 'Lihat Sahaja'
                : budgetYear?.status === 'CLOSED' ? 'Read Only'
                : 'Had pindaan dicapai'}
            </div>
          ) : (
            <Button onClick={() => saveMut.mutate()} disabled={saveMut.isPending}>
              <Save size={14} />
              {budgetYear?.status === 'ACTIVE'
                ? `Simpan Pindaan ${(budgetYear.adjCount ?? 0) + 1}`
                : 'Simpan Bajet'}
            </Button>
          )}
        </div>
      </div>

      {/* Info bars */}
      {budgetYear?.status === 'DRAFT' && isFinance && (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-700">
          <Info size={15} className="shrink-0" />
          Bajet draf — boleh edit sepenuhnya. Tidak digunakan dalam permohonan sehingga diaktifkan.
        </div>
      )}

      {budgetYear?.status === 'ACTIVE' && !isReadOnly && budgetYear.adjCount < budgetYear.adjLimit && (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">
          <Info size={15} className="shrink-0" />
          Bajet semasa — boleh kemaskini jumlah sahaja. Digunakan dalam borang permohonan.
        </div>
      )}

      {budgetYear?.status === 'ACTIVE' && budgetYear.adjCount === budgetYear.adjLimit - 1 && !isReadOnly && (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 border border-amber-300 rounded-xl text-sm text-amber-800">
          <Info size={15} className="shrink-0" />
          Ini pindaan terakhir yang dibenarkan.
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-100">
        {['HASIL', 'BELANJA'].map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === t ? 'border-green-500 text-green-700' : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            {t === 'HASIL' ? 'Hasil' : 'Belanja'}
          </button>
        ))}
      </div>

      {/* Empty state */}
      {!linesLoading && lines.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 border border-dashed border-gray-300 rounded-2xl bg-gray-50">
          <FileText size={36} className="text-gray-300" />
          <div className="text-center">
            <p className="font-medium text-gray-700">Belum ada senarai akaun</p>
            <p className="text-sm text-gray-400 mt-1">Muatkan kod akaun untuk mula isi bajet</p>
          </div>
          {isFinance && (
            <Button onClick={() => initMut.mutate()} disabled={initMut.isPending}>
              {initMut.isPending ? 'Memuatkan...' : 'Muatkan Senarai Akaun'}
            </Button>
          )}
        </div>
      )}

      {/* Table */}
      {lines.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="sticky left-0 bg-gray-50 text-left px-4 py-3 font-semibold text-gray-700 min-w-[280px]">
                  Kod Akaun
                </th>
                {MONTHS.map((m, i) => (
                  <th key={i} className="text-right px-2 py-3 font-semibold text-gray-700 min-w-[90px]">{m}</th>
                ))}
                <th className="text-right px-4 py-3 font-semibold text-gray-700 min-w-[110px]">Jumlah</th>
              </tr>
            </thead>
            <tbody>
              {filtered.filter((r) => !isHidden(r)).map((row) => {
                const indent = (row.level ?? 0) * 20
                const isParent = row.isGroup
                const isCollapsed = collapsed.has(row.accNo)
                const total = isParent
                  ? MONTH_KEYS.reduce((s, m) => s + sumChildren(rows, row.accNo, m), 0)
                  : rowTotal(row.accNo)

                return (
                  <tr
                    key={row.accNo}
                    className={`border-b border-gray-100 last:border-0 transition-colors ${
                      isParent ? 'bg-green-50/30 font-semibold' : 'hover:bg-gray-50/60'
                    }`}
                  >
                    <td className="sticky left-0 bg-inherit px-2 py-1.5" style={{ paddingLeft: indent + 12 }}>
                      <div className="flex items-center gap-1.5">
                        {isParent && (
                          <button onClick={() => toggleCollapse(row.accNo)} className="text-gray-400 hover:text-gray-500 shrink-0">
                            {isCollapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
                          </button>
                        )}
                        <span className="text-gray-400 font-mono text-[11px] mr-1">{row.accNo}</span>
                        <span className={isParent ? 'text-gray-900' : 'text-gray-700'}>{row.name}</span>
                      </div>
                    </td>
                    {MONTH_KEYS.map((m) => (
                      <td key={m} className="px-1 py-1">
                        {isParent ? (
                          <div className="text-right px-2 py-1 text-gray-500 font-mono">
                            {fmtRM(sumChildren(rows, row.accNo, m))}
                          </div>
                        ) : (
                          <input
                            type="number"
                            disabled={isReadOnly}
                            value={editValues[row.accNo]?.[m] ?? 0}
                            onChange={(e) => setValue(row.accNo, m, e.target.value)}
                            className={`w-full text-right px-2 py-1 rounded font-mono bg-transparent text-[11px] ${
                              isReadOnly
                                ? 'text-gray-400 cursor-not-allowed'
                                : 'border border-transparent hover:border-gray-300 focus:border-green-500 focus:bg-green-50/50 focus:outline-none'
                            }`}
                            min={0}
                            step={100}
                          />
                        )}
                      </td>
                    ))}
                    <td className={`px-4 py-1.5 text-right font-mono font-semibold ${isParent ? 'text-gray-900' : 'text-gray-700'}`}>
                      {fmtRM(total)}
                    </td>
                  </tr>
                )
              })}
              <tr className="border-t-2 border-gray-200 bg-gray-50 font-bold">
                <td className="sticky left-0 bg-gray-50 px-4 py-2.5 text-gray-700">
                  JUMLAH {activeTab}
                </td>
                {MONTH_KEYS.map((m) => (
                  <td key={m} className="px-2 py-2.5 text-right font-mono text-gray-700">
                    {fmtRM(
                      filtered
                        .filter((r) => !r.isGroup)
                        .reduce((s, r) => s + (editValues[r.accNo]?.[m] ?? 0), 0)
                    )}
                  </td>
                ))}
                <td className="px-4 py-2.5 text-right font-mono text-gray-700">{fmtRM(grandTotal)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Config dialog */}
      {isFinance && (
        <Dialog open={showConfig} onClose={() => setShowConfig(false)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Konfigurasi Bajet {budgetYear?.year}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div className="space-y-1.5">
                <Label>Had Pindaan</Label>
                <Select
                  value={configForm.adjLimit}
                  onChange={(e) => setConfigForm((f) => ({ ...f, adjLimit: +e.target.value }))}
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>{n} pindaan</option>
                  ))}
                </Select>
                <p className="text-xs text-gray-400">Pindaan semasa: {budgetYear?.adjCount ?? 0}</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowConfig(false)}>Batal</Button>
              <Button onClick={() => configMut.mutate()} disabled={configMut.isPending}>Simpan</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
