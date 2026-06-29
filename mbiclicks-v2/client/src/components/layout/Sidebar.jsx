import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, FileText, Bell,
  Calendar, BarChart3, Settings, ChevronRight, LogOut, BookOpen, PiggyBank, Landmark,
} from 'lucide-react'
import { useAuthStore } from '@/store/auth'
import api from '@/lib/api'
import { APP_NAME, APP_TAGLINE } from '@/lib/constants'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard',  module: 'dashboard' },
  { to: '/permohonan',icon: FileText,         label: 'Permohonan', module: 'billing'   },
  { to: '/pekeliling',icon: Bell,             label: 'Pekeliling', module: 'circular'  },
  { to: '/kalendar',  icon: Calendar,         label: 'Kalendar',   module: 'event'     },
]

// Kewangan — semua role boleh lihat Bajet
const kewanganItems = [
  { to: '/bajet', icon: PiggyBank, label: 'Bajet' },
]

// Finance & admin sahaja
const financeOnlyItems = [
  { to: '/laporan',    icon: BarChart3, label: 'Laporan'    },
  { to: '/akaun',      icon: BookOpen,  label: 'Kod Akaun'  },
  { to: '/akaun-bank', icon: Landmark,  label: 'Akaun Bank' },
]

export default function Sidebar({ open, onClose }) {
  const can      = useAuthStore((s) => s.can)
  const user     = useAuthStore((s) => s.user)
  const hasRole  = useAuthStore((s) => s.hasRole)
  const logout   = useAuthStore((s) => s.logout)
  const navigate = useNavigate()
  const isAdmin   = hasRole('admin')
  const isFinance = hasRole('finance_hod', 'finance', 'admin')

  const visible = navItems.filter(
    (item) => !item.module || item.module === 'dashboard' || can(item.module)
  )

  async function handleLogout() {
    try { await api.post('/auth/logout') } catch {}
    logout()
    navigate('/login')
  }

  return (
    <aside
      className={`
        fixed md:static inset-y-0 left-0 z-30
        w-[240px] shrink-0 flex flex-col h-full bg-gray-900
        transition-transform duration-200 ease-in-out
        ${open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-700/50">
        <img src="/logo.png" alt="MBI Logo" className="h-8 w-auto object-contain shrink-0" />
        {/* <div>
          <p className="text-white font-semibold text-sm leading-none">{APP_NAME}</p>
          <p className="text-gray-500 text-xs mt-0.5">{APP_TAGLINE}</p>
        </div> */}
      </div>

      {/* User info */}
      {user && (
        <div className="px-4 py-3 border-b border-gray-700/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center shrink-0">
              <span className="text-white text-sm font-medium">
                {user.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-medium truncate leading-none">{user.name}</p>
              <p className="text-gray-400 text-xs mt-0.5 truncate">{user.role?.name}</p>
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
        {visible.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all group ${
                isActive
                  ? 'bg-green-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon
                  className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-white'}`}
                />
                <span className="flex-1">{item.label}</span>
                {isActive && <ChevronRight className="w-3 h-3 text-white/60" />}
              </>
            )}
          </NavLink>
        ))}

        {/* Kewangan — semua role nampak Bajet; finance/admin nampak Laporan & Kod Akaun */}
        <>
          <div className="pt-3 pb-1">
            <p className="text-[10px] font-semibold text-gray-600 uppercase tracking-widest px-3">Kewangan</p>
          </div>
          {[...kewanganItems, ...(isFinance ? financeOnlyItems : [])].map((item) => (
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
        </>

        {isAdmin && (
          <>
            <div className="pt-3 pb-1">
              <p className="text-[10px] font-semibold text-gray-600 uppercase tracking-widest px-3">
                Admin
              </p>
            </div>
            <NavLink
              to="/tetapan"
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all group ${
                  isActive
                    ? 'bg-green-600 text-white'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Settings className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-white'}`} />
                  <span className="flex-1">Tetapan</span>
                  {isActive && <ChevronRight className="w-3 h-3 text-white/60" />}
                </>
              )}
            </NavLink>
          </>
        )}
      </nav>

      {/* Logout */}
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
