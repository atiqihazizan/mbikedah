import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Bell, User, LogOut, ChevronDown, Menu } from 'lucide-react'
import { useAuthStore } from '@/store/auth'
import api from '@/lib/api'

const PAGE_TITLE = {
  '/dashboard':  'Dashboard',
  '/bajet':      'Pengurusan Bajet',
  '/permohonan': 'Permohonan Bayaran',
  '/pekeliling': 'Pekeliling',
  '/kalendar':   'Kalendar',
  '/laporan':    'Laporan',
  '/tetapan':    'Tetapan Sistem',
}

export default function Topbar({ onMenuClick }) {
  const navigate  = useNavigate()
  const location  = useLocation()
  const { user, logout } = useAuthStore()
  const [userOpen,  setUserOpen]  = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)

  const title = Object.entries(PAGE_TITLE).find(([path]) =>
    location.pathname.startsWith(path)
  )?.[1] ?? 'MBIClicks'

  const initials = user?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() ?? '?'

  async function handleLogout() {
    try { await api.post('/auth/logout') } catch {}
    logout()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-40 h-14 border-b border-gray-200 bg-white flex items-center justify-between px-4 sm:px-6 shrink-0">
      <div className="flex items-center gap-3">
        {/* Hamburger — mobile only */}
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 -ml-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-[15px] font-semibold text-gray-900">{title}</h1>
      </div>

      <div className="flex items-center gap-1">
        {/* Bell */}
        <div className="relative">
          <button
            onClick={() => { setNotifOpen((o) => !o); setUserOpen(false) }}
            className="relative p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <Bell className="w-4 h-4" />
          </button>
          {notifOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setNotifOpen(false)} />
              <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-100 z-20 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="font-semibold text-gray-900 text-sm">Notifikasi</p>
                </div>
                <div className="py-8 text-center text-sm text-gray-400">Tiada notifikasi</div>
              </div>
            </>
          )}
        </div>

        {/* User */}
        <div className="relative">
          <button
            onClick={() => { setUserOpen((o) => !o); setNotifOpen(false) }}
            className="flex items-center gap-2 pl-2 pr-2 sm:pr-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-green-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {initials}
            </div>
            <span className="text-sm text-gray-700 hidden sm:block max-w-[100px] truncate">
              {user?.name?.split(' ')[0]}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 hidden sm:block" />
          </button>

          {userOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setUserOpen(false)} />
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-2xl border border-gray-100 py-1 z-20 overflow-hidden">
                <div className="px-4 py-2.5 border-b border-gray-100">
                  <p className="text-xs font-semibold text-gray-900 truncate">{user?.name}</p>
                  <p className="text-[11px] text-gray-400 truncate mt-0.5">{user?.role?.name}</p>
                </div>
                <div className="py-1">
                  <button className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 w-full text-left transition-colors">
                    <User className="w-4 h-4 text-gray-400" />
                    Profil Saya
                  </button>
                  <hr className="border-gray-100 mx-2" />
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 w-full text-left transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Log Keluar
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
