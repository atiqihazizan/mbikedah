import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Eye, History } from 'lucide-react'
import { useAuthStore } from '@/store/auth'
import { BILLING_STATUS } from '@/lib/billing'
import { BillingService } from '@/billing/services/BillingService'
import { Button, Spinner } from '@/components/ui'

function fmtDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('ms-MY', { day: 'numeric', month: 'short', year: 'numeric' })
}

function fmtRM(v) {
  return 'RM ' + Number(v).toLocaleString('ms-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function StatusBadge({ status }) {
  const cfg = BILLING_STATUS[status] ?? { label: status, color: 'gray' }
  const colorMap = {
    gray: 'bg-gray-100 text-gray-700', teal: 'bg-teal-100 text-teal-700',
    red: 'bg-red-100 text-red-700',
  }
  return (
    <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${colorMap[cfg.color] ?? colorMap.gray}`}>
      {cfg.label}
    </span>
  )
}

export default function PermohonanSejarah() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [searchParams] = useSearchParams()
  const tab  = searchParams.get('status') ?? ''
  const [page, setPage] = useState(1)

  const roleSlug  = user?.role?.slug
  const isHod     = ['hod', 'finance_hod', 'admin'].includes(roleSlug)
  const isFinance = ['finance', 'finance_hod', 'admin'].includes(roleSlug)

  useEffect(() => { setPage(1) }, [tab])

  const { data, isLoading } = useQuery({
    queryKey: ['billings-sejarah', tab, page],
    queryFn:  ({ signal }) => BillingService.listSejarah({ status: tab || undefined, page, limit: 20 }, { signal }),
  })

  const rows       = data?.items ?? []
  const total      = data?.total ?? 0
  const totalPages = data?.totalPages ?? 1

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <History className="w-5 h-5 text-gray-400" /> Sejarah Permohonan
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">{total} rekod</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-16"><Spinner /></div>
        ) : rows.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <History className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Tiada rekod sejarah</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3 text-left">No. Siri</th>
                <th className="px-4 py-3 text-left">Pemohon</th>
                {(isFinance || isHod) && <th className="px-4 py-3 text-left">Jabatan</th>}
                <th className="px-4 py-3 text-left">Penerima</th>
                <th className="px-4 py-3 text-right">Jumlah</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Tarikh</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map(row => (
                <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-blue-600">{row.refNo}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-800">{row.applicant?.name}</div>
                    <div className="text-xs text-gray-400">{row.applicant?.staffNo}</div>
                  </td>
                  {(isFinance || isHod) && (
                    <td className="px-4 py-3 text-gray-600">{row.department?.name}</td>
                  )}
                  <td className="px-4 py-3 text-gray-700">{row.vendor?.name ?? '—'}</td>
                  <td className="px-4 py-3 text-right font-medium">{fmtRM(row.totalAmount)}</td>
                  <td className="px-4 py-3"><StatusBadge status={row.status} /></td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{fmtDate(row.createdAt)}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => navigate(`/permohonan/${row.id}`)}
                      className="p-1.5 text-gray-400 hover:text-blue-600 rounded hover:bg-blue-50"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
            ‹ Sebelum
          </Button>
          <span className="text-sm text-gray-500 px-2 py-1">{page} / {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
            Seterus ›
          </Button>
        </div>
      )}
    </div>
  )
}
