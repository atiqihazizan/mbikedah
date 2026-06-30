import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, FileText, Bell,
  Calendar, BarChart3, Settings, ChevronRight, LogOut, BookOpen, PiggyBank, Landmark,
  ClipboardCheck,
} from 'lucide-react'
import { useAuthStore } from '@/store/auth'
import api from '@/lib/api'
import { APP_NAME, APP_TAGLINE } from '@/lib/constants'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard',  module: 'dashboard' },
  { to: '/pekeliling',icon: Bell,             label: 'Pekeliling', module: 'circular'  },
  { to: '/kalendar',  icon: Calendar,         label: 'Kalendar',   module: 'event'     },
]

const financeOnlyItems = [
  { to: '/bajet',      icon: PiggyBank, label: 'Bajet'      },
  { to: '/laporan',    icon: BarChart3, label: 'Laporan'    },
  { to: '/akaun',      icon: BookOpen,  label: 'Kod Akaun'  },
  { to: '/akaun-bank', icon: Landmark,  label: 'Akaun Bank' },
]

// Sub-menu Permohonan ikut role
function buildPermohonanSubs({ isHod, isCeo, isFinance }) {
  const items = [
    { status: '',         label: 'Semua'          },
    { status: 'DRAFT',    label: 'Draf'           },
  ]
  if (isHod)
    items.push({ status: 'PENDING_HOD', label: 'Ketua Jabatan' })
  if (isCeo)
    items.push({ status: 'PENDING_CEO', label: 'Ketua Eksekutif' })

  // Finance hanya nampak status personal (bukan workflow kelulusan — ada section lain)
  if (!isFinance) {
    items.push({ status: 'APPROVED',  label: 'Diluluskan'    })
    items.push({ status: 'PAID',      label: 'Selesai Dibayar' })
    items.push({ status: 'CLOSED',    label: 'Ditutup'       })
  }
  items.push({ status: 'REJECTED', label: 'Ditolak' })
  return items
}

// Sub-menu Kelulusan untuk finance
function buildKelulusanSubs({ isFinanceHod }) {
  const items = [
    { status: 'PENDING_FINANCE_CHECK',    label: 'Semakan'            },
    { status: 'PENDING_FINANCE_VERIFY',   label: 'Pengesahan'         },
    { status: 'PENDING_FINANCE_APPROVAL', label: 'Kelulusan'          },
  ]
  if (isFinanceHod)
    items.push({ status: 'PENDING_CEO_FINAL', label: 'Kelulusan Muktamad' })

  items.push(
    { status: 'APPROVED',     label: 'Diluluskan'      },
    { status: 'PARTIAL_PAID', label: 'Bayaran Ansuran' },
    { status: 'PAID',         label: 'Selesai Dibayar' },
  )
  return items
}

function SubMenuItem({ status, label, currentStatus, isOnPermohonan, onClose }) {
  const isActive = isOnPermohonan && currentStatus === status
  const to = status ? `/permohonan?status=${status}` : '/permohonan'

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

export default function Sidebar({ open, onClose }) {
  const can      = useAuthStore((s) => s.can)
  const user     = useAuthStore((s) => s.user)
  const hasRole  = useAuthStore((s) => s.hasRole)
  const logout   = useAuthStore((s) => s.logout)
  const navigate = useNavigate()
  const location = useLocation()

  const isAdmin      = hasRole('admin')
  const isFinance    = hasRole('finance_hod', 'finance', 'admin')
  const isFinanceHod = hasRole('finance_hod', 'admin')
  const isHod        = hasRole('hod', 'finance_hod', 'admin')
  const isCeo        = hasRole('ceo', 'admin')

  const isOnPermohonan = location.pathname === '/permohonan'
  const currentStatus  = isOnPermohonan
    ? (new URLSearchParams(location.search).get('status') ?? '')
    : null

  const permohonanSubs = buildPermohonanSubs({ isHod, isCeo, isFinance })
  const kelulusanSubs  = buildKelulusanSubs({ isFinanceHod })

  const visible = navItems.filter(
    (item) => !item.module || item.module === 'dashboard' || can(item.module)
  )

  async function handleLogout() {
    try { await api.post('/auth/logout') } catch {}
    logout()
    navigate('/login')
  }

  const subItemProps = { currentStatus, isOnPermohonan, onClose }

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

        {/* Menu utama */}
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
                <item.icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-white'}`} />
                <span className="flex-1">{item.label}</span>
                {isActive && <ChevronRight className="w-3 h-3 text-white/60" />}
              </>
            )}
          </NavLink>
        ))}

        {/* Permohonan + sub-menu */}
        {can('billing') && (
          <>
            <div
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all group cursor-default ${
                isOnPermohonan
                  ? 'text-white'
                  : 'text-gray-400'
              }`}
            >
              <FileText className={`w-4 h-4 flex-shrink-0 ${isOnPermohonan ? 'text-green-400' : 'text-gray-500'}`} />
              <span className="flex-1 font-medium">Permohonan</span>
            </div>
            <div className="space-y-0.5 mb-1">
              {permohonanSubs.map((item) => (
                <SubMenuItem key={item.status} {...item} {...subItemProps} />
              ))}
            </div>
          </>
        )}

        {/* Kelulusan — finance & admin sahaja */}
        {isFinance && (
          <>
            <div className="pt-2 pb-1">
              <p className="text-[10px] font-semibold text-gray-600 uppercase tracking-widest px-3">Kewangan</p>
            </div>

            <div
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all cursor-default ${
                isOnPermohonan ? 'text-white' : 'text-gray-400'
              }`}
            >
              <ClipboardCheck className={`w-4 h-4 flex-shrink-0 ${isOnPermohonan ? 'text-blue-400' : 'text-gray-500'}`} />
              <span className="flex-1 font-medium">Kelulusan</span>
            </div>
            <div className="space-y-0.5 mb-1">
              {kelulusanSubs.map((item) => (
                <SubMenuItem key={`k-${item.status}`} {...item} {...subItemProps} />
              ))}
            </div>

            <div className="pt-1 pb-1">
              <p className="text-[10px] font-semibold text-gray-600 uppercase tracking-widest px-3">Laporan</p>
            </div>
            {financeOnlyItems.map((item) => (
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
        )}

        {/* Admin */}
        {isAdmin && (
          <>
            <div className="pt-3 pb-1">
              <p className="text-[10px] font-semibold text-gray-600 uppercase tracking-widest px-3">Admin</p>
            </div>
            <NavLink
              to="/tetapan"
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all group ${
                  isActive ? 'bg-green-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
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
