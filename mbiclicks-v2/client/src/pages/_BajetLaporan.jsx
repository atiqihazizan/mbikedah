import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Download, FileBarChart2 } from 'lucide-react'
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

function clsNum(n) {
  return Number(n) < 0 ? 'text-red-600' : ''
}

// ─── Sheet 1: RINGKASAN ───────────────────────────────────────────────────────
function SheetRingkasan({ lines, budgetYear }) {
  const { hasil, belanja } = useMemo(() => {
    // Hanya top-level parent (level 0 atau 1 tanpa parent)
    const topHasil   = lines.filter((l) => l.accType === 'HASIL'   && !l.parentAccNo)
    const topBelanja = lines.filter((l) => l.accType === 'BELANJA' && !l.parentAccNo)

    function sumDesc(accNo) {
      const children = lines.filter((l) => l.parentAccNo === accNo)
      if (children.length === 0) return lines.find((l) => l.accNo === accNo)?.peruntukan ?? 0
      return children.reduce((s, c) => s + sumDesc(c.accNo), 0)
    }
    function sumDescSebenar(accNo) {
      const children = lines.filter((l) => l.parentAccNo === accNo)
      if (children.length === 0) return lines.find((l) => l.accNo === accNo)?.sebenar ?? 0
      return children.reduce((s, c) => s + sumDescSebenar(c.accNo), 0)
    }

    return {
      hasil:   topHasil.map((l, i)   => ({ bil: i + 1, accNo: l.accNo, name: l.name, sebenar: sumDescSebenar(l.accNo), bajet: sumDesc(l.accNo) })),
      belanja: topBelanja.map((l, i) => ({ bil: i + 1, accNo: l.accNo, name: l.name, sebenar: sumDescSebenar(l.accNo), bajet: sumDesc(l.accNo) })),
    }
  }, [lines])

  const totalHasilBajet   = hasil.reduce((s, r) => s + r.bajet, 0)
  const totalHasilSebenar = hasil.reduce((s, r) => s + r.sebenar, 0)
  const totalBelanjaBajet   = belanja.reduce((s, r) => s + r.bajet, 0)
  const totalBelanjaSebenar = belanja.reduce((s, r) => s + r.sebenar, 0)
  const bakiBajet   = totalHasilBajet   - totalBelanjaBajet
  const bakiSebenar = totalHasilSebenar - totalBelanjaSebenar

  const thCls = 'px-3 py-2 text-left text-xs font-semibold text-gray-600 bg-gray-50 border-b border-gray-200'
  const tdCls = 'px-3 py-2 text-sm border-b border-gray-100'

  return (
    <div className="space-y-6">
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-xs">
          <thead>
            <tr>
              <th className={thCls} style={{ width: 40 }}>Bil</th>
              <th className={thCls} style={{ width: 100 }}>Kod Akaun</th>
              <th className={thCls}>Perihal</th>
              <th className={`${thCls} text-right`}>Sebenar (RM)</th>
              <th className={`${thCls} text-right`}>Bajet {budgetYear?.year} (RM)</th>
            </tr>
          </thead>
          <tbody>
            {/* HASIL header */}
            <tr className="bg-blue-50">
              <td colSpan={5} className="px-3 py-2 font-bold text-xs text-blue-800 tracking-wide">HASIL</td>
            </tr>
            {hasil.map((r) => (
              <tr key={r.accNo} className="hover:bg-gray-50">
                <td className={tdCls}>{r.bil}</td>
                <td className={`${tdCls} font-mono text-gray-500`}>{r.accNo}</td>
                <td className={tdCls}>{r.name}</td>
                <td className={`${tdCls} text-right font-mono`}>{fmtRM(r.sebenar)}</td>
                <td className={`${tdCls} text-right font-mono font-semibold`}>{fmtRM(r.bajet)}</td>
              </tr>
            ))}
            <tr className="bg-blue-50 font-bold">
              <td colSpan={3} className="px-3 py-2 text-xs font-bold text-blue-800">JUMLAH HASIL</td>
              <td className="px-3 py-2 text-right font-mono text-xs text-blue-800">{fmtRMFull(totalHasilSebenar)}</td>
              <td className="px-3 py-2 text-right font-mono text-xs text-blue-800">{fmtRMFull(totalHasilBajet)}</td>
            </tr>

            {/* BELANJA header */}
            <tr className="bg-orange-50">
              <td colSpan={5} className="px-3 py-2 font-bold text-xs text-orange-800 tracking-wide">BELANJA</td>
            </tr>
            {belanja.map((r) => (
              <tr key={r.accNo} className="hover:bg-gray-50">
                <td className={tdCls}>{r.bil}</td>
                <td className={`${tdCls} font-mono text-gray-500`}>{r.accNo}</td>
                <td className={tdCls}>{r.name}</td>
                <td className={`${tdCls} text-right font-mono`}>{fmtRM(r.sebenar)}</td>
                <td className={`${tdCls} text-right font-mono font-semibold`}>{fmtRM(r.bajet)}</td>
              </tr>
            ))}
            <tr className="bg-orange-50 font-bold">
              <td colSpan={3} className="px-3 py-2 text-xs font-bold text-orange-800">JUMLAH BELANJA</td>
              <td className="px-3 py-2 text-right font-mono text-xs text-orange-800">{fmtRMFull(totalBelanjaSebenar)}</td>
              <td className="px-3 py-2 text-right font-mono text-xs text-orange-800">{fmtRMFull(totalBelanjaBajet)}</td>
            </tr>

            {/* BAKI/LEBIHAN */}
            <tr className="bg-green-50 font-bold border-t-2 border-green-300">
              <td colSpan={3} className="px-3 py-2.5 text-sm font-bold text-green-800">BAKI / LEBIHAN</td>
              <td className={`px-3 py-2.5 text-right font-mono text-sm font-bold ${clsNum(bakiSebenar)}`}>{fmtRMFull(bakiSebenar)}</td>
              <td className={`px-3 py-2.5 text-right font-mono text-sm font-bold ${clsNum(bakiBajet)}`}>{fmtRMFull(bakiBajet)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Sheet 2: PENYATA HASIL & BELANJA ─────────────────────────────────────────
function SheetPenyata({ lines, budgetYear, type }) {
  const filtered = lines.filter((l) => l.accType === type)

  const totalBajet   = filtered.reduce((s, l) => s + l.peruntukan, 0)
  const totalSebenar = filtered.reduce((s, l) => s + l.sebenar, 0)
  const totalBaki    = filtered.reduce((s, l) => s + l.baki, 0)

  const thCls = 'px-3 py-2 text-left text-xs font-semibold text-gray-600 bg-gray-50 border-b border-gray-200'
  const tdCls = 'px-3 py-2 text-sm border-b border-gray-100'

  // Group by parent
  const topLevel = filtered.filter((l) => !l.parentAccNo)
  const byParent = {}
  for (const l of filtered) {
    if (l.parentAccNo) {
      if (!byParent[l.parentAccNo]) byParent[l.parentAccNo] = []
      byParent[l.parentAccNo].push(l)
    }
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200">
      <table className="w-full text-xs">
        <thead>
          <tr>
            <th className={thCls} style={{ width: 110 }}>Kod Akaun</th>
            <th className={thCls}>Perihal</th>
            <th className={`${thCls} text-right`} style={{ width: 140 }}>Bajet {budgetYear?.year} (RM)</th>
            <th className={`${thCls} text-right`} style={{ width: 140 }}>Sebenar (RM)</th>
            <th className={`${thCls} text-right`} style={{ width: 140 }}>Baki (RM)</th>
          </tr>
        </thead>
        <tbody>
          {topLevel.map((parent) => (
            <>
              <tr key={parent.accNo} className="bg-gray-50 font-semibold">
                <td className={`${tdCls} font-mono text-gray-600`}>{parent.accNo}</td>
                <td className={`${tdCls} font-semibold text-gray-800`}>{parent.name}</td>
                <td className={`${tdCls} text-right font-mono`}>{fmtRM(parent.peruntukan)}</td>
                <td className={`${tdCls} text-right font-mono`}>{fmtRM(parent.sebenar)}</td>
                <td className={`${tdCls} text-right font-mono ${clsNum(parent.baki)}`}>{fmtRM(parent.baki)}</td>
              </tr>
              {(byParent[parent.accNo] ?? []).map((child) => (
                <tr key={child.accNo} className="hover:bg-gray-50">
                  <td className={`${tdCls} font-mono text-gray-400 pl-8`}>{child.accNo}</td>
                  <td className={`${tdCls} text-gray-600 pl-8`}>{child.name}</td>
                  <td className={`${tdCls} text-right font-mono`}>{fmtRM(child.peruntukan)}</td>
                  <td className={`${tdCls} text-right font-mono`}>{fmtRM(child.sebenar)}</td>
                  <td className={`${tdCls} text-right font-mono ${clsNum(child.baki)}`}>{fmtRM(child.baki)}</td>
                </tr>
              ))}
            </>
          ))}
          <tr className="border-t-2 border-gray-300 bg-gray-100 font-bold">
            <td colSpan={2} className="px-3 py-2.5 text-xs font-bold text-gray-700">JUMLAH {type}</td>
            <td className="px-3 py-2.5 text-right font-mono text-xs text-gray-700">{fmtRMFull(totalBajet)}</td>
            <td className="px-3 py-2.5 text-right font-mono text-xs text-gray-700">{fmtRMFull(totalSebenar)}</td>
            <td className={`px-3 py-2.5 text-right font-mono text-xs font-bold ${clsNum(totalBaki)}`}>{fmtRMFull(totalBaki)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

// ─── Sheet 3 & 4: SUB HASIL / SUB BELANJA — detail sub-akaun ─────────────────
function SheetSub({ lines, budgetYear, type }) {
  const filtered = lines.filter((l) => l.accType === type && l.parentAccNo)
  const total = filtered.reduce((s, l) => s + l.peruntukan, 0)

  const thCls = 'px-3 py-2 text-left text-xs font-semibold text-gray-600 bg-gray-50 border-b border-gray-200'
  const tdCls = 'px-3 py-2 text-sm border-b border-gray-100'

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200">
      <table className="w-full text-xs">
        <thead>
          <tr>
            <th className={thCls} style={{ width: 110 }}>Kod Akaun</th>
            <th className={thCls}>Perihal</th>
            <th className={thCls} style={{ width: 110 }}>Induk</th>
            <th className={`${thCls} text-right`} style={{ width: 140 }}>Peruntukan (RM)</th>
            <th className={`${thCls} text-right`} style={{ width: 140 }}>Sebenar (RM)</th>
            <th className={`${thCls} text-right`} style={{ width: 140 }}>Baki (RM)</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((l) => (
            <tr key={l.accNo} className="hover:bg-gray-50">
              <td className={`${tdCls} font-mono text-gray-500`}>{l.accNo}</td>
              <td className={tdCls}>{l.name}</td>
              <td className={`${tdCls} font-mono text-gray-400`}>{l.parentAccNo}</td>
              <td className={`${tdCls} text-right font-mono`}>{fmtRM(l.peruntukan)}</td>
              <td className={`${tdCls} text-right font-mono`}>{fmtRM(l.sebenar)}</td>
              <td className={`${tdCls} text-right font-mono ${clsNum(l.baki)}`}>{fmtRM(l.baki)}</td>
            </tr>
          ))}
          <tr className="border-t-2 border-gray-300 bg-gray-100 font-bold">
            <td colSpan={3} className="px-3 py-2.5 text-xs font-bold text-gray-700">JUMLAH SUB {type}</td>
            <td className="px-3 py-2.5 text-right font-mono text-xs">{fmtRMFull(total)}</td>
            <td className="px-3 py-2.5 text-right font-mono text-xs">{fmtRMFull(filtered.reduce((s, l) => s + l.sebenar, 0))}</td>
            <td className={`px-3 py-2.5 text-right font-mono text-xs font-bold ${clsNum(filtered.reduce((s, l) => s + l.baki, 0))}`}>
              {fmtRMFull(filtered.reduce((s, l) => s + l.baki, 0))}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

// ─── Main Laporan Page ────────────────────────────────────────────────────────
const SHEETS = [
  { id: 'ringkasan',  label: 'Ringkasan' },
  { id: 'penyata',   label: 'Penyata Hasil & Belanja' },
  { id: 'subhasil',  label: 'Sub Hasil' },
  { id: 'subbelanja',label: 'Sub Belanja' },
]

export default function BajetLaporan() {
  const { id } = useParams()
  const navigate = useNavigate()
  const hasRole = useAuthStore((s) => s.hasRole)
  const isFinance = hasRole('finance_hod', 'finance')

  const [activeSheet, setActiveSheet] = useState('ringkasan')

  const { data, isLoading } = useQuery({
    queryKey: ['budget-report', id],
    queryFn: () => budgetApi.getReport(Number(id)),
    enabled: !!id && isFinance,
  })

  if (!isFinance) {
    return (
      <div className="p-10 text-center text-gray-400 text-sm">
        Laporan bajet hanya untuk pengurusan kewangan sahaja.
      </div>
    )
  }

  const { budgetYear, lines = [] } = data ?? {}

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(`/bajet/${id}`)}>
            <ArrowLeft size={15} /> Kembali
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <FileBarChart2 size={18} className="text-purple-600" />
              <h1 className="text-xl font-bold text-gray-900">
                Laporan Bajet {budgetYear?.year ?? ''}
              </h1>
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

      {/* Sheet tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        {SHEETS.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setActiveSheet(s.id)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors flex items-center gap-1.5 ${
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
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="py-16 text-center text-sm text-gray-400">Memuatkan laporan...</div>
      ) : !data ? (
        <div className="py-16 text-center text-sm text-gray-400">Tiada data laporan</div>
      ) : (
        <div>
          {activeSheet === 'ringkasan'   && <SheetRingkasan  lines={lines} budgetYear={budgetYear} />}
          {activeSheet === 'penyata'     && <SheetPenyata    lines={lines} budgetYear={budgetYear} type="HASIL" />}
          {activeSheet === 'subhasil'    && <SheetSub        lines={lines} budgetYear={budgetYear} type="HASIL" />}
          {activeSheet === 'subbelanja'  && <SheetSub        lines={lines} budgetYear={budgetYear} type="BELANJA" />}
        </div>
      )}

      <p className="text-xs text-gray-400 text-center pt-2">
        * Nilai sebenar berdasarkan data transaksi. Baki = Peruntukan − Permohonan diluluskan.
      </p>
    </div>
  )
}
