import { useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { FileBarChart2, ChevronDown, LayoutTemplate, PlusCircle } from 'lucide-react'
import { budgetApi, reportLayoutApi, STATUS_LABEL, STATUS_COLOR } from '@/lib/budget'
import { useAuthStore } from '@/store/auth'

function fmtRM(n) {
  const v = Number(n)
  if (isNaN(v) || v === 0) return '-'
  return v.toLocaleString('ms-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// ─── Custom Layout Sheet ──────────────────────────────────────────────────────
function SheetCustomLayout({ layout, lines }) {
  const lineMap = useMemo(() => {
    const m = {}
    for (const l of lines) m[l.accNo] = l
    return m
  }, [lines])

  const resolve = useCallback((accNo) => {
    if (lineMap[accNo]) {
      const l = lineMap[accNo]
      return { bajet: Number(l.peruntukan ?? 0), sebenar: Number(l.sebenar ?? 0) }
    }
    const prefix = accNo.split('/')[0]
    const code = /^\d+$/.test(prefix) ? parseInt(prefix, 10) : NaN
    if (isNaN(code)) return null
    const min = Math.floor(code / 100) * 100
    const max = min + 99
    let bajet = 0, sebenar = 0, found = false
    for (const l of lines) {
      const lp = l.accNo.split('/')[0]
      const lc = /^\d+$/.test(lp) ? parseInt(lp, 10) : NaN
      if (!isNaN(lc) && lc >= min && lc <= max) {
        bajet   += Number(l.peruntukan ?? 0)
        sebenar += Number(l.sebenar    ?? 0)
        found    = true
      }
    }
    return found ? { bajet, sebenar } : null
  }, [lineMap, lines])

  const sections = layout?.sections ?? []

  const sectionTotal  = (items) => items.reduce((s, it) => s + (resolve(it.accNo)?.bajet   ?? 0), 0)
  const sectionActual = (items) => items.reduce((s, it) => s + (resolve(it.accNo)?.sebenar ?? 0), 0)

  if (sections.length === 0)
    return <p className="text-center text-sm text-gray-400 py-16">Layout ini tiada bahagian lagi.</p>

  return (
    <div className="space-y-6">
      {sections.map((sec) => {
        if (sec.sectionType === 'SEPARATOR') {
          return (
            <div key={sec.id} className="flex items-center gap-3 py-1">
              <div className="flex-1 border-t border-gray-200" />
              {sec.title && <span className="text-xs text-gray-400 font-medium">{sec.title}</span>}
              <div className="flex-1 border-t border-gray-200" />
            </div>
          )
        }

        const items      = sec.items ?? []
        const totBajet   = sectionTotal(items)
        const totSebenar = sectionActual(items)

        return (
          <div key={sec.id}>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-800 text-white text-xs">
                  <th className="px-3 py-2 text-left w-28">KOD AKAUN</th>
                  <th className="px-3 py-2 text-left">{sec.title}</th>
                  <th className="px-3 py-2 text-right w-36">BAJET (RM)</th>
                  <th className="px-3 py-2 text-right w-36">SEBENAR (RM)</th>
                  <th className="px-3 py-2 text-right w-36">BAKI (RM)</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it, idx) => {
                  const resolved = resolve(it.accNo)
                  const bajet    = resolved?.bajet   ?? null
                  const sebenar  = resolved?.sebenar ?? null
                  const baki     = bajet !== null ? bajet - (sebenar ?? 0) : null

                  if (it.isGroupHeader) {
                    return (
                      <tr key={idx} className="bg-orange-50">
                        <td className="px-3 py-1.5 font-mono text-xs text-gray-500">{it.accNo}</td>
                        <td className="px-3 py-1.5 font-bold text-gray-800" colSpan={2}>{it.label || it.accNo}</td>
                        <td className="px-3 py-1.5 text-right tabular-nums font-bold">{bajet !== null ? fmtRM(bajet) : ''}</td>
                        <td className="px-3 py-1.5 text-right tabular-nums font-bold">{sebenar !== null ? fmtRM(sebenar) : ''}</td>
                        <td className={`px-3 py-1.5 text-right tabular-nums font-bold ${baki !== null && baki < 0 ? 'text-red-600' : ''}`}>
                          {baki !== null ? fmtRM(baki) : ''}
                        </td>
                      </tr>
                    )
                  }

                  return (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-3 py-1.5 font-mono text-xs text-gray-400">{it.accNo}</td>
                      <td className="px-3 py-1.5 text-gray-700">{it.label || lineMap[it.accNo]?.name || it.accNo}</td>
                      <td className="px-3 py-1.5 text-right tabular-nums">
                        {bajet !== null ? fmtRM(bajet) : <span className="text-gray-300 text-xs">—</span>}
                      </td>
                      <td className="px-3 py-1.5 text-right tabular-nums">
                        {sebenar !== null ? fmtRM(sebenar) : <span className="text-gray-300 text-xs">—</span>}
                      </td>
                      <td className={`px-3 py-1.5 text-right tabular-nums ${baki !== null && baki < 0 ? 'text-red-600' : ''}`}>
                        {baki !== null ? fmtRM(baki) : <span className="text-gray-300 text-xs">—</span>}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
              {sec.showTotal && items.length > 0 && (
                <tfoot>
                  <tr className="bg-gray-100 font-bold text-sm border-t-2 border-gray-300">
                    <td colSpan={2} className="px-3 py-2 text-gray-800">
                      {sec.totalLabel || `JUMLAH ${sec.title.toUpperCase()}`}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums">{fmtRM(totBajet)}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{fmtRM(totSebenar)}</td>
                    <td className={`px-3 py-2 text-right tabular-nums ${(totBajet - totSebenar) < 0 ? 'text-red-600' : ''}`}>
                      {fmtRM(totBajet - totSebenar)}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        )
      })}
    </div>
  )
}

// ─── Main Laporan Page ────────────────────────────────────────────────────────
export default function Laporan() {
  const hasRole   = useAuthStore((s) => s.hasRole)
  const isFinance = hasRole('finance_hod', 'finance')
  const navigate  = useNavigate()

  const [activeSheet,    setActiveSheet]    = useState(null)
  const [selectedYearId, setSelectedYearId] = useState(null)

  const { data: layouts = [] } = useQuery({
    queryKey: ['report-layouts'],
    queryFn:  reportLayoutApi.list,
    enabled:  isFinance,
  })

  const activeLayoutId = layouts.find((l) => `layout-${l.id}` === activeSheet)?.id ?? null
  const { data: activeLayout } = useQuery({
    queryKey: ['report-layouts', activeLayoutId],
    queryFn:  () => reportLayoutApi.get(activeLayoutId),
    enabled:  !!activeLayoutId,
  })

  const { data: years = [], isLoading: yearsLoading } = useQuery({
    queryKey: ['budget-years'],
    queryFn:  budgetApi.listYears,
    enabled:  isFinance,
    onSuccess: (data) => {
      if (!selectedYearId) {
        const active = data.find((y) => y.status === 'ACTIVE') ?? data[0]
        if (active) setSelectedYearId(active.id)
      }
    },
  })

  const effectiveYearId = selectedYearId ?? (years.find((y) => y.status === 'ACTIVE') ?? years[0])?.id

  const { data: reportData, isLoading: reportLoading } = useQuery({
    queryKey: ['budget-report', effectiveYearId],
    queryFn:  () => budgetApi.getReport(effectiveYearId),
    enabled:  !!effectiveYearId && isFinance,
  })

  // Auto-select first layout tab when layouts load and none selected
  const effectiveSheet = activeSheet ?? (layouts.length > 0 ? `layout-${layouts[0].id}` : null)

  if (!isFinance) {
    return (
      <div className="p-10 text-center text-gray-400 text-sm">
        Laporan kewangan hanya untuk pengurusan kewangan sahaja.
      </div>
    )
  }

  const { budgetYear, lines = [] } = reportData ?? {}
  const selectedYear = years.find((y) => y.id === effectiveYearId)

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <FileBarChart2 size={20} className="text-purple-600" />
          <h1 className="text-xl font-bold text-gray-900">Laporan Kewangan</h1>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Tahun:</span>
          <div className="relative">
            <select
              value={effectiveYearId ?? ''}
              onChange={(e) => setSelectedYearId(Number(e.target.value))}
              disabled={yearsLoading}
              className="appearance-none pl-3 pr-8 py-1.5 text-sm font-semibold border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-400 cursor-pointer"
            >
              {years.map((y) => (
                <option key={y.id} value={y.id}>
                  {y.year} — {y.status === 'ACTIVE' ? 'Aktif' : y.status === 'DRAFT' ? 'Draf' : 'Tutup'}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
          {selectedYear && (
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[selectedYear.status]}`}>
              {STATUS_LABEL[selectedYear.status]}
            </span>
          )}
          <button
            onClick={() => navigate('/laporan/layouts')}
            className="flex items-center gap-1.5 text-xs text-purple-600 hover:text-purple-800 px-3 py-1.5 border border-purple-200 hover:border-purple-400 rounded-lg transition-colors font-medium"
          >
            <LayoutTemplate size={13} /> Urus Layout
          </button>
        </div>
      </div>

      {/* Tabs — custom layouts only */}
      {layouts.length > 0 && (
        <div className="flex gap-1 border-b border-gray-200 overflow-x-auto">
          {layouts.map((l) => (
            <button
              key={`layout-${l.id}`}
              onClick={() => setActiveSheet(`layout-${l.id}`)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                effectiveSheet === `layout-${l.id}`
                  ? 'border-purple-500 text-purple-700'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              <LayoutTemplate size={13} className={effectiveSheet === `layout-${l.id}` ? 'text-purple-600' : 'text-gray-400'} />
              {l.name}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      {yearsLoading || reportLoading ? (
        <div className="py-16 text-center text-sm text-gray-400">Memuatkan laporan...</div>
      ) : layouts.length === 0 ? (
        <div className="py-20 text-center space-y-4">
          <LayoutTemplate size={40} className="mx-auto text-gray-200" />
          <div>
            <p className="text-gray-500 font-medium">Tiada layout laporan dibina lagi</p>
            <p className="text-sm text-gray-400 mt-1">Bina layout terlebih dahulu untuk memaparkan laporan</p>
          </div>
          <button
            onClick={() => navigate('/laporan/layouts')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
          >
            <PlusCircle size={15} /> Bina Layout Baru
          </button>
        </div>
      ) : !reportData ? (
        <div className="py-16 text-center text-sm text-gray-400">
          {years.length === 0 ? 'Tiada rekod bajet' : 'Pilih tahun untuk melihat laporan'}
        </div>
      ) : effectiveSheet?.startsWith('layout-') ? (
        <SheetCustomLayout layout={activeLayout} lines={lines} />
      ) : null}

      {lines.length > 0 && (
        <p className="text-xs text-gray-400 text-center pt-2">
          * Nilai sebenar berdasarkan data transaksi dari AutoCount. Baki = Peruntukan − Permohonan diluluskan.
        </p>
      )}
    </div>
  )
}
