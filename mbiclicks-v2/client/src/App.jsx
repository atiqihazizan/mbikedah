import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { useAuthStore } from '@/store/auth'
import HomeLayout from '@/components/layout/HomeLayout'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Login from '@/pages/Login'
import Dashboard from '@/pages/Dashboard'
import Bajet from '@/pages/Bajet'
import BajetDetail from '@/pages/BajetDetail'
import Laporan from '@/pages/Laporan'
import Pekeliling from '@/pages/Pekeliling'
import Tetapan from '@/pages/Tetapan'
import Akaun from '@/pages/Akaun'
import AkaunBank from '@/pages/AkaunBank'
import Kalendar from '@/pages/Kalendar'
import LaporanLayout from '@/pages/LaporanLayout'
import Permohonan from '@/pages/Permohonan'
import PermohonanSejarah from '@/pages/PermohonanSejarah'
import PermohonanDetail from '@/pages/PermohonanDetail'
import PermohonanHod from '@/pages/PermohonanHod'
import PermohonanCeo from '@/pages/PermohonanCeo'
import FinanceSemakan from '@/pages/FinanceSemakan'
import FinancePengesahan from '@/pages/FinancePengesahan'
import FinanceKelulusan from '@/pages/FinanceKelulusan'

const qc = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
})

// Admin redirect dari /dashboard ke /tetapan
function DashboardGuard() {
  const user = useAuthStore((s) => s.user)
  if (!user) return <Navigate to="/login" replace />
  if (user.role?.slug === 'admin') return <Navigate to="/tetapan" replace />
  return <Dashboard />
}

// Finance, finance_hod, admin sahaja — lain redirect ke /dashboard
function FinanceGuard() {
  const user = useAuthStore((s) => s.user)
  if (!user) return <Navigate to="/login" replace />
  const slug = user.role?.slug
  if (!['finance', 'finance_hod', 'admin'].includes(slug)) return <Navigate to="/dashboard" replace />
  return <DashboardLayout />
}

// Admin sahaja — lain redirect ke /dashboard
function AdminGuard() {
  const user = useAuthStore((s) => s.user)
  if (!user) return <Navigate to="/login" replace />
  if (user.role?.slug !== 'admin') return <Navigate to="/dashboard" replace />
  return <DashboardLayout />
}

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* HomeLayout — topbar sahaja, tiada sidebar */}
          <Route element={<HomeLayout />}>
            <Route path="/dashboard" element={<DashboardGuard />} />
          </Route>

          {/* Semua user yang log masuk */}
          <Route element={<DashboardLayout />}>
            <Route path="/permohonan" element={<Permohonan />} />
            <Route path="/permohonan/sejarah" element={<PermohonanSejarah />} />
            <Route path="/permohonan/baru" element={<PermohonanDetail />} />
            <Route path="/permohonan/:id/hod" element={<PermohonanHod />} />
            <Route path="/permohonan/:id/ceo" element={<PermohonanCeo />} />
            <Route path="/permohonan/:id/semakan-kewangan" element={<FinanceSemakan />} />
            <Route path="/permohonan/:id/pengesahan-kewangan" element={<FinancePengesahan />} />
            <Route path="/permohonan/:id/kelulusan-kewangan" element={<FinanceKelulusan />} />
            <Route path="/permohonan/:id" element={<PermohonanDetail />} />
            <Route path="/pekeliling" element={<Pekeliling />} />
            <Route path="/kalendar" element={<Kalendar />} />
          </Route>

          {/* Finance, finance_hod, admin sahaja */}
          <Route element={<FinanceGuard />}>
            <Route path="/bajet" element={<Bajet />} />
            <Route path="/bajet/:id" element={<BajetDetail />} />
            <Route path="/laporan" element={<Laporan />} />
            <Route path="/laporan/layouts" element={<LaporanLayout />} />
            <Route path="/laporan/layouts/:id" element={<LaporanLayout />} />
            <Route path="/akaun" element={<Akaun />} />
            <Route path="/akaun-bank" element={<AkaunBank />} />
          </Route>

          {/* Admin sahaja */}
          <Route element={<AdminGuard />}>
            <Route path="/tetapan" element={<Tetapan />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" richColors />
    </QueryClientProvider>
  )
}
