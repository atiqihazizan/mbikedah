import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Bell, User, LogOut, ChevronDown, Menu, Lock, Calendar } from 'lucide-react'
import { toast } from 'sonner'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/store/auth'
import api from '@/lib/api'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Button, Label, Spinner } from '@/components/ui'

const PAGE_TITLE = {
  '/dashboard':  'Dashboard',
  '/bajet':      'Pengurusan Bajet',
  '/permohonan': 'Permohonan Bayaran',
  '/pekeliling': 'Pekeliling',
  '/kalendar':   'Kalendar',
  '/laporan':    'Laporan',
  '/tetapan':    'Tetapan Sistem',
}

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

export default function Topbar({ onMenuClick }) {
  const navigate  = useNavigate()
  const location  = useLocation()
  const { user, logout } = useAuthStore()
  const qc = useQueryClient()
  const [userOpen,   setUserOpen]   = useState(false)
  const [notifOpen,  setNotifOpen]  = useState(false)
  const [showChgPwd, setShowChgPwd] = useState(false)

  const { data: notifData } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.get('/notifications').then((r) => r.data),
    refetchInterval: 60_000,
  })
  const notifications = notifData?.notifications ?? []
  const unreadCount   = notifData?.unreadCount ?? 0

  async function markAllRead() {
    await api.patch('/notifications/read-all')
    qc.invalidateQueries({ queryKey: ['notifications'] })
  }

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
    <>
      <header className="sticky top-0 z-40 h-14 border-b border-gray-200 bg-white flex items-center justify-between px-4 sm:px-6 shrink-0">
        <div className="flex items-center gap-3">
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
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            {notifOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setNotifOpen(false)} />
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 z-20 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                    <p className="font-semibold text-gray-900 text-sm">Notifikasi</p>
                    {unreadCount > 0 && (
                      <button onClick={markAllRead} className="text-xs text-green-600 hover:underline">
                        Tandakan semua dibaca
                      </button>
                    )}
                  </div>
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-sm text-gray-400">Tiada notifikasi</div>
                  ) : (
                    <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                      {notifications.map((n) => (
                        <button key={n.id} onClick={() => { navigate(n.link ?? '/kalendar'); setNotifOpen(false) }}
                          className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex items-start gap-3 ${!n.isRead ? 'bg-green-50/50' : ''}`}>
                          <div className={`mt-0.5 w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${!n.isRead ? 'bg-green-100' : 'bg-gray-100'}`}>
                            <Calendar className={`w-3.5 h-3.5 ${!n.isRead ? 'text-green-600' : 'text-gray-400'}`} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className={`text-xs font-medium truncate ${!n.isRead ? 'text-gray-900' : 'text-gray-600'}`}>{n.title}</p>
                            {n.body && <p className="text-[11px] text-gray-400 mt-0.5 line-clamp-2">{n.body}</p>}
                            <p className="text-[10px] text-gray-300 mt-0.5">
                              {new Date(n.createdAt).toLocaleDateString('ms-MY', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                          {!n.isRead && <div className="w-2 h-2 bg-green-500 rounded-full shrink-0 mt-1.5" />}
                        </button>
                      ))}
                    </div>
                  )}
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
                <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-2xl border border-gray-100 py-1 z-20 overflow-hidden">
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
      </header>

      <ChangePasswordDialog open={showChgPwd} onClose={() => setShowChgPwd(false)} />
    </>
  )
}
