import { useState, useMemo, useCallback, Fragment } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { FileBarChart2, ChevronDown, LayoutTemplate } from 'lucide-react'
import { budgetApi, reportLayoutApi, STATUS_LABEL, STATUS_COLOR } from '@/lib/budget'
import { useAuthStore } from '@/store/auth'

// ─── Formatters ───────────────────────────────────────────────────────────────
function fmtRM(n) {
  const v = Number(n)
  if (isNaN(v) || v === 0) return '-'
  return v.toLocaleString('ms-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
function fmtRMFull(n) {
  return Number(n).toLocaleString('ms-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
function clsNum(n) { return Number(n) < 0 ? 'text-red-600' : '' }

// ─── Ringkasan group definitions ──────────────────────────────────────────────
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

// ─── Sheet: Ringkasan ─────────────────────────────────────────────────────────
function SheetRingkasan({ lines, budgetYear, prevYears = [] }) {
  const { hasil, belanja } = useMemo(() => {
    function sumRange(accNo, field) {
      return lines
        // .filter((l) => { const n = accNumericCode(l.accNo); return !isNaN(n) && n >= min && n <= max })
        .filter((l) => l.accNo === accNo)
        .reduce((s, l) => s + (Number(l[field]) || 0), 0)
    }
    function sumRangePrev(an, py, field) {
      let t = 0
      for (const [accNo, v] of Object.entries(py.byAccNo)) {
        // const n = accNumericCode(accNo)
        // if (!isNaN(n) && n >= min && n <= max) t += v[field] ?? 0
        if (accNo === an) t += v[field] ?? 0
      }
      return t
    }
    function groupName(accNo) { return lines.find((l) => l.accNo === accNo)?.name ?? accNo }
    const mapGroup = (g, i) => ({
      bil: i + 1, accNo: g.accNo, name: groupName(g.accNo),
      sebenar: sumRange(g.accNo, 'sebenar'),
      bajet:   sumRange(g.accNo, 'peruntukan'),
      prev:    prevYears.map((py) => ({
        year:    py.year,
        sebenar: sumRangePrev(g.accNo, py, 'sebenar'),
        bajet:   sumRangePrev(g.accNo, py, 'bajet'),
      })),
    })

    return {
      hasil:   HASIL_GROUPS.map(mapGroup),
      belanja: BELANJA_GROUPS.map(mapGroup),
    }
  }, [lines, prevYears])

  const tHB = hasil.reduce((s, r) => s + r.bajet, 0)
  const tHS = hasil.reduce((s, r) => s + r.sebenar, 0)
  const tBB = belanja.reduce((s, r) => s + r.bajet, 0)
  const tBS = belanja.reduce((s, r) => s + r.sebenar, 0)
  const lebihan_b = tHB - tBB
  const lebihan_s = tHS - tBS
  const bakiAwal  = budgetYear?.bakiAwal ?? 0
  const bakiAkhir_b = bakiAwal + lebihan_b
  const bakiAkhir_s = bakiAwal + lebihan_s
  const tabKhas_b = tHB * 0.03
  const tabKhas_s = tHS * 0.03
  const dep_b = budgetYear?.depositSimpananTetap ?? 0
  const dep_s = budgetYear?.depositSimpananTetapSebenar ?? 0
  const bakiAkhirSelepas_b = bakiAkhir_b + tabKhas_b + dep_b
  const bakiAkhirSelepas_s = bakiAkhir_s + tabKhas_s + dep_s

  const nPrev    = prevYears.length
  const totalCols = 3 + nPrev * 2 + 2
  const th  = 'px-3 py-2 text-xs font-semibold text-gray-600 bg-gray-50 border-b border-gray-200'
  const thR = `${th} text-right`
  const td  = 'px-3 py-2.5 text-xs border-b border-gray-100'
  const tdR = `${td} text-right font-mono`
  const tdS = `${tdR} text-gray-500`

  const PrevSebenarHeaders = () => prevYears.map((py) => (
    <th key={`ps-${py.year}`} className={`${thR} bg-slate-50`}>Sebenar {py.year} (RM)</th>
  ))
  const PrevBajetHeaders = () => prevYears.map((py) => (
    <th key={`pb-${py.year}`} className={`${thR} bg-slate-100`}>Bajet {py.year} (RM)</th>
  ))
  const PrevSebenarCells = ({ row }) => row.prev.map((p) => (
    <td key={`ps-${p.year}`} className={tdS}>{fmtRM(p.sebenar)}</td>
  ))
  const PrevBajetCells = ({ row }) => row.prev.map((p) => (
    <td key={`pb-${p.year}`} className={tdS}>{fmtRM(p.bajet)}</td>
  ))
  const prevTotalsS = (rows, cls) => prevYears.map((_, i) => (
    <td key={i} className={`px-3 py-2 text-right font-mono text-xs ${cls}`}>
      {fmtRMFull(rows.reduce((s, r) => s + (r.prev[i]?.sebenar ?? 0), 0))}
    </td>
  ))
  const prevTotalsB = (rows, cls) => prevYears.map((_, i) => (
    <td key={i} className={`px-3 py-2 text-right font-mono text-xs ${cls}`}>
      {fmtRMFull(rows.reduce((s, r) => s + (r.prev[i]?.bajet ?? 0), 0))}
    </td>
  ))
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
          <tr className="bg-blue-50">
            <td colSpan={totalCols} className="px-3 py-2 font-bold text-xs text-blue-800 tracking-wide">PENERIMAAN (HASIL)</td>
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

          <tr className="bg-orange-50">
            <td colSpan={totalCols} className="px-3 py-2 font-bold text-xs text-orange-800 tracking-wide">PERBELANJAAN (BELANJA)</td>
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

          <tr className="border-t border-gray-200">
            <td colSpan={3} className="px-3 py-2 text-xs font-semibold text-gray-700">BAKI AWAL</td>
            <EmptyPrevCells />
            <td className={`${tdR} font-semibold`}>{fmtRMFull(bakiAwal)}</td>
            <td className={`${tdR} font-semibold`}>{fmtRMFull(bakiAwal)}</td>
          </tr>
          <tr className="bg-gray-50 font-bold">
            <td colSpan={3} className="px-3 py-2 text-xs font-bold text-gray-800">BAKI AKHIR</td>
            <EmptyPrevCells />
            <td className={`px-3 py-2 text-right font-mono text-xs font-bold ${clsNum(bakiAkhir_b)}`}>{fmtRMFull(bakiAkhir_b)}</td>
            <td className={`px-3 py-2 text-right font-mono text-xs font-bold ${clsNum(bakiAkhir_s)}`}>{fmtRMFull(bakiAkhir_s)}</td>
          </tr>
          <tr>
            <td colSpan={3} className="px-3 py-2 text-xs text-gray-600">TABUNGAN KHAS (3% daripada Hasil)</td>
            <EmptyPrevCells />
            <td className={tdR}>{fmtRMFull(tabKhas_b)}</td>
            <td className={tdR}>{fmtRMFull(tabKhas_s)}</td>
          </tr>
          <tr>
            <td colSpan={3} className="px-3 py-2 text-xs text-gray-600">DEPOSIT SIMPANAN TETAP</td>
            <EmptyPrevCells />
            <td className={tdR}>{fmtRMFull(dep_b)}</td>
            <td className={tdR}>{fmtRMFull(dep_s)}</td>
          </tr>
          <tr className="bg-blue-50 border-t-2 border-blue-300 font-bold">
            <td colSpan={3} className="px-3 py-2.5 text-xs font-bold text-blue-900">BAKI AKHIR SELEPAS TABUNGAN &amp; SIMPANAN</td>
            <EmptyPrevCells />
            <td className="px-3 py-2.5 text-right font-mono text-xs font-bold text-blue-900">{fmtRMFull(bakiAkhirSelepas_b)}</td>
            <td className="px-3 py-2.5 text-right font-mono text-xs font-bold text-blue-900">{fmtRMFull(bakiAkhirSelepas_s)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

// ─── Sheet: Penyata Hasil & Belanja ──────────────────────────────────────────
function SheetPenyata({ lines, budgetYear, type }) {
  const filtered  = lines.filter((l) => l.accType === type)
  const tBajet    = filtered.reduce((s, l) => s + l.peruntukan, 0)
  const tSebenar  = filtered.reduce((s, l) => s + l.sebenar, 0)
  const tBaki     = filtered.reduce((s, l) => s + l.baki, 0)
  const topLevel  = filtered.filter((l) => !l.parentAccNo)
  const byParent  = {}
  for (const l of filtered) {
    if (l.parentAccNo) {
      if (!byParent[l.parentAccNo]) byParent[l.parentAccNo] = []
      byParent[l.parentAccNo].push(l)
    }
  }
  const th = 'px-3 py-2 text-left text-xs font-semibold text-gray-600 bg-gray-50 border-b border-gray-200'
  const td = 'px-3 py-2 text-sm border-b border-gray-100'
  console.log(topLevel);
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
            <Fragment key={parent.accNo}>
              <tr className="bg-gray-50 font-semibold">
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
            </Fragment>
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

const MKEYS  = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec']
const MLABEL = ['Jan','Feb','Mac','Apr','Mei','Jun','Jul','Ogs','Sep','Okt','Nov','Dis']
const GRP_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

// ─── Sheet: Sub Hasil ─────────────────────────────────────────────────────────
// ─── Sheet: Sub Hasil & Sub Belanja (dikongsi) ───────────────────────────────
function SheetSubAkaun({ lines, budgetYear, type, currentMonth }) {
  const label  = type === 'HASIL' ? 'HASIL' : 'BELANJA'
  const belanjaAll = useMemo(() => lines.filter((l) => l.accType === type), [lines, type])

  // Guna currentMonth dari backend (bulan semasa tahun aktif, atau 12 untuk tahun lalu)
  const ytdMonth = currentMonth ?? 5

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
  const labelOf  = {}
  let grpIdx = 0, leafBil = 0

  function assignLabels(nodes, parentLabel = '') {
    let subCount = 0
    for (const n of nodes) {
      const ch = children[n.accNo], hasKids = !!ch?.length
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

  const bajetOnlyM = 12 - ytdMonth
  const thBase = 'px-1.5 py-1.5 text-[11px] font-semibold text-gray-600 bg-gray-50 border border-gray-200 whitespace-nowrap'
  const thR    = `${thBase} text-right`
  const thC    = `${thBase} text-center`
  const tdBase = 'px-1.5 py-1 text-[11px] border-b border-gray-100'
  const tdR    = `${tdBase} text-right font-mono`
  const tdG    = `${tdR} text-gray-400`

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

  function renderNodes(nodes, depth = 0) {
    const rows = []
    for (const n of nodes) {
      const ch = children[n.accNo], hasKids = !!ch?.length
      const label = labelOf[n.accNo] ?? '', indent = depth * 16
      if (n.level === 0) {
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

  const gtBajet  = topNodes.reduce((s, n) => s + sumBajet(n.accNo), 0)
  const gtActual = topNodes.reduce((s, n) => s + sumActual(n.accNo), 0)
  const gtBM = (m) => topNodes.reduce((s, n) => s + sumBM(n.accNo, m), 0)
  const gtAM = (m) => topNodes.reduce((s, n) => s + sumAM(n.accNo, m), 0)

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200">
      <table className="w-full text-[11px]" style={{ minWidth: 900 + ytdMonth * 160 + bajetOnlyM * 80 }}>
        <thead>
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
          <tr className="bg-orange-100 border-t-2 border-orange-400 font-bold">
            <td colSpan={3} className="px-2 py-2 text-xs font-bold text-orange-900">JUMLAH KESELURUHAN {label}</td>
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

// ─── Custom Layout Sheet ──────────────────────────────────────────────────────
function SheetCustomLayout({ layout, lines }) {
  const lineMap = useMemo(() => {
    const m = {}
    for (const l of lines) m[l.accNo] = l
    return m
  }, [lines])

  // Resolve bajet + sebenar for an accNo.
  // Direct match → use peruntukan/sebenar fields.
  // Parent (/000) account → aggregate sub-accounts in numeric range [floor(code/100)*100, +99].
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

        const items     = sec.items ?? []
        const totBajet  = sectionTotal(items)
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
                  const bajet   = resolved?.bajet   ?? null
                  const sebenar = resolved?.sebenar ?? null
                  const baki    = bajet !== null ? bajet - (sebenar ?? 0) : null

                  if (it.isGroupHeader) {
                    return (
                      <tr key={idx} className="bg-orange-50">
                        <td className="px-3 py-1.5 font-mono text-xs text-gray-500">{it.accNo}</td>
                        <td className="px-3 py-1.5 font-bold text-gray-800" colSpan={2}>
                          {it.label || it.accNo}
                        </td>
                        <td className="px-3 py-1.5 text-right tabular-nums font-bold">
                          {bajet !== null ? fmtRM(bajet) : ''}
                        </td>
                        <td className="px-3 py-1.5 text-right tabular-nums font-bold">
                          {sebenar !== null ? fmtRM(sebenar) : ''}
                        </td>
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

// ─── Sheets definition ────────────────────────────────────────────────────────
const SHEETS = [
  { id: 'ringkasan',  label: 'Ringkasan' },
  { id: 'penyata',    label: 'Penyata Hasil & Belanja' },
  { id: 'subhasil',   label: 'Sub Hasil' },
  { id: 'subbelanja', label: 'Sub Belanja' },
]

// ─── Main Laporan Page ────────────────────────────────────────────────────────
export default function Laporan() {
  const hasRole   = useAuthStore((s) => s.hasRole)
  const isFinance = hasRole('finance_hod', 'finance')
  const navigate  = useNavigate()

  const [searchParams, setSearchParams] = useSearchParams()
  const activeSheet    = searchParams.get('sheet') ?? 'ringkasan'
  const setActiveSheet = (val) => setSearchParams({ sheet: val })
  const [selectedYearId, setSelectedYearId] = useState(null)

  // Fetch custom layouts
  const { data: layouts = [] } = useQuery({
    queryKey: ['report-layouts'],
    queryFn:  reportLayoutApi.list,
    enabled:  isFinance,
  })

  // Fetch full layout data (with sections+items) for active layout tab
  const activeLayoutId = layouts.find((l) => `layout-${l.id}` === activeSheet)?.id ?? null
  const { data: activeLayout } = useQuery({
    queryKey: ['report-layouts', activeLayoutId],
    queryFn:  () => reportLayoutApi.get(activeLayoutId),
    enabled:  !!activeLayoutId,
  })

  // Fetch list of budget years
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

  // Auto-select active year on first load
  const effectiveYearId = selectedYearId ?? (years.find((y) => y.status === 'ACTIVE') ?? years[0])?.id

  // Fetch report for selected year
  const { data: reportData, isLoading: reportLoading } = useQuery({
    queryKey: ['budget-report', effectiveYearId],
    queryFn:  () => budgetApi.getReport(effectiveYearId),
    enabled:  !!effectiveYearId && isFinance,
  })

  if (!isFinance) {
    return (
      <div className="p-10 text-center text-gray-400 text-sm">
        Laporan kewangan hanya untuk pengurusan kewangan sahaja.
      </div>
    )
  }

  const { budgetYear, lines = [], prevYears = [], currentMonth } = reportData ?? {}
  const selectedYear = years.find((y) => y.id === effectiveYearId)

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 space-y-5">
      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <FileBarChart2 size={20} className="text-purple-600" />
          <h1 className="text-xl font-bold text-gray-900">Laporan Kewangan</h1>
        </div>

        {/* Year selector */}
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
            <LayoutTemplate size={13} /> Bina Layout
          </button>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 border-b border-gray-200 overflow-x-auto">
        {SHEETS.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setActiveSheet(s.id)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeSheet === s.id
                ? 'border-purple-500 text-purple-700'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <span className={`w-5 h-5 rounded text-[11px] font-bold flex items-center justify-center ${
              activeSheet === s.id ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-500'
            }`}>{i + 1}</span>
            {s.label}
          </button>
        ))}
        {/* Custom layout tabs */}
        {layouts.map((l) => (
          <button
            key={`layout-${l.id}`}
            onClick={() => setActiveSheet(`layout-${l.id}`)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeSheet === `layout-${l.id}`
                ? 'border-purple-500 text-purple-700'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <LayoutTemplate size={13} className={activeSheet === `layout-${l.id}` ? 'text-purple-600' : 'text-gray-400'} />
            {l.name}
          </button>
        ))}
      </div>

      {/* ── Content ── */}
      {yearsLoading || reportLoading ? (
        <div className="py-16 text-center text-sm text-gray-400">Memuatkan laporan...</div>
      ) : !reportData ? (
        <div className="py-16 text-center text-sm text-gray-400">
          {years.length === 0 ? 'Tiada rekod bajet' : 'Pilih tahun untuk melihat laporan'}
        </div>
      ) : (
        <>
          {activeSheet === 'ringkasan'  && <SheetRingkasan  lines={lines} budgetYear={budgetYear} prevYears={prevYears} />}
          {activeSheet === 'penyata'    && (
            <div className="space-y-6">
              <SheetPenyata lines={lines} budgetYear={budgetYear} type="HASIL" />
              <SheetPenyata lines={lines} budgetYear={budgetYear} type="BELANJA" />
            </div>
          )}
          {activeSheet === 'subhasil'   && <SheetSubAkaun lines={lines} budgetYear={budgetYear} type="HASIL"   currentMonth={currentMonth} />}
          {activeSheet === 'subbelanja' && <SheetSubAkaun lines={lines} budgetYear={budgetYear} type="BELANJA" currentMonth={currentMonth} />}
          {activeSheet.startsWith('layout-') && (
            <SheetCustomLayout layout={activeLayout} lines={lines} />
          )}
        </>
      )}

      <p className="text-xs text-gray-400 text-center pt-2">
        * Nilai sebenar berdasarkan data transaksi dari AutoCount. Baki = Peruntukan − Permohonan diluluskan.
      </p>
    </div>
  )
}
