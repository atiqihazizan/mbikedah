import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { FileText, Bell, Calendar, BarChart3, Clock, CheckCircle, XCircle, AlertCircle, ArrowRight, ChevronRight, Users, Building2 } from 'lucide-react'
// Building2 kekal untuk PendingApprovalsList (CEO view)
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth'
import { Button } from '@/components/ui'
import api from '@/lib/api'

const hour = new Date().getHours()
const greeting = hour < 12 ? 'Selamat Pagi' : hour < 18 ? 'Selamat Tengah Hari' : 'Selamat Petang'

const STATUS_CONFIG = {
  DRAFT:                      { label: 'Draf',              color: 'bg-gray-100 text-gray-600',    icon: FileText    },
  PENDING_HOD:                { label: 'Menunggu KJ',       color: 'bg-amber-100 text-amber-700',  icon: Clock       },
  PENDING_CEO:                { label: 'Menunggu Ketua Eksekutif', color: 'bg-rose-100 text-rose-700', icon: Clock },
  PENDING_FINANCE_CHECK:      { label: 'Semakan Kewangan',  color: 'bg-blue-100 text-blue-700',    icon: Clock       },
  PENDING_FINANCE_VERIFY:     { label: 'Pengesahan',        color: 'bg-indigo-100 text-indigo-700', icon: Clock       },
  PENDING_FINANCE_APPROVAL:   { label: 'Kelulusan Kewangan', color: 'bg-purple-100 text-purple-700', icon: Clock       },
  PENDING_CEO_FINAL:          { label: 'Kelulusan Muktamad', color: 'bg-rose-100 text-rose-700',    icon: Clock       },
  APPROVED:                   { label: 'Diluluskan',        color: 'bg-green-100 text-green-700',  icon: CheckCircle },
  PARTIAL_PAID:               { label: 'Bayaran Ansuran',   color: 'bg-cyan-100 text-cyan-700',    icon: Clock       },
  PAID:                       { label: 'Selesai Dibayar',   color: 'bg-teal-100 text-teal-700',    icon: CheckCircle },
  REJECTED:                   { label: 'Ditolak',           color: 'bg-red-100 text-red-700',      icon: XCircle     },
  RETURNED:                   { label: 'Dikembalikan',      color: 'bg-orange-100 text-orange-700', icon: AlertCircle },
}

const ALL_QUICK_LINKS = [
  { to: '/permohonan/baru', icon: FileText,  label: 'Permohonan Baru', module: 'billing',  bg: 'bg-gray-800' },
  { to: '/pekeliling',      icon: Bell,      label: 'Pekeliling',      module: 'circular', bg: 'bg-gray-800' },
  { to: '/kalendar',        icon: Calendar,  label: 'Kalendar',        module: 'event',    bg: 'bg-gray-800' },
  { to: '/laporan',         icon: BarChart3, label: 'Laporan',         module: 'report',   bg: 'bg-gray-800' },
]

