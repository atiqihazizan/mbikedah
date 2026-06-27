import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Bell, IdCard, Lock, ArrowLeft } from 'lucide-react'
import api from '@/lib/api'
import { useAuthStore } from '@/store/auth'
import { Spinner } from '@/components/ui'
import { ORG_NAME, APP_NAME, APP_TAGLINE } from '@/lib/constants'

export default function Login() {
  const navigate  = useNavigate()
  const setAuth   = useAuthStore((s) => s.setAuth)
  const pwdRef    = useRef(null)

  const [step,      setStep]      = useState(1)          // 1 = staffNo, 2 = password
  const [staffNo,   setStaffNo]   = useState('')
  const [password,  setPassword]  = useState('')
  const [loading,   setLoading]   = useState(false)
  const [errors,    setErrors]    = useState({})
  const [pekeliling, setPekeliling] = useState([])

  useEffect(() => {
    api.get('/circular/public?limit=10')
      .then((r) => setPekeliling(r.data.data ?? []))
      .catch(() => {})
  }, [])

  // Fokus ke field password bila step 2 muncul
  useEffect(() => {
    if (step === 2) pwdRef.current?.focus()
  }, [step])

  // Step 1 — check staffNo
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
        // Bukan admin — terus login
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

  // Step 2 — verify password (admin)
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

      {/* Left panel — form */}
      <div className="lg:w-[480px] xl:w-[520px] shrink-0 flex items-center justify-center p-4 sm:p-8 bg-gray-50">
        <div className="w-full max-w-[420px]">

          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <img src="/logo.png" alt="MBI Logo" className="h-10 w-auto object-contain" />
            <div>
              <p className="font-semibold text-gray-900 text-sm">{APP_NAME}</p>
              <p className="text-gray-400 text-xs">{APP_TAGLINE}</p>
            </div>
          </div>

          {/* Step 1 — No. Staf */}
          {step === 1 && (
            <>
              <div className="mb-7">
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

          {/* Step 2 — Password (admin sahaja) */}
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

          <p className="text-center text-xs text-gray-400 mt-6">
            {ORG_NAME} &copy; {new Date().getFullYear()}
          </p>
        </div>
      </div>

      {/* Right panel — pekeliling */}
      <div className="hidden lg:flex flex-1 flex-col p-10 bg-gray-900 overflow-y-auto">
        <div className="flex items-center gap-2 mb-6">
          <Bell className="w-4 h-4 text-green-500" />
          <p className="text-green-400 text-xs font-semibold uppercase tracking-widest">Pekeliling Terkini</p>
        </div>

        {pekeliling.length === 0 ? (
          <p className="text-gray-600 text-sm">Tiada pekeliling semasa.</p>
        ) : (
          <div className="space-y-2">
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

        <p className="text-gray-600 text-xs mt-auto pt-8">
          &copy; {new Date().getFullYear()} {ORG_NAME}
        </p>
      </div>
    </div>
  )
}
