import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Bell, IdCard, Lock, ArrowLeft, CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'
import api from '@/lib/api'
import { useAuthStore } from '@/store/auth'
import { Spinner } from '@/components/ui'
import { ORG_NAME } from '@/lib/constants'

const DAYS_MY   = ['Ahd', 'Isn', 'Sel', 'Rab', 'Kha', 'Jum', 'Sab']
const MONTHS_MY = ['Januari','Februari','Mac','April','Mei','Jun','Julai','Ogos','September','Oktober','November','Disember']

const COLOR_DOT = {
  blue:   'bg-blue-400',
  green:  'bg-green-400',
  red:    'bg-red-400',
  orange: 'bg-orange-400',
  purple: 'bg-purple-400',
  pink:   'bg-pink-400',
}

// ─── Mini kalendar read-only ──────────────────────────────────────────────────
function MiniCalendar() {
  const today = new Date()
  const [vd, setVd]       = useState({ year: today.getFullYear(), month: today.getMonth() + 1 })
  const [events, setEvents] = useState([])

  useEffect(() => {
    api.get(`/events/public?year=${vd.year}&month=${vd.month}`)
      .then((r) => setEvents(r.data.data ?? []))
      .catch(() => {})
  }, [vd.year, vd.month])

  const firstDay    = new Date(vd.year, vd.month - 1, 1).getDay()
  const daysInMonth = new Date(vd.year, vd.month, 0).getDate()
  const cells       = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)]

  const evByDay = {}
  events.forEach((ev) => {
    const d = new Date(ev.startAt)
    if (d.getFullYear() === vd.year && d.getMonth() + 1 === vd.month) {
      const day = d.getDate()
      if (!evByDay[day]) evByDay[day] = []
      evByDay[day].push(ev)
    }
  })

  const isToday = (day) =>
    day === today.getDate() && vd.month === today.getMonth() + 1 && vd.year === today.getFullYear()

  function prevMonth() {
    setVd(({ year, month }) => month === 1 ? { year: year - 1, month: 12 } : { year, month: month - 1 })
  }
  function nextMonth() {
    setVd(({ year, month }) => month === 12 ? { year: year + 1, month: 1 } : { year, month: month + 1 })
  }

  return (
    <div>
      {/* Nav bulan */}
      <div className="flex items-center justify-between mb-3">
        <button onClick={prevMonth} className="p-1 text-gray-600 hover:text-gray-300 transition-colors">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-sm font-medium text-gray-300">{MONTHS_MY[vd.month - 1]} {vd.year}</span>
        <button onClick={nextMonth} className="p-1 text-gray-600 hover:text-gray-300 transition-colors">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Header hari */}
      <div className="grid grid-cols-7 mb-2">
        {DAYS_MY.map((d) => (
          <div key={d} className="text-center text-sm text-gray-500 font-semibold pb-2">{d}</div>
        ))}
      </div>

      {/* Grid hari */}
      <div className="grid grid-cols-7">
        {cells.map((day, idx) => !day ? (
          <div key={`e-${idx}`} className="h-14" />
        ) : (
          <div key={day} className="h-14 flex flex-col items-center pt-1">
            <span className={`text-base w-10 h-10 flex items-center justify-center rounded-full leading-none font-medium ${
              isToday(day) ? 'bg-green-600 text-white font-semibold' : 'text-gray-400'
            }`}>{day}</span>
            {evByDay[day] && (
              <div className="flex gap-0.5 mt-0.5">
                {evByDay[day].slice(0, 3).map((ev, i) => (
                  <div key={i} className={`w-1 h-1 rounded-full ${COLOR_DOT[ev.color] ?? 'bg-blue-400'}`} />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Legend acara bulan ini */}
      {events.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-800 space-y-2">
          {events.slice(0, 4).map((ev) => (
            <div key={ev.id} className="flex items-start gap-2">
              <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${COLOR_DOT[ev.color] ?? 'bg-blue-400'}`} />
              <div className="min-w-0">
                <p className="text-xs text-gray-300 leading-snug line-clamp-1">{ev.title}</p>
                <p className="text-[10px] text-gray-600 mt-0.5">
                  {new Date(ev.startAt).toLocaleDateString('ms-MY', { day: 'numeric', month: 'short' })}
                  {!ev.isAllDay && ' · ' + new Date(ev.startAt).toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit', hour12: false })}
                </p>
              </div>
            </div>
          ))}
          {events.length > 4 && (
            <p className="text-[10px] text-gray-600">+{events.length - 4} acara lagi</p>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Halaman Login ────────────────────────────────────────────────────────────
export default function Login() {
  const navigate  = useNavigate()
  const setAuth   = useAuthStore((s) => s.setAuth)
  const pwdRef    = useRef(null)

  const [step,     setStep]     = useState(1)
  const [staffNo,  setStaffNo]  = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [errors,   setErrors]   = useState({})
  const [pekeliling, setPekeliling] = useState([])

  useEffect(() => {
    api.get('/circular/public?limit=8')
      .then((r) => setPekeliling(r.data.data ?? []))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (step === 2) pwdRef.current?.focus()
  }, [step])

  async function handleCheckStaff(e) {
    e.preventDefault()
    const sn = staffNo.trim().toUpperCase()
    if (!sn) { setErrors({ staffNo: 'No. staf diperlukan' }); return }
    setErrors({})
    setLoading(true)
    try {
      const res = await api.post('/auth/check-staff', { staffNo: sn })
      if (res.data.requirePassword) {
        setStep(2)
      } else {
        const login = await api.post('/auth/login', { staffNo: sn })
        setAuth(login.data.user, login.data.accessToken, login.data.refreshToken)
        navigate('/dashboard')
      }
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Ralat. Cuba semula.')
    } finally {
      setLoading(false)
    }
  }

  async function handleLogin(e) {
    e.preventDefault()
    if (!password) { setErrors({ password: 'Kata laluan diperlukan' }); return }
    setErrors({})
    setLoading(true)
    try {
      const res = await api.post('/auth/login', {
        staffNo: staffNo.trim().toUpperCase(),
        password,
      })
      setAuth(res.data.user, res.data.accessToken, res.data.refreshToken)
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Kata laluan tidak betul')
      setPassword('')
    } finally {
      setLoading(false)
    }
  }

  function handleBack() {
    setStep(1)
    setPassword('')
    setErrors({})
  }

  return (
    <div className="h-screen flex bg-gray-50 overflow-hidden">

      {/* Left panel — logo atas, form tengah */}
      <div className="lg:w-[440px] xl:w-[480px] shrink-0 flex flex-col bg-gray-50">

        {/* Logo — atas, tengah, besar */}
        <div className="flex justify-center pt-10 pb-4">
          <img src="/logo.png" alt="MBI Logo" className="h-20 w-auto object-contain" />
        </div>

        {/* Form — tengah */}
        <div className="flex-1 flex items-center justify-center px-6 sm:px-10">
          <div className="w-full max-w-[360px]">

            {step === 1 && (
              <>
                <div className="mb-7 text-center">
                  <h1 className="text-2xl font-bold text-gray-900">Log Masuk</h1>
                  <p className="text-gray-500 text-sm mt-1">Masukkan no. staf anda untuk log masuk</p>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                  <form onSubmit={handleCheckStaff} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">No. Staf</label>
                      <div className="relative">
                        <IdCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="text"
                          placeholder="Contoh: 0032 atau C0021"
                          value={staffNo}
                          onChange={(e) => { setStaffNo(e.target.value); setErrors({}) }}
                          autoFocus
                          className={`block w-full rounded-lg border pl-9 pr-3 py-2.5 text-sm text-gray-900
                            placeholder:text-gray-400 transition-colors uppercase tracking-widest
                            focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500
                            ${errors.staffNo ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'}`}
                        />
                      </div>
                      {errors.staffNo && <p className="text-xs text-red-600 mt-1">{errors.staffNo}</p>}
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2.5
                        text-sm font-medium text-white shadow-sm transition-colors hover:bg-green-700
                        focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
                        disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading && <Spinner size={15} />}
                      Seterusnya
                    </button>
                  </form>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div className="mb-7">
                  <button
                    onClick={handleBack}
                    className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 mb-4 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" /> Kembali
                  </button>
                  <h1 className="text-2xl font-bold text-gray-900">Kata Laluan Admin</h1>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center gap-1.5 bg-gray-100 rounded-full px-3 py-1">
                      <IdCard className="w-3.5 h-3.5 text-gray-500" />
                      <span className="text-xs font-mono font-medium text-gray-700 tracking-widest">
                        {staffNo.trim().toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Kata Laluan</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          ref={pwdRef}
                          type="password"
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => { setPassword(e.target.value); setErrors({}) }}
                          className={`block w-full rounded-lg border pl-9 pr-3 py-2.5 text-sm text-gray-900
                            placeholder:text-gray-400 transition-colors
                            focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500
                            ${errors.password ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'}`}
                        />
                      </div>
                      {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password}</p>}
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2.5
                        text-sm font-medium text-white shadow-sm transition-colors hover:bg-green-700
                        focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
                        disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading && <Spinner size={15} />}
                      Log Masuk
                    </button>
                  </form>
                </div>
              </>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 py-4">
          {ORG_NAME} &copy; {new Date().getFullYear()}
        </p>
      </div>

      {/* Right panel — pekeliling + kalendar mini, grid 2 col pada xl, stack pada lg */}
      <div className="hidden lg:grid lg:grid-cols-1 xl:grid-cols-2 flex-1 bg-gray-900 overflow-hidden">

        {/* Bahagian Pekeliling */}
        <div className="flex flex-col p-8 overflow-y-auto border-b border-gray-800 xl:border-b-0 xl:border-r xl:border-gray-800">
          <div className="flex items-center gap-2 mb-5">
            <Bell className="w-4 h-4 text-green-500" />
            <p className="text-green-400 text-xs font-semibold uppercase tracking-widest">Pekeliling Terkini</p>
          </div>

          {pekeliling.length === 0 ? (
            <p className="text-gray-600 text-sm">Tiada pekeliling semasa.</p>
          ) : (
            <div>
              {pekeliling.map((p, i) => (
                <div key={p.id} className="flex gap-3 items-start py-2.5 border-b border-gray-800 last:border-0">
                  <span className="text-gray-600 text-xs font-mono mt-0.5 shrink-0 w-5 text-right">{i + 1}.</span>
                  <div className="min-w-0">
                    <p className="text-gray-200 text-sm leading-snug line-clamp-2">{p.title}</p>
                    <p className="text-gray-500 text-xs mt-1">
                      {new Date(p.issuedAt).toLocaleDateString('ms-MY', { day: 'numeric', month: 'short', year: 'numeric' })}
                      {p.department?.name && ` · ${p.department.name}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <p className="text-gray-700 text-xs mt-auto pt-6">
            &copy; {new Date().getFullYear()} {ORG_NAME}
          </p>
        </div>

        {/* Bahagian Kalendar Mini */}
        <div className="flex flex-col p-8 overflow-y-auto">
          <div className="flex items-center gap-2 mb-5">
            <CalendarDays className="w-4 h-4 text-blue-400" />
            <p className="text-blue-400 text-xs font-semibold uppercase tracking-widest">Kalendar Acara</p>
          </div>

          <MiniCalendar />
        </div>

      </div>
    </div>
  )
}
