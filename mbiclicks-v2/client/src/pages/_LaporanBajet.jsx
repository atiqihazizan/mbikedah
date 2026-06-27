import { useState, useMemo, Fragment } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, FileBarChart2, ChevronRight } from 'lucide-react'
import { budgetApi, STATUS_LABEL, STATUS_COLOR } from '@/lib/budget'
import { useAuthStore } from '@/store/auth'
import { Button } from '@/components/ui'

const MONTHS_SHORT = ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ogs', 'Sep', 'Okt', 'Nov', 'Dis']

function fmtRM(n) {
  const v = Number(n)
  if (isNaN(v) || v === 0) return '-'
  return v.toLocaleString('ms-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
function fmtRMFull(n) {
  return Number(n).toLocaleString('ms-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
function clsNum(n) { return Number(n) < 0 ? 'text-red-600' : '' }

// ─── Pilih Tahun ─────────────────────────────────────────────────────────────
function YearPicker({ navigate }) {
  const { data: years = [], isLoading } = useQuery({
    queryKey: ['budget-years'],
    queryFn:  budgetApi.listYears,
  })

  return (
    <div className="max-w-[700px] mx-auto px-4 sm:px-6 py-6 space-y-5">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate('/laporan')}>
          <ArrowLeft size={15} /> Kembali
        </Button>
        <div>
          <div className="flex items-center gap-2">
            <FileBarChart2 size={18} className="text-purple-600" />
            <h1 className="text-xl font-bold text-gray-900">Laporan Bajet</h1>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">Pilih tahun bajet untuk jana laporan</p>
        </div>
      </div>

      {isLoading ? (
        <div className="py-10 text-center text-sm text-gray-400">Memuatkan...</div>
      ) : years.length === 0 ? (
        <div className="py-10 text-center text-sm text-gray-400">Tiada rekod bajet</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="divide-y divide-gray-50">
            {years.map((y) => (
              <button key={y.id} onClick={() => navigate(`/laporan/bajet/${y.id}`)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors text-left group">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">Bajet {y.year}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[y.status]}`}>
                      {STATUS_LABEL[y.status]}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{y._count?.lines ?? 0} baris akaun</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Ringkasan group definitions (range-based, matches Excel RINGKASAN) ────────
const HASIL_GROUPS = [
  { accNo: '5000/000', min: 5000, max: 5099 },
  { accNo: '5100/000', min: 5100, max: 5199 },
  { accNo: '5200/000', min: 5200, max: 5299 },
  { accNo: '5300/000', min: 5300, max: 5399 },
]
const BELANJA_GROUPS = [
  { accNo: '2000/000', min: 2000, max: 2999 },
  { accNo: '3000/000', min: 3000, max: 3999 },
  { accNo: '4000/000', min: 4000, max: 4999 },
  { accNo: '9000/000', min: 9000, max: 9099 },
  { accNo: '9100/000', min: 9100, max: 9199 },
  { accNo: '9200/000', min: 9200, max: 9299 },
  { accNo: '9300/000', min: 9300, max: 9399 },
  { accNo: '9400/000', min: 9400, max: 9499 },
  { accNo: '9500/000', min: 9500, max: 9599 },
  { accNo: '9600/000', min: 9600, max: 9699 },
]

function accNumericCode(accNo) {
  const p = accNo.split('/')[0]
  return /^\d+$/.test(p) ? parseInt(p, 10) : NaN
}

// ─── Sheets ───────────────────────────────────────────────────────────────────
function SheetRingkasan({ lines, budgetYear, prevYears = [] }) {
  const { hasil, belanja } = useMemo(() => {
    // Range-based summation — sum all lines whose numeric prefix falls in [min,max]
    function sumRange(min, max, field) {
      return lines.filter((l) => {
        const n = accNumericCode(l.accNo)
        return !isNaN(n) && n >= min && n <= max
      }).reduce((s, l) => s + (Number(l[field]) || 0), 0)
    }

    function sumRangePrev(min, max, py, field) {
      let total = 0
      for (const [accNo, vals] of Object.entries(py.byAccNo)) {
        const n = accNumericCode(accNo)
        if (!isNaN(n) && n >= min && n <= max) total += vals[field] ?? 0
      }
      return total
    }

    // Get group name from lines (use existing account record), fallback to accNo
    function groupName(accNo) {
      return lines.find((l) => l.accNo === accNo)?.name ?? accNo
    }

    const mapGroup = (g, i) => ({
      bil:     i + 1,
      accNo:   g.accNo,
      name:    groupName(g.accNo),
      sebenar: sumRange(g.min, g.max, 'sebenar'),
      bajet:   sumRange(g.min, g.max, 'peruntukan'),
      prev:    prevYears.map((py) => ({
        year:    py.year,
        sebenar: sumRangePrev(g.min, g.max, py, 'sebenar'),
        bajet:   sumRangePrev(g.min, g.max, py, 'bajet'),
      })),
    })

    return {
      hasil:   HASIL_GROUPS.map(mapGroup),
      belanja: BELANJA_GROUPS.map(mapGroup).filter((r) => r.bajet > 0 || r.sebenar > 0),
    }
  }, [lines, prevYears])

  // Totals — current year
  const tHB = hasil.reduce((s, r) => s + r.bajet, 0)
  const tHS = hasil.reduce((s, r) => s + r.sebenar, 0)
  const tBB = belanja.reduce((s, r) => s + r.bajet, 0)
  const tBS = belanja.reduce((s, r) => s + r.sebenar, 0)

  // Bottom rows calculations
  const lebihan_b   = tHB - tBB
  const lebihan_s   = tHS - tBS
  const bakiAwal    = budgetYear?.bakiAwal ?? 0
  const bakiAkhir_b = bakiAwal + lebihan_b
  const bakiAkhir_s = bakiAwal + lebihan_s
  // Tabungan khas: computed as 3% of HASIL (both BAJET and SEBENAR)
  const tabKhas_b   = tHB * 0.03
  const tabKhas_s   = tHS * 0.03
  const dep_b       = budgetYear?.depositSimpananTetap ?? 0
  const dep_s       = budgetYear?.depositSimpananTetapSebenar ?? 0
  const bakiAkhirSelepas_b = bakiAkhir_b + tabKhas_b + dep_b
  const bakiAkhirSelepas_s = bakiAkhir_s + tabKhas_s + dep_s

  const nPrev = prevYears.length
  // total cols: 3 fixed + nPrev sebenar + nPrev bajet + 2 current
  const totalCols = 3 + nPrev * 2 + 2

  const th  = 'px-3 py-2 text-xs font-semibold text-gray-600 bg-gray-50 border-b border-gray-200'
  const thR = `${th} text-right`
  const td  = 'px-3 py-2.5 text-xs border-b border-gray-100'
  const tdR = `${td} text-right font-mono`
  const tdS = `${tdR} text-gray-500`

  // ─ Column order (Excel format):
  // SEBENAR py1 | SEBENAR py2 | ... | BAJET py1 | BAJET py2 | ... | BAJET curr | SEBENAR curr

  // Helper: sebenar cols for all prev years, then bajet cols for all prev years
  const PrevSebenarHeaders = () => prevYears.map((py) => (
    <th key={`ps-${py.year}`} className={`${thR} bg-slate-50`}>Sebenar {py.year} (RM)</th>
  ))
  const PrevBajetHeaders = () => prevYears.map((py) => (
    <th key={`pb-${py.year}`} className={`${thR} bg-slate-100`}>Bajet {py.year} (RM)</th>
  ))

  // Cells: prev.sebenar for each year, then prev.bajet for each year
  const PrevSebenarCells = ({ row }) => row.prev.map((p) => (
    <td key={`ps-${p.year}`} className={tdS}>{fmtRM(p.sebenar)}</td>
  ))
  const PrevBajetCells = ({ row }) => row.prev.map((p) => (
    <td key={`pb-${p.year}`} className={tdS}>{fmtRM(p.bajet)}</td>
  ))

  // Totals for prev years (sebenar group then bajet group)
  const prevTotalsS = (rows, cls) => prevYears.map((_, i) => {
    const t = rows.reduce((s, r) => s + (r.prev[i]?.sebenar ?? 0), 0)
    return <td key={i} className={`px-3 py-2 text-right font-mono text-xs ${cls}`}>{fmtRMFull(t)}</td>
  })
  const prevTotalsB = (rows, cls) => prevYears.map((_, i) => {
    const t = rows.reduce((s, r) => s + (r.prev[i]?.bajet ?? 0), 0)
    return <td key={i} className={`px-3 py-2 text-right font-mono text-xs ${cls}`}>{fmtRMFull(t)}</td>
  })

  // Empty prev cells for bottom summary rows (BAKI AWAL, TABUNGAN, etc.)
  const EmptyPrevCells = () => prevYears.flatMap((_, i) => [
    <td key={`es-${i}`} className={tdS}>-</td>,
    <td key={`eb-${i}`} className={tdS}>-</td>,
  ])

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200">
      <table className="w-full text-xs" style={{ minWidth: 700 + nPrev * 200 }}>
        <thead>
          {nPrev > 0 && (
            <tr className="border-b border-gray-200">
              <th colSpan={3} className={th}></th>
              <th colSpan={nPrev} className={`${th} text-center bg-slate-50 border-l border-gray-200`}>SEBENAR PENERIMAAN</th>
              <th colSpan={nPrev} className={`${th} text-center bg-slate-100 border-l border-gray-200`}>BAJET PENERIMAAN</th>
              <th colSpan={2} className={`${th} text-center bg-blue-50 border-l border-gray-200`}>TAHUN {budgetYear?.year}</th>
            </tr>
          )}
          <tr>
            <th className={th} style={{ width: 36 }}>Bil</th>
            <th className={th} style={{ width: 110 }}>Kod Akaun</th>
            <th className={th}>Perihal</th>
            <PrevSebenarHeaders />
            <PrevBajetHeaders />
            <th className={`${thR} bg-blue-50`}>Bajet {budgetYear?.year} (RM)</th>
            <th className={`${thR} bg-blue-50`}>Sebenar {budgetYear?.year} (RM)</th>
          </tr>
        </thead>
        <tbody>
          {/* ── HASIL ── */}
          <tr className="bg-blue-50">
            <td colSpan={totalCols} className="px-3 py-2 font-bold text-xs text-blue-800 tracking-wide">
              PENERIMAAN (HASIL)
            </td>
          </tr>
          {hasil.map((r) => (
            <tr key={r.accNo} className="hover:bg-gray-50">
              <td className={td}>{r.bil}</td>
              <td className={`${td} font-mono text-gray-500`}>{r.accNo}</td>
              <td className={td}>{r.name}</td>
              <PrevSebenarCells row={r} />
              <PrevBajetCells row={r} />
              <td className={`${tdR} font-semibold`}>{fmtRM(r.bajet)}</td>
              <td className={tdR}>{fmtRM(r.sebenar)}</td>
            </tr>
          ))}
          <tr className="bg-blue-100 font-bold">
            <td colSpan={3} className="px-3 py-2 text-xs font-bold text-blue-900">JUMLAH PENERIMAAN</td>
            {prevTotalsS(hasil, 'text-blue-700')}
            {prevTotalsB(hasil, 'text-blue-700')}
            <td className="px-3 py-2 text-right font-mono text-xs text-blue-900">{fmtRMFull(tHB)}</td>
            <td className="px-3 py-2 text-right font-mono text-xs text-blue-900">{fmtRMFull(tHS)}</td>
          </tr>

          {/* ── BELANJA ── */}
          <tr className="bg-orange-50">
            <td colSpan={totalCols} className="px-3 py-2 font-bold text-xs text-orange-800 tracking-wide">
              PERBELANJAAN (BELANJA)
            </td>
          </tr>
          {belanja.map((r) => (
            <tr key={r.accNo} className="hover:bg-gray-50">
              <td className={td}>{r.bil}</td>
              <td className={`${td} font-mono text-gray-500`}>{r.accNo}</td>
              <td className={td}>{r.name}</td>
              <PrevSebenarCells row={r} />
              <PrevBajetCells row={r} />
              <td className={`${tdR} font-semibold`}>{fmtRM(r.bajet)}</td>
              <td className={tdR}>{fmtRM(r.sebenar)}</td>
            </tr>
          ))}
          <tr className="bg-orange-100 font-bold">
            <td colSpan={3} className="px-3 py-2 text-xs font-bold text-orange-900">JUMLAH KESELURUHAN PERBELANJAAN</td>
            {prevTotalsS(belanja, 'text-orange-700')}
            {prevTotalsB(belanja, 'text-orange-700')}
            <td className="px-3 py-2 text-right font-mono text-xs text-orange-900">{fmtRMFull(tBB)}</td>
            <td className="px-3 py-2 text-right font-mono text-xs text-orange-900">{fmtRMFull(tBS)}</td>
          </tr>

          {/* ── LEBIHAN/(KURANGAN) ── */}
          <tr className={`font-bold border-t-2 border-gray-300 ${lebihan_b < 0 ? 'bg-red-50' : 'bg-green-50'}`}>
            <td colSpan={3} className="px-3 py-2.5 text-xs font-bold text-gray-800">LEBIHAN / (KURANGAN)</td>
            {prevYears.map((_, i) => {
              const pS = hasil.reduce((s, r) => s + (r.prev[i]?.sebenar ?? 0), 0) - belanja.reduce((s, r) => s + (r.prev[i]?.sebenar ?? 0), 0)
              const pB = hasil.reduce((s, r) => s + (r.prev[i]?.bajet ?? 0), 0)   - belanja.reduce((s, r) => s + (r.prev[i]?.bajet ?? 0), 0)
              return <Fragment key={i}>
                <td className={`px-3 py-2.5 text-right font-mono text-xs ${clsNum(pS)}`}>{fmtRMFull(pS)}</td>
                <td className={`px-3 py-2.5 text-right font-mono text-xs ${clsNum(pB)}`}>{fmtRMFull(pB)}</td>
              </Fragment>
            })}
            <td className={`px-3 py-2.5 text-right font-mono text-xs font-bold ${clsNum(lebihan_b)}`}>{fmtRMFull(lebihan_b)}</td>
            <td className={`px-3 py-2.5 text-right font-mono text-xs font-bold ${clsNum(lebihan_s)}`}>{fmtRMFull(lebihan_s)}</td>
          </tr>

          {/* ── BAKI AWAL ── */}
          <tr className="border-t border-gray-200">
            <td colSpan={3} className="px-3 py-2 text-xs font-semibold text-gray-700">BAKI AWAL</td>
            <EmptyPrevCells />
            <td className={`${tdR} font-semibold`}>{fmtRMFull(bakiAwal)}</td>
            <td className={`${tdR} font-semibold`}>{fmtRMFull(bakiAwal)}</td>
          </tr>

          {/* ── BAKI AKHIR ── */}
          <tr className="bg-gray-50 font-bold">
            <td colSpan={3} className="px-3 py-2 text-xs font-bold text-gray-800">BAKI AKHIR</td>
            <EmptyPrevCells />
            <td className={`px-3 py-2 text-right font-mono text-xs font-bold ${clsNum(bakiAkhir_b)}`}>{fmtRMFull(bakiAkhir_b)}</td>
            <td className={`px-3 py-2 text-right font-mono text-xs font-bold ${clsNum(bakiAkhir_s)}`}>{fmtRMFull(bakiAkhir_s)}</td>
          </tr>

          {/* ── TABUNGAN KHAS (3%) ── */}
          <tr>
            <td colSpan={3} className="px-3 py-2 text-xs text-gray-600">TABUNGAN KHAS (3% daripada Hasil)</td>
            <EmptyPrevCells />
            <td className={tdR}>{fmtRMFull(tabKhas_b)}</td>
            <td className={tdR}>{fmtRMFull(tabKhas_s)}</td>
          </tr>

          {/* ── DEPOSIT SIMPANAN TETAP ── */}
          <tr>
            <td colSpan={3} className="px-3 py-2 text-xs text-gray-600">DEPOSIT SIMPANAN TETAP</td>
            <EmptyPrevCells />
            <td className={tdR}>{fmtRMFull(dep_b)}</td>
            <td className={tdR}>{fmtRMFull(dep_s)}</td>
          </tr>

          {/* ── BAKI AKHIR SELEPAS TABUNGAN & SIMPANAN ── */}
          <tr className="bg-blue-50 border-t-2 border-blue-300 font-bold">
            <td colSpan={3} className="px-3 py-2.5 text-xs font-bold text-blue-900">BAKI AKHIR SELEPAS TABUNGAN &amp; SIMPANAN</td>
            <EmptyPrevCells />
            <td className={`px-3 py-2.5 text-right font-mono text-xs font-bold text-blue-900`}>{fmtRMFull(bakiAkhirSelepas_b)}</td>
            <td className={`px-3 py-2.5 text-right font-mono text-xs font-bold text-blue-900`}>{fmtRMFull(bakiAkhirSelepas_s)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

function SheetPenyata({ lines, budgetYear, type }) {
  const filtered = lines.filter((l) => l.accType === type)
  const tBajet = filtered.reduce((s, l) => s + l.peruntukan, 0)
  const tSebenar = filtered.reduce((s, l) => s + l.sebenar, 0)
  const tBaki = filtered.reduce((s, l) => s + l.baki, 0)
  const topLevel = filtered.filter((l) => !l.parentAccNo)
  const byParent = {}
  for (const l of filtered) { if (l.parentAccNo) { if (!byParent[l.parentAccNo]) byParent[l.parentAccNo] = []; byParent[l.parentAccNo].push(l) } }

  const th = 'px-3 py-2 text-left text-xs font-semibold text-gray-600 bg-gray-50 border-b border-gray-200'
  const td = 'px-3 py-2 text-sm border-b border-gray-100'

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200">
      <table className="w-full text-xs">
        <thead>
          <tr>
            <th className={th} style={{ width: 110 }}>Kod Akaun</th>
            <th className={th}>Perihal</th>
            <th className={`${th} text-right`} style={{ width: 140 }}>Bajet {budgetYear?.year} (RM)</th>
            <th className={`${th} text-right`} style={{ width: 140 }}>Sebenar (RM)</th>
            <th className={`${th} text-right`} style={{ width: 140 }}>Baki (RM)</th>
          </tr>
        </thead>
        <tbody>
          {topLevel.map((parent) => (
            <>
              <tr key={parent.accNo} className="bg-gray-50 font-semibold">
                <td className={`${td} font-mono text-gray-600`}>{parent.accNo}</td>
                <td className={`${td} font-semibold text-gray-800`}>{parent.name}</td>
                <td className={`${td} text-right font-mono`}>{fmtRM(parent.peruntukan)}</td>
                <td className={`${td} text-right font-mono`}>{fmtRM(parent.sebenar)}</td>
                <td className={`${td} text-right font-mono ${clsNum(parent.baki)}`}>{fmtRM(parent.baki)}</td>
              </tr>
              {(byParent[parent.accNo] ?? []).map((child) => (
                <tr key={child.accNo} className="hover:bg-gray-50">
                  <td className={`${td} font-mono text-gray-400 pl-8`}>{child.accNo}</td>
                  <td className={`${td} text-gray-600 pl-8`}>{child.name}</td>
                  <td className={`${td} text-right font-mono`}>{fmtRM(child.peruntukan)}</td>
                  <td className={`${td} text-right font-mono`}>{fmtRM(child.sebenar)}</td>
                  <td className={`${td} text-right font-mono ${clsNum(child.baki)}`}>{fmtRM(child.baki)}</td>
                </tr>
              ))}
            </>
          ))}
          <tr className="border-t-2 border-gray-300 bg-gray-100 font-bold">
            <td colSpan={2} className="px-3 py-2.5 text-xs font-bold text-gray-700">JUMLAH {type}</td>
            <td className="px-3 py-2.5 text-right font-mono text-xs">{fmtRMFull(tBajet)}</td>
            <td className="px-3 py-2.5 text-right font-mono text-xs">{fmtRMFull(tSebenar)}</td>
            <td className={`px-3 py-2.5 text-right font-mono text-xs font-bold ${clsNum(tBaki)}`}>{fmtRMFull(tBaki)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

// ─── Sub Hasil (simple flat) ───────────────────────────────────────────────────
function SheetSubHasil({ lines, budgetYear }) {
  const filtered = lines.filter((l) => l.accType === 'HASIL' && l.parentAccNo)
  const th = 'px-3 py-2 text-left text-xs font-semibold text-gray-600 bg-gray-50 border-b border-gray-200'
  const td = 'px-3 py-2 text-sm border-b border-gray-100'
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200">
      <table className="w-full text-xs">
        <thead>
          <tr>
            <th className={th} style={{ width: 110 }}>Kod Akaun</th>
            <th className={th}>Perihal</th>
            <th className={th} style={{ width: 110 }}>Induk</th>
            <th className={`${th} text-right`} style={{ width: 140 }}>Bajet {budgetYear?.year} (RM)</th>
            <th className={`${th} text-right`} style={{ width: 140 }}>Sebenar (RM)</th>
            <th className={`${th} text-right`} style={{ width: 140 }}>Baki (RM)</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((l) => (
            <tr key={l.accNo} className="hover:bg-gray-50">
              <td className={`${td} font-mono text-gray-500`}>{l.accNo}</td>
              <td className={td}>{l.name}</td>
              <td className={`${td} font-mono text-gray-400`}>{l.parentAccNo}</td>
              <td className={`${td} text-right font-mono`}>{fmtRM(l.peruntukan)}</td>
              <td className={`${td} text-right font-mono`}>{fmtRM(l.sebenar)}</td>
              <td className={`${td} text-right font-mono ${clsNum(l.baki)}`}>{fmtRM(l.baki)}</td>
            </tr>
          ))}
          <tr className="border-t-2 border-gray-300 bg-gray-100 font-bold">
            <td colSpan={3} className="px-3 py-2.5 text-xs font-bold text-gray-700">JUMLAH SUB HASIL</td>
            <td className="px-3 py-2.5 text-right font-mono text-xs">{fmtRMFull(filtered.reduce((s, l) => s + l.peruntukan, 0))}</td>
            <td className="px-3 py-2.5 text-right font-mono text-xs">{fmtRMFull(filtered.reduce((s, l) => s + l.sebenar, 0))}</td>
            <td className={`px-3 py-2.5 text-right font-mono text-xs ${clsNum(filtered.reduce((s, l) => s + l.baki, 0))}`}>
              {fmtRMFull(filtered.reduce((s, l) => s + l.baki, 0))}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

// ─── Sub Belanja — BUTIRAN PERBELANJAAN (Excel format) ────────────────────────
const MKEYS  = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec']
const MLABEL = ['Jan','Feb','Mac','Apr','Mei','Jun','Jul','Ogs','Sep','Okt','Nov','Dis']
const GRP_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

function SheetSubBelanja({ lines, budgetYear }) {
  const belanjaAll = useMemo(() => lines.filter((l) => l.accType === 'BELANJA'), [lines])

  // YTD = months where sebenar exists (last month with non-zero actuals)
  const ytdMonth = useMemo(() => {
    let last = 0
    for (const l of belanjaAll) {
      MKEYS.forEach((m, i) => { if ((l.actualMonths?.[m] ?? 0) !== 0) last = Math.max(last, i + 1) })
    }
    return last || 5
  }, [belanjaAll])

  const byAccNo  = useMemo(() => Object.fromEntries(belanjaAll.map((l) => [l.accNo, l])), [belanjaAll])
  const children = useMemo(() => {
    const m = {}
    for (const l of belanjaAll) {
      const p = l.parentAccNo ?? '__root__'
      if (!m[p]) m[p] = []
      m[p].push(l)
    }
    for (const k of Object.keys(m)) m[k].sort((a, b) => a.accNo.localeCompare(b.accNo))
    return m
  }, [belanjaAll])

  // Recursive sum helpers
  function sumF(accNo, fn) {
    const ch = children[accNo]
    if (!ch?.length) return fn(byAccNo[accNo]) ?? 0
    return ch.reduce((s, c) => s + sumF(c.accNo, fn), 0)
  }
  const sumBajet  = (accNo) => MKEYS.slice(0, ytdMonth).reduce((s, m) => s + sumF(accNo, (l) => l?.bajetMonths?.[m] ?? 0), 0)
  const sumActual = (accNo) => MKEYS.slice(0, ytdMonth).reduce((s, m) => s + sumF(accNo, (l) => l?.actualMonths?.[m] ?? 0), 0)
  const sumBM     = (accNo, m) => sumF(accNo, (l) => l?.bajetMonths?.[m] ?? 0)
  const sumAM     = (accNo, m) => sumF(accNo, (l) => l?.actualMonths?.[m] ?? 0)

  const topNodes = children['__root__'] ?? []

  // Assign display labels
  const labelOf = {}
  let grpIdx = 0
  let leafBil = 0

  function assignLabels(nodes, parentLabel = '') {
    let subCount = 0
    for (const n of nodes) {
      const ch = children[n.accNo]
      const hasKids = !!ch?.length
      if (n.level === 0) {
        labelOf[n.accNo] = GRP_LETTERS[grpIdx++] ?? '?'
        if (hasKids) assignLabels(ch, labelOf[n.accNo])
      } else if (hasKids) {
        subCount++
        labelOf[n.accNo] = parentLabel ? `${parentLabel}-${subCount}` : `${subCount}`
        assignLabels(ch, labelOf[n.accNo])
      } else {
        leafBil++
        labelOf[n.accNo] = String(leafBil)
      }
    }
  }
  assignLabels(topNodes)

  // Column helpers
  const sebenarMonths = ytdMonth
  const bajetOnlyM    = 12 - ytdMonth
  const totalCols     = 3 + 2 + sebenarMonths * 2 + bajetOnlyM

  const thBase = 'px-1.5 py-1.5 text-[11px] font-semibold text-gray-600 bg-gray-50 border border-gray-200 whitespace-nowrap'
  const thR    = `${thBase} text-right`
  const thC    = `${thBase} text-center`
  const tdBase = 'px-1.5 py-1 text-[11px] border-b border-gray-100'
  const tdR    = `${tdBase} text-right font-mono`
  const tdG    = `${tdR} text-gray-400`

  // Render a single line (all monthly cells)
  function MonthCells({ accNo }) {
    return (
      <>
        <td className={tdR}>{fmtRM(sumBajet(accNo))}</td>
        <td className={tdR}>{fmtRM(sumActual(accNo))}</td>
        {MKEYS.slice(0, ytdMonth).map((m) => (
          <Fragment key={m}>
            <td className={tdG}>{fmtRM(sumBM(accNo, m))}</td>
            <td className={tdR}>{fmtRM(sumAM(accNo, m))}</td>
          </Fragment>
        ))}
        {MKEYS.slice(ytdMonth).map((m) => (
          <td key={m} className={tdG}>{fmtRM(sumBM(accNo, m))}</td>
        ))}
      </>
    )
  }

  // Render total cells
  function TotalCells({ accNo, cls = '' }) {
    return (
      <>
        <td className={`${tdR} ${cls}`}>{fmtRMFull(sumBajet(accNo))}</td>
        <td className={`${tdR} ${cls}`}>{fmtRMFull(sumActual(accNo))}</td>
        {MKEYS.slice(0, ytdMonth).map((m) => (
          <Fragment key={m}>
            <td className={`${tdG} font-semibold ${cls}`}>{fmtRMFull(sumBM(accNo, m))}</td>
            <td className={`${tdR} ${cls}`}>{fmtRMFull(sumAM(accNo, m))}</td>
          </Fragment>
        ))}
        {MKEYS.slice(ytdMonth).map((m) => (
          <td key={m} className={`${tdG} ${cls}`}>{fmtRMFull(sumBM(accNo, m))}</td>
        ))}
      </>
    )
  }

  // Recursive row renderer
  function renderNodes(nodes, depth = 0) {
    const rows = []
    for (const n of nodes) {
      const ch     = children[n.accNo]
      const hasKids = !!ch?.length
      const label  = labelOf[n.accNo] ?? ''
      const indent = depth * 16

      if (n.level === 0) {
        // Bold group header — orange-tinted
        rows.push(
          <tr key={n.accNo} className="bg-orange-50">
            <td className={`${tdBase} font-bold text-orange-800`}>{label}</td>
            <td className={`${tdBase} font-mono text-orange-700`}>{n.accNo}</td>
            <td className={`${tdBase} font-bold text-orange-800`}>{n.name.trim()}</td>
            <TotalCells accNo={n.accNo} cls="font-bold text-orange-800" />
          </tr>
        )
        if (hasKids) rows.push(...renderNodes(ch, depth + 1))
      } else if (hasKids) {
        // Sub-group row — gray-tinted
        rows.push(
          <tr key={n.accNo} className="bg-gray-50">
            <td className={`${tdBase} font-semibold text-gray-700`} style={{ paddingLeft: 6 + indent }}>{label}</td>
            <td className={`${tdBase} font-mono text-gray-500`}>{n.accNo}</td>
            <td className={`${tdBase} font-semibold text-gray-700`} style={{ paddingLeft: 6 + indent }}>{n.name.trim()}</td>
            <TotalCells accNo={n.accNo} cls="font-semibold text-gray-700" />
          </tr>
        )
        rows.push(...renderNodes(ch, depth + 1))
      } else {
        // Leaf item
        rows.push(
          <tr key={n.accNo} className="hover:bg-gray-50">
            <td className={tdBase} style={{ paddingLeft: 6 + indent }}>{label}</td>
            <td className={`${tdBase} font-mono text-gray-500`}>{n.accNo}</td>
            <td className={tdBase} style={{ paddingLeft: 6 + indent }}>{n.name.trim()}</td>
            <MonthCells accNo={n.accNo} />
          </tr>
        )
      }
    }
    return rows
  }

  // Grand totals
  const gtBajet  = topNodes.reduce((s, n) => s + sumBajet(n.accNo), 0)
  const gtActual = topNodes.reduce((s, n) => s + sumActual(n.accNo), 0)
  const gtBM     = (m) => topNodes.reduce((s, n) => s + sumBM(n.accNo, m), 0)
  const gtAM     = (m) => topNodes.reduce((s, n) => s + sumAM(n.accNo, m), 0)

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200">
      <table className="w-full text-[11px]" style={{ minWidth: 900 + sebenarMonths * 160 + bajetOnlyM * 80 }}>
        <thead>
          {/* Row 1: grouped headers */}
          <tr>
            <th colSpan={3} className={thBase}></th>
            <th colSpan={2} className={`${thC} bg-blue-50 border-x-2 border-blue-300`}>
              Sehingga {MLABEL[ytdMonth - 1]} {budgetYear?.year}
            </th>
            {MKEYS.slice(0, ytdMonth).map((m, i) => (
              <th key={m} colSpan={2} className={`${thC} bg-slate-50`}>{MLABEL[i]}</th>
            ))}
            {MKEYS.slice(ytdMonth).map((m, i) => (
              <th key={m} className={thC}>{MLABEL[ytdMonth + i]}</th>
            ))}
          </tr>
          {/* Row 2: individual column labels */}
          <tr>
            <th className={thBase} style={{ width: 36 }}>Bil</th>
            <th className={thBase} style={{ width: 100 }}>Kod Akaun</th>
            <th className={`${thBase} text-left`} style={{ minWidth: 200 }}>Perihal</th>
            <th className={`${thR} bg-blue-50`} style={{ width: 100 }}>Bajet (RM)</th>
            <th className={`${thR} bg-blue-50`} style={{ width: 100 }}>Sebenar (RM)</th>
            {MKEYS.slice(0, ytdMonth).map((m) => (
              <Fragment key={m}>
                <th className={`${thR} bg-slate-50`} style={{ width: 90 }}>Bajet</th>
                <th className={thR} style={{ width: 90 }}>Sebenar</th>
              </Fragment>
            ))}
            {MKEYS.slice(ytdMonth).map((m) => (
              <th key={m} className={`${thR} bg-slate-50`} style={{ width: 80 }}>Bajet</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {renderNodes(topNodes)}
          {/* Grand total */}
          <tr className="bg-orange-100 border-t-2 border-orange-400 font-bold">
            <td colSpan={3} className="px-2 py-2 text-xs font-bold text-orange-900">JUMLAH KESELURUHAN BELANJA</td>
            <td className="px-1.5 py-2 text-right font-mono text-xs font-bold text-orange-900">{fmtRMFull(gtBajet)}</td>
            <td className="px-1.5 py-2 text-right font-mono text-xs font-bold text-orange-900">{fmtRMFull(gtActual)}</td>
            {MKEYS.slice(0, ytdMonth).map((m) => (
              <Fragment key={m}>
                <td className="px-1.5 py-2 text-right font-mono text-xs text-orange-800">{fmtRMFull(gtBM(m))}</td>
                <td className="px-1.5 py-2 text-right font-mono text-xs text-orange-900 font-bold">{fmtRMFull(gtAM(m))}</td>
              </Fragment>
            ))}
            {MKEYS.slice(ytdMonth).map((m) => (
              <td key={m} className="px-1.5 py-2 text-right font-mono text-xs text-orange-800">{fmtRMFull(gtBM(m))}</td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
const SHEETS = [
  { id: 'ringkasan',   label: 'Ringkasan' },
  { id: 'penyata',     label: 'Penyata Hasil & Belanja' },
  { id: 'subhasil',    label: 'Sub Hasil' },
  { id: 'subbelanja',  label: 'Sub Belanja' },
]

export default function LaporanBajet() {
  const { id } = useParams()
  const navigate = useNavigate()
  const hasRole = useAuthStore((s) => s.hasRole)
  const isFinance = hasRole('finance_hod', 'finance')

  const [activeSheet, setActiveSheet] = useState('ringkasan')

  const { data, isLoading } = useQuery({
    queryKey: ['budget-report', id],
    queryFn:  () => budgetApi.getReport(Number(id)),
    enabled:  !!id && isFinance,
  })

  // Tanpa :id → tunjuk pilih tahun
  if (!id) return <YearPicker navigate={navigate} />

  if (!isFinance) {
    return (
      <div className="p-10 text-center text-gray-400 text-sm">
        Laporan bajet hanya untuk pengurusan kewangan sahaja.
      </div>
    )
  }

  const { budgetYear, lines = [], prevYears = [] } = data ?? {}

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/laporan/bajet')}>
            <ArrowLeft size={15} /> Kembali
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <FileBarChart2 size={18} className="text-purple-600" />
              <h1 className="text-xl font-bold text-gray-900">Laporan Bajet {budgetYear?.year ?? ''}</h1>
              {budgetYear && (
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[budgetYear.status]}`}>
                  {STATUS_LABEL[budgetYear.status]}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">Format laporan kewangan 4 bahagian</p>
          </div>
        </div>
      </div>

      <div className="flex gap-1 border-b border-gray-200">
        {SHEETS.map((s, i) => (
          <button key={s.id} onClick={() => setActiveSheet(s.id)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors flex items-center gap-1.5 ${
              activeSheet === s.id ? 'border-purple-500 text-purple-700' : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <span className={`w-5 h-5 rounded text-[11px] font-bold flex items-center justify-center ${
              activeSheet === s.id ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-500'
            }`}>{i + 1}</span>
            {s.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="py-16 text-center text-sm text-gray-400">Memuatkan laporan...</div>
      ) : !data ? (
        <div className="py-16 text-center text-sm text-gray-400">Tiada data laporan</div>
      ) : (
        <>
          {activeSheet === 'ringkasan'  && <SheetRingkasan   lines={lines} budgetYear={budgetYear} prevYears={prevYears} />}
          {activeSheet === 'penyata'    && <SheetPenyata    lines={lines} budgetYear={budgetYear} type="HASIL" />}
          {activeSheet === 'subhasil'   && <SheetSubHasil   lines={lines} budgetYear={budgetYear} />}
          {activeSheet === 'subbelanja' && <SheetSubBelanja lines={lines} budgetYear={budgetYear} />}
        </>
      )}

      <p className="text-xs text-gray-400 text-center pt-2">
        * Nilai sebenar berdasarkan data transaksi. Baki = Peruntukan − Permohonan diluluskan.
      </p>
    </div>
  )
}
