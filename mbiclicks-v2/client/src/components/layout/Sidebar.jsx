import { useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, FileText, ListChecks,
  PiggyBank, BookOpen, Landmark, BarChart3, Settings,
  Bell, Calendar, ChevronDown, ChevronRight, LogOut, Plus,
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/store/auth'
import { DashboardService } from '@/dashboard/DashboardService'
import api from '@/lib/api'
import { buildSidebarNav } from './SidebarViewModel'

const TOP_NAV = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/pekeliling', icon: Bell,           label: 'Pekeliling' },
  { to: '/kalendar',   icon: Calendar,       label: 'Kalendar'   },
]

const FINANCE_NAV = [
  { to: '/bajet',      icon: PiggyBank, label: 'Bajet'      },
  { to: '/akaun',      icon: BookOpen,  label: 'Kod Akaun'  },
  { to: '/akaun-bank', icon: Landmark,  label: 'Akaun Bank' },
]

const LAPORAN_TABS = [
  { val: 'ringkasan',  label: 'Ringkasan'               },
  { val: 'penyata',    label: 'Penyata Hasil & Belanja'  },
  { val: 'subhasil',   label: 'Sub Hasil'                },
  { val: 'subbelanja', label: 'Sub Belanja'              },
]

const TETAPAN_TABS = [
  { val: 'pengguna', label: 'Pengguna'            },
  { val: 'jabatan',  label: 'Jabatan'             },
  { val: 'jawatan',  label: 'Jawatan'             },
  { val: 'log',      label: 'Log Aktiviti'        },
  { val: 'peranan',  label: 'Peranan & Kebenaran' },
]

function loadSections() {
  try { return JSON.parse(localStorage.getItem('sidebar-sections')) ?? ['permohonan'] }
  catch { return ['permohonan'] }
}

function SubItem({ to, label, isActive, onClose }) {
  return (
    <Link
      to={to}
      onClick={onClose}
      className={`flex items-center gap-2 pl-9 pr-3 py-2 text-sm rounded-lg transition-all ${
        isActive
          ? 'bg-green-600/20 text-green-400 font-medium'
          : 'text-gray-500 hover:bg-gray-800 hover:text-gray-300'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isActive ? 'bg-green-400' : 'bg-gray-700'}`} />
      {label}
    </Link>
  )
}

function SectionBtn({ icon: Icon, label, badge, isActive, isOpen, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all hover:bg-white/5 ${
        isActive ? 'text-white' : 'text-gray-400'
      }`}
    >
      <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-green-400' : 'text-gray-500'}`} />
      <span className="flex-1 font-medium text-left">{label}</span>
      {badge > 0 && (
        <span className="text-xs font-bold bg-green-600 text-white px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
          {badge}
        </span>
      )}
      <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-0' : '-rotate-90'}`} />
    </button>
  )
}

