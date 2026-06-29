import { useState, useEffect, useRef } from 'react'
import { Navigate, Outlet, NavLink, useNavigate } from 'react-router-dom'
import { Bell, ChevronDown, LogOut, User, Menu, X, Lock } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/store/auth'
import api from '@/lib/api'
import { APP_NAME, APP_TAGLINE } from '@/lib/constants'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Button, Label, Spinner } from '@/components/ui'

const BASE_NAV = [
  { to: '/dashboard',  label: 'Utama'                         },
  { to: '/permohonan', label: 'Permohonan'                    },
  { to: '/pekeliling', label: 'Pekeliling'                    },
  { to: '/kalendar',   label: 'Kalendar'                      },
  { to: '/bajet',      label: 'Bajet',      financeOnly: true },
  { to: '/laporan',    label: 'Laporan',    financeOnly: true },
]

function ChangePasswordDialog({ open, onClose }) {
  const pwdRef = useRef(null)
  const [form, setForm]     = useState({ current: '', next: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (open) { setForm({ current: '', next: '', confirm: '' }); setErrors({}) }
    if (open) setTimeout(() => pwdRef.current?.focus(), 50)
  }, [open])

  async function handleSubmit(e) {
    e.preventDefault()
    const e2 = {}
    if (!form.current) e2.current = 'Diperlukan'
    if (!form.next || form.next.length < 6) e2.next = 'Sekurang-kurangnya 6 aksara'
    if (form.next !== form.confirm) e2.confirm = 'Tidak sepadan'
    if (Object.keys(e2).length) { setErrors(e2); return }
    setLoading(true)
    try {
      await api.post('/auth/change-password', { currentPassword: form.current, newPassword: form.next })
      toast.success('Kata laluan berjaya dikemaskini')
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Gagal kemaskini kata laluan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogContent className="max-w-sm w-full">
        <DialogHeader>
          <DialogTitle>Tukar Kata Laluan</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-1">
          {[
            { id: 'current', label: 'Kata Laluan Semasa', ref: pwdRef },
            { id: 'next',    label: 'Kata Laluan Baharu' },
            { id: 'confirm', label: 'Sahkan Kata Laluan Baharu' },
          ].map(({ id, label, ref }) => (
            <div key={id}>
              <Label>{label}</Label>
              <input
                ref={ref}
                type="password"
                value={form[id]}
                onChange={(e) => { setForm((f) => ({ ...f, [id]: e.target.value })); setErrors((er) => ({ ...er, [id]: undefined })) }}
                className={`block w-full rounded-lg border px-3 py-2.5 text-sm transition-colors
                  focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500
                  ${errors[id] ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'}`}
              />
              {errors[id] && <p className="text-xs text-red-500 mt-1">{errors[id]}</p>}
            </div>
          ))}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Batal</Button>
            <Button type="submit" disabled={loading}>
              {loading && <Spinner size={14} />} Simpan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function HomeTopbar() {
  const navigate = useNavigate()
  const { user, logout, hasRole } = useAuthStore()
  const isFinance = hasRole('finance_hod', 'finance', 'admin')
  const navItems = BASE_NAV
    .filter((item) => !item.financeOnly || isFinance)
    .concat(hasRole('admin') ? [{ to: '/tetapan', label: 'Tetapan' }] : [])
  const [userOpen,   setUserOpen]   = useState(false)
  const [notifOpen,  setNotifOpen]  = useState(false)
  const [showChgPwd, setShowChgPwd] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const initials = user?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() ?? '?'

  async function handleLogout() {
    try { await api.post('/auth/logout') } catch {}
    logout()
    navigate('/login')
  }

  // Tutup mobile menu bila navigate
  function handleNavClick() { setMobileOpen(false) }

  return (
    <header className="sticky top-0 z-40 bg-gray-900 border-b border-gray-700/50 shrink-0">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 h-14 flex items-center gap-3 sm:gap-6">

        {/* Hamburger — mobile only */}
        <button
          onClick={() => setMobileOpen((o) => !o)}
          className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors shrink-0"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Logo */}
        <div className="flex items-center gap-2.5 shrink-0">
          <img src="/logo.png" alt="MBI Logo" className="h-8 w-auto object-contain" />
          {/* <div className="hidden sm:block">
            <p className="text-white font-bold text-sm leading-none">{APP_NAME}</p>
            <p className="text-gray-500 text-[10px] mt-0.5">{APP_TAGLINE}</p>
          </div> */}
        </div>

        {/* Nav — desktop */}
        <nav className="hidden md:flex items-center gap-0.5 flex-1">
          {navItems.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/dashboard'}
              className={({ isActive }) =>
                `px-3.5 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  isActive ? 'bg-green-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Spacer mobile */}
        <div className="flex-1 md:hidden" />

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Bell */}
          <div className="relative">
            <button
              onClick={() => { setNotifOpen((o) => !o); setUserOpen(false) }}
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
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
              className="flex items-center gap-2 pl-2 pr-2 sm:pr-3 py-1.5 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-green-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                {initials}
              </div>
              <span className="text-sm text-gray-300 hidden sm:block max-w-[100px] truncate">
                {user?.name?.split(' ')[0]}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-500 hidden sm:block" />
            </button>

            {userOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setUserOpen(false)} />
                <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-2xl border border-gray-100 py-1 z-20">
                  <div className="px-4 py-2.5 border-b border-gray-100">
                    <p className="text-xs font-semibold text-gray-900 truncate">{user?.name}</p>
                    <p className="text-[11px] text-gray-400 truncate mt-0.5">{user?.role?.name}</p>
                  </div>
                  <div className="py-1">
                    <button className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 w-full text-left transition-colors">
                      <User className="w-4 h-4 text-gray-400" />
                      Profil Saya
                    </button>
                    <button
                      onClick={() => { setUserOpen(false); setShowChgPwd(true) }}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 w-full text-left transition-colors"
                    >
                      <Lock className="w-4 h-4 text-gray-400" />
                      Tukar Kata Laluan
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
      </div>

      {/* Mobile nav dropdown */}
      {mobileOpen && (
        <>
          <div className="fixed inset-0 z-30 bg-black/40 md:hidden" onClick={() => setMobileOpen(false)} />
          <nav className="md:hidden absolute top-14 left-0 right-0 z-40 bg-gray-900 border-b border-gray-700/50 py-2 px-3 space-y-0.5">
            {navItems.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/dashboard'}
                onClick={handleNavClick}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive ? 'bg-green-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </>
      )}

      <ChangePasswordDialog open={showChgPwd} onClose={() => setShowChgPwd(false)} />
    </header>
  )
}

export default function HomeLayout() {
  const user = useAuthStore((s) => s.user)
  const [ready, setReady] = useState(false)

  useEffect(() => { setReady(true) }, [])

  if (!ready) return null
  if (!user) return <Navigate to="/login" replace />

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <HomeTopbar />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
