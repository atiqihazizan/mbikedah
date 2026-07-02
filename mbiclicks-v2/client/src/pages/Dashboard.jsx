import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { FileText, Bell, Calendar, BarChart3, ArrowRight, ChevronRight } from 'lucide-react'
import { useAuthStore } from '@/store/auth'
import { Spinner } from '@/components/ui'
import { DashboardService } from '@/dashboard/DashboardService'
import { DashboardViewModel } from '@/dashboard/DashboardViewModel'
import { DashboardSection } from '@/dashboard/components'
import api from '@/lib/api'
import MiniCalendar from '@/components/MiniCalendar'

const ALL_QUICK_LINKS = [
  { to: '/permohonan/baru', icon: FileText,  label: 'Permohonan Baru', module: 'billing' },
  { to: '/pekeliling',      icon: Bell,      label: 'Pekeliling',      module: 'circular' },
  { to: '/kalendar',        icon: Calendar,  label: 'Kalendar',        module: 'event' },
  { to: '/laporan',         icon: BarChart3, label: 'Laporan',         module: 'report' },
]

export default function Dashboard() {
  const { user, can } = useAuthStore()
  const navigate      = useNavigate()

  const { data: summary, isLoading } = useQuery({
    queryKey: ['me-summary'],
    queryFn:  ({ signal }) => DashboardService.getSummary({ signal }),
    staleTime: 30_000,
  })

  const { data: pekelilingList = [] } = useQuery({
    queryKey: ['dashboard-pekeliling'],
    queryFn:  () => api.get('/circular?limit=3').then(r => r.data.data ?? []),
    staleTime: 60_000,
  })

  const vm         = summary ? DashboardViewModel.build({ summary, viewer: user }) : null
  const quickLinks = ALL_QUICK_LINKS.filter(l => can(l.module))

  const date = new Date().toLocaleDateString('ms-MY', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div className="flex flex-col min-h-full">

      {/* Welcome Banner */}
      <div className="relative bg-gray-900 overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 pt-6 sm:pt-8 pb-16">
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: 'radial-gradient(ellipse at 70% 50%, #16a34a 0%, transparent 60%)' }} />
          <div className="relative">
            <p className="text-gray-400 text-sm">{vm?.greeting ?? ''},</p>
            <h1 className="text-white text-2xl sm:text-3xl font-bold mt-1">{user?.name}!</h1>
            <p className="text-gray-400 text-sm mt-1.5">
              {user?.position?.name && `${user.position.name} · `}{user?.department?.name}
            </p>
            <p className="text-gray-500 text-xs mt-3">{date}</p>
            {vm?.hasWork && (
              <p className="mt-3 inline-flex items-center gap-1.5 bg-amber-500/20 text-amber-300 text-xs font-medium px-3 py-1.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                {vm.totalTasks} tindakan menunggu
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="max-w-[1400px] mx-auto w-full px-4 sm:px-6 -mt-8 relative z-10">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickLinks.map(({ to, icon: Icon, label }) => (
            <Link key={to} to={to}
              className="bg-gray-800 rounded-xl p-4 flex flex-col items-center gap-2.5 hover:brightness-110 transition-all group shadow-md">
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                <Icon className="w-5 h-5 text-white" />
              </div>
              <span className="text-white text-xs font-medium text-center leading-snug">{label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 bg-gray-50">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 space-y-6">

          {isLoading ? (
            <div className="flex justify-center py-10"><Spinner /></div>
          ) : (
            <>
              <DashboardSection title="Permohonan Saya"  cards={vm?.applicationCards} />
              <DashboardSection title="Tindakan Saya"    cards={vm?.taskCards} />
            </>
          )}

          {/* Pekeliling + Kalendar */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

            {/* Pekeliling */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900 text-sm">Pekeliling Terkini</h2>
                <Link to="/pekeliling" className="text-xs text-green-600 hover:text-green-700 font-medium flex items-center gap-1">
                  Semua <ArrowRight size={12} />
                </Link>
              </div>
              {pekelilingList.length === 0 ? (
                <div className="py-10 text-center text-gray-400 text-sm">Tiada pekeliling</div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {pekelilingList.map(c => (
                    <button key={c.id} onClick={() => navigate(`/pekeliling/${c.id}`)}
                      className="w-full px-5 py-3.5 hover:bg-gray-50 transition-colors text-left">
                      <div className="flex items-start gap-2.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0 mt-1.5" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 line-clamp-2 leading-snug">{c.title}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {c.createdAt ? new Date(c.createdAt).toLocaleDateString('ms-MY') : '—'}
                          </p>
                        </div>
                        <ChevronRight size={14} className="text-gray-300 shrink-0 mt-0.5" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Kalendar */}
            <div className="lg:col-span-3 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
              <div className="px-5 py-4 border-b border-gray-100 shrink-0">
                <h2 className="font-semibold text-gray-900 text-sm">Kalendar Acara</h2>
              </div>
              <div className="flex-1 p-4 min-h-[280px]">
                <MiniCalendar endpoint="/events/public" theme="light" />
              </div>
            </div>

          </div>
        </div>
      </div>

    </div>
  )
}