export default function Sidebar({ open, onClose }) {
  const can     = useAuthStore((s) => s.can)
  const user    = useAuthStore((s) => s.user)
  const hasRole = useAuthStore((s) => s.hasRole)
  const logout  = useAuthStore((s) => s.logout)
  const navigate = useNavigate()
  const location = useLocation()

  const isFinance = hasRole('finance_hod', 'finance', 'admin')
  const isAdmin   = hasRole('admin')

  const [sections, setSections] = useState(loadSections)

  const { data: summary } = useQuery({
    queryKey:  ['me-summary'],
    queryFn:   ({ signal }) => DashboardService.getSummary({ signal }),
    staleTime: 30_000,
  })

  const nav = buildSidebarNav({ summary, location })

  function toggleSection(name) {
    setSections(prev => {
      const next = prev.includes(name) ? prev.filter(s => s !== name) : [...prev, name]
      localStorage.setItem('sidebar-sections', JSON.stringify(next))
      return next
    })
  }
  const isOpen = (name) => sections.includes(name)

  // URL helpers for tabbed sections — not workflow, just ?param=val navigation
  const laporan = {
    isOn:  location.pathname === '/laporan',
    check: (val) => location.pathname === '/laporan' && (new URLSearchParams(location.search).get('sheet') ?? 'ringkasan') === val,
    make:  (val) => val === 'ringkasan' ? '/laporan' : `/laporan?sheet=${val}`,
  }
  const tetapan = {
    isOn:  location.pathname === '/tetapan',
    check: (val) => location.pathname === '/tetapan' && (new URLSearchParams(location.search).get('tab') ?? 'pengguna') === val,
    make:  (val) => val === 'pengguna' ? '/tetapan' : `/tetapan?tab=${val}`,
  }

  async function handleLogout() {
    try { await api.post('/auth/logout') } catch {}
    logout()
    navigate('/login')
  }

  return (
    <aside
      className={`
        fixed md:static inset-y-0 left-0 z-30
        w-[240px] shrink-0 flex flex-col h-full bg-[#1a2236]
        transition-transform duration-200 ease-in-out
        ${open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-700/50">
        <img src="/logo.png" alt="MBI Logo" className="h-8 w-auto object-contain shrink-0" />
      </div>

      {/* User info */}
      {user && (
        <div className="px-4 py-3 border-b border-gray-700/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center shrink-0">
              <span className="text-white text-sm font-medium">{user.name?.charAt(0).toUpperCase()}</span>
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-medium truncate leading-none">{user.name}</p>
              <p className="text-gray-400 text-xs mt-0.5 truncate">{user.role?.name}</p>
            </div>
          </div>
        </div>
      )}

      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">

        {/* Core */}
        {TOP_NAV.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all group ${
                isActive ? 'bg-green-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-white'}`} />
                <span className="flex-1">{item.label}</span>
                {isActive && <ChevronRight className="w-3 h-3 text-white/60" />}
              </>
            )}
          </NavLink>
        ))}

        {/* Permohonan — Application Context */}
        {can('billing') && (
          <>
            <Link
              to="/permohonan/baru"
              onClick={onClose}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all group ${
                location.pathname === '/permohonan/baru'
                  ? 'bg-green-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Plus className={`w-4 h-4 flex-shrink-0 ${location.pathname === '/permohonan/baru' ? 'text-white' : 'text-gray-500 group-hover:text-white'}`} />
              <span className="flex-1">Permohonan Baru</span>
            </Link>
            <SectionBtn
              icon={FileText}
              label="Permohonan"
              isActive={nav.permohonan.isActive}
              isOpen={isOpen('permohonan')}
              onClick={() => toggleSection('permohonan')}
            />
            {isOpen('permohonan') && (
              <div className="space-y-0.5 mb-1">
                {nav.permohonan.items.map(item => (
                  <SubItem key={item.key} to={item.to} label={item.label} isActive={item.isActive} onClose={onClose} />
                ))}
              </div>
            )}
          </>
        )}

        {/* Tindakan — Task Context (ADR-031: only render when tasks exist) */}
        {nav.tindakan.hasItems && (
          <>
            <SectionBtn
              icon={ListChecks}
              label="Tindakan"
              badge={nav.tindakan.totalCount}
              isActive={nav.tindakan.isActive}
              isOpen={isOpen('tindakan')}
              onClick={() => toggleSection('tindakan')}
            />
            {isOpen('tindakan') && (
              <div className="space-y-0.5 mb-1">
                {nav.tindakan.items.map(item => (
                  <SubItem key={item.key} to={item.to} label={item.label} isActive={item.isActive} onClose={onClose} />
                ))}
              </div>
            )}
          </>
        )}

        {/* Kewangan — finance data only, no approvals */}
        {isFinance && (
          <>
            <div className="pt-2 pb-1">
              <p className="text-[10px] font-semibold text-gray-600 uppercase tracking-widest px-3">Kewangan</p>
            </div>

            {FINANCE_NAV.map(item => (
              <NavLink key={item.to} to={item.to} onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all group ${
                    isActive ? 'bg-green-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-white'}`} />
                    <span className="flex-1">{item.label}</span>
                    {isActive && <ChevronRight className="w-3 h-3 text-white/60" />}
                  </>
                )}
              </NavLink>
            ))}

            <SectionBtn
              icon={BarChart3}
              label="Laporan"
              isActive={laporan.isOn}
              isOpen={isOpen('laporan')}
              onClick={() => toggleSection('laporan')}
            />
            {isOpen('laporan') && (
              <div className="space-y-0.5 mb-1">
                {LAPORAN_TABS.map(item => (
                  <SubItem key={item.val} to={laporan.make(item.val)} label={item.label} isActive={laporan.check(item.val)} onClose={onClose} />
                ))}
              </div>
            )}
          </>
        )}

        {/* Pentadbiran */}
        {isAdmin && (
          <>
            <div className="pt-3 pb-1">
              <p className="text-[10px] font-semibold text-gray-600 uppercase tracking-widest px-3">Pentadbiran</p>
            </div>
            <SectionBtn
              icon={Settings}
              label="Tetapan"
              isActive={tetapan.isOn}
              isOpen={isOpen('tetapan')}
              onClick={() => toggleSection('tetapan')}
            />
            {isOpen('tetapan') && (
              <div className="space-y-0.5">
                {TETAPAN_TABS.map(item => (
                  <SubItem key={item.val} to={tetapan.make(item.val)} label={item.label} isActive={tetapan.check(item.val)} onClose={onClose} />
                ))}
              </div>
            )}
          </>
        )}

      </nav>

      <div className="p-3 border-t border-gray-700/50">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-400 hover:bg-red-900/30 hover:text-red-400 transition-all"
        >
          <LogOut className="w-4 h-4" />
          Log Keluar
        </button>
      </div>
    </aside>
  )
}