const fmtRM = (v) => 'RM ' + Number(v).toLocaleString('ms-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

// ── Komponen: Senarai Pending Kelulusan (untuk KJ & CEO) ─────────────────────
function PendingApprovalsList({ role }) {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-pending', role],
    queryFn: () => api.get('/dashboard/pending-approvals').then((r) => r.data),
    staleTime: 30_000,
    enabled: role === 'hod' || role === 'finance_hod' || role === 'ceo',
  })

  if (!data || data.type === null) return null

  const isCeo  = data.type === 'ceo'
  const items  = data.items ?? []
  const totalPending = items.reduce((s, i) => s + (i.pendingCount ?? 0), 0)

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2 min-w-0">
          {isCeo ? <Building2 size={15} className="text-gray-500 shrink-0" /> : <Users size={15} className="text-gray-500 shrink-0" />}
          <h2 className="font-semibold text-gray-900 text-sm truncate">
            {isCeo ? 'Permohonan Menunggu Kelulusan Muktamad' : 'Ahli Jabatan — Menunggu Kelulusan'}
          </h2>
        </div>
        {totalPending > 0 && (
          <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
            {totalPending}
          </span>
        )}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="py-8 text-center text-gray-400 text-sm">Memuatkan...</div>
      ) : items.length === 0 ? (
        <div className="py-8 text-center text-gray-400 text-sm">Tiada rekod</div>
      ) : (
        <div className="divide-y divide-gray-50">
          {items.map((item) => (
            <Link
              key={item.id}
              to={`/permohonan?${isCeo ? `dept=${item.id}` : `staff=${item.id}`}&status=${isCeo ? 'PENDING_CEO_FINAL' : 'PENDING_HOD'}`}
              className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors group"
            >
              {/* Avatar */}
              <div className="w-9 h-9 rounded-full bg-gray-900 flex items-center justify-center shrink-0">
                <span className="text-white text-xs font-bold">
                  {isCeo
                    ? item.code?.slice(0, 2)
                    : item.name?.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                </span>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {isCeo ? item.name : item.name}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {isCeo
                    ? (item.head ? `${item.head.name} · ${item.head.position}` : 'Tiada KJ ditetapkan')
                    : `${item.staffNo} · ${item.position}`}
                </p>
              </div>

              {/* Badge */}
              <div className="shrink-0 flex items-center gap-2">
                {item.pendingCount > 0 ? (
                  <span className="bg-amber-500 text-white text-xs font-bold px-2.5 py-1 rounded-full min-w-[28px] text-center">
                    {item.pendingCount}
                  </span>
                ) : (
                  <span className="bg-green-100 text-green-700 text-xs font-medium px-2.5 py-1 rounded-full">
                    Tiada
                  </span>
                )}
                <ChevronRight size={14} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Dashboard utama ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const user    = useAuthStore((s) => s.user)
  const can     = useAuthStore((s) => s.can)
  const role    = user?.role?.slug
  const navigate = useNavigate()

  // HOD & Finance HOD boleh approve PENDING_HOD
  const isApprover = ['hod', 'finance_hod', 'admin'].includes(role)

  const quickLinks = ALL_QUICK_LINKS.filter((l) => can(l.module))

  const { data: dashboardData } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.get('/dashboard').then((r) => r.data),
    staleTime: 30_000,
  })

  const { data: pekelilingList = [] } = useQuery({
    queryKey: ['dashboard-pekeliling'],
    queryFn: () => api.get('/circular?limit=4').then((r) => r.data.data ?? []),
    staleTime: 60_000,
  })

  const permohonanList = dashboardData?.recent ?? []
  const billingStats = dashboardData?.stats?.billingByStatus ?? {}

  const statsCount = {
    total:           dashboardData?.stats?.totalBilling ?? 0,
    pending:         dashboardData?.stats?.pendingApproval ?? 0,
    approved:        billingStats.APPROVED ?? 0,
    rejected:        billingStats.REJECTED ?? 0,
    draft:           billingStats.DRAFT ?? 0,
    paid:            billingStats.PAID ?? 0,
    approvedAmount:  dashboardData?.stats?.approvedAmount ?? 0,
  }

  const showApprovalPanel = role === 'hod' || role === 'finance_hod' || role === 'ceo'

  return (
    <div className="flex flex-col min-h-full">

      {/* ── Welcome Banner ─────────────────────────────── */}
      <div className="relative bg-gray-900 overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 pt-6 sm:pt-8 pb-16">
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: 'radial-gradient(ellipse at 70% 50%, #16a34a 0%, transparent 60%)' }}
          />
          <div className="relative">
            <p className="text-gray-400 text-sm">{greeting},</p>
            <h1 className="text-white text-2xl sm:text-3xl font-bold mt-1">{user?.name}!</h1>
            <p className="text-gray-400 text-sm mt-1.5">
              {user?.position?.name && `${user.position.name} · `}{user?.department?.name}
            </p>
            <p className="text-gray-500 text-xs mt-3">
              {new Date().toLocaleDateString('ms-MY', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>
      </div>

      {/* ── Quick Action Tiles ──────────────────────────── */}
      <div className="max-w-[1400px] mx-auto w-full px-4 sm:px-6 -mt-8 relative z-10">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickLinks.map(({ to, icon: Icon, label, bg }) => (
            <Link
              key={to}
              to={to}
              className={`${bg} rounded-xl p-4 flex flex-col items-center gap-2.5 hover:brightness-110 transition-all group shadow-md`}
            >
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                <Icon className="w-5 h-5 text-white" />
              </div>
              <span className="text-white text-xs font-medium text-center leading-snug">{label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Body ───────────────────────────────────────── */}
      <div className="flex-1 bg-gray-50">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-5">

          {/* Status Summary */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            {[
              // { label: 'Jumlah Permohonan', value: statsCount.total,           color: 'text-gray-900',  bg: 'bg-gray-100' },
              { label: 'Draf',              value: statsCount.draft,           color: 'text-gray-600',  bg: 'bg-gray-100' },
              { label: 'Menunggu Kelulusan', value: statsCount.pending,        color: 'text-amber-700', bg: 'bg-amber-50' },
              { label: 'Diluluskan',         value: statsCount.approved,       color: 'text-green-700', bg: 'bg-green-50' },
              { label: 'Dibayar',            value: statsCount.paid,           color: 'text-teal-700',  bg: 'bg-teal-50'  },
              { label: 'Ditolak',            value: statsCount.rejected,       color: 'text-red-700',   bg: 'bg-red-50'   },
              // { label: 'Jumlah Disahkan',    value: `RM ${statsCount.approvedAmount.toLocaleString('ms-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, color: 'text-green-700', bg: 'bg-green-50' },
            ].map(({ label, value, color, bg }) => (
              <div key={label} className={`${bg} rounded-xl p-4 border border-white shadow-sm`}>
                <p className="text-xs text-gray-500 font-medium">{label}</p>
                <p className={`${typeof value === 'string' ? 'text-sm font-bold' : 'text-2xl'} font-bold mt-1 ${color}`}>{value}</p>
              </div>
            ))}
          </div>

          {/* Panel kelulusan — hanya untuk KJ dan CEO */}
          {/* {showApprovalPanel && <PendingApprovalsList role={role} />} */}

          {/* Two column: Permohonan + Pekeliling */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

            {/* Permohonan Terkini */}
            <div className="lg:col-span-3 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900 text-sm">Permohonan Terkini</h2>
                <Link to="/permohonan" className="text-xs text-green-600 hover:text-green-700 font-medium flex items-center gap-1">
                  Lihat semua <ArrowRight size={12} />
                </Link>
              </div>

              {permohonanList.length === 0 ? (
                <div className="py-12 text-center text-gray-400 text-sm">
                  <FileText className="mx-auto mb-2 text-gray-300" size={28} />
                  Tiada permohonan
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {permohonanList.slice(0, 5).map((p) => {
                    const cfg = STATUS_CONFIG[p.status] ?? STATUS_CONFIG.DRAFT

                    // Determine action page based on role + status
                    const getActionRoute = () => {
                      const role = user?.role?.slug

                      // HOD action page
                      if (p.status === 'PENDING_HOD' && ['hod', 'finance_hod', 'admin'].includes(role))
                        return `/permohonan/${p.id}/hod`

                      // CEO action pages (PENDING_CEO or PENDING_CEO_FINAL)
                      if ((p.status === 'PENDING_CEO' || p.status === 'PENDING_CEO_FINAL') && ['ceo', 'admin'].includes(role))
                        return `/permohonan/${p.id}/ceo`

                      // Finance Check page
                      if (p.status === 'PENDING_FINANCE_CHECK' && ['finance', 'finance_hod', 'admin'].includes(role))
                        return `/permohonan/${p.id}/semakan-kewangan`

                      // Finance Verify page
                      if (p.status === 'PENDING_FINANCE_VERIFY' && ['finance', 'finance_hod', 'admin'].includes(role))
                        return `/permohonan/${p.id}/pengesahan-kewangan`

                      // Finance Approval page
                      if (p.status === 'PENDING_FINANCE_APPROVAL' && ['finance_hod', 'admin'].includes(role))
                        return `/permohonan/${p.id}/kelulusan-kewangan`

                      // Default: view only
                      return `/permohonan/${p.id}`
                    }

                    const actionRoute = getActionRoute()

                    return (
                      <button
                        key={p.id}
                        onClick={() => navigate(actionRoute)}
                        className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors text-left"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{p.title ?? `Permohonan #${p.id}`}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{p.department?.name ?? '—'}</p>
                        </div>
                        <span className={`shrink-0 text-[11px] font-medium px-2 py-0.5 rounded-full ${cfg.color}`}>
                          {cfg.label}
                        </span>
                        <ChevronRight size={14} className="text-gray-300 shrink-0" />
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Pekeliling Terkini */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900 text-sm">Pekeliling Terkini</h2>
                <Link to="/pekeliling" className="text-xs text-green-600 hover:text-green-700 font-medium flex items-center gap-1">
                  Lihat semua <ArrowRight size={12} />
                </Link>
              </div>

              {pekelilingList.length === 0 ? (
                <div className="py-12 text-center text-gray-400 text-sm">
                  <Bell className="mx-auto mb-2 text-gray-300" size={28} />
                  Tiada pekeliling
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {pekelilingList.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => navigate(`/pekeliling/${c.id}`)}
                      className="w-full px-5 py-3.5 hover:bg-gray-50 transition-colors text-left"
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0 mt-1.5" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 line-clamp-2 leading-snug">{c.title}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {c.createdAt ? new Date(c.createdAt).toLocaleDateString('ms-MY') : '—'}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}
