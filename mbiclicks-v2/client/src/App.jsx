import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
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
import Kalendar from '@/pages/Kalendar'
import LaporanLayout from '@/pages/LaporanLayout'
import Permohonan from '@/pages/Permohonan'
import PermohonanDetail from '@/pages/PermohonanDetail'
import PermohonanHod from '@/pages/PermohonanHod'
import PermohonanCeo from '@/pages/PermohonanCeo'
import FinanceSemakan from '@/pages/FinanceSemakan'
import FinancePengesahan from '@/pages/FinancePengesahan'
import FinanceKelulusan from '@/pages/FinanceKelulusan'

const qc = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
})

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Dashboard — tiada sidebar, full width */}
          <Route element={<HomeLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>

          {/* Pages lain — ada sidebar */}
          <Route element={<DashboardLayout />}>
            <Route path="/bajet" element={<Bajet />} />
            <Route path="/bajet/:id" element={<BajetDetail />} />
            <Route path="/laporan" element={<Laporan />} />
            <Route path="/laporan/layouts" element={<LaporanLayout />} />
            <Route path="/laporan/layouts/:id" element={<LaporanLayout />} />
            <Route path="/permohonan" element={<Permohonan />} />
            <Route path="/permohonan/baru" element={<PermohonanDetail />} />
            <Route path="/permohonan/:id/hod" element={<PermohonanHod />} />
            <Route path="/permohonan/:id/ceo" element={<PermohonanCeo />} />
            <Route path="/permohonan/:id/semakan-kewangan" element={<FinanceSemakan />} />
            <Route path="/permohonan/:id/pengesahan-kewangan" element={<FinancePengesahan />} />
            <Route path="/permohonan/:id/kelulusan-kewangan" element={<FinanceKelulusan />} />
            <Route path="/permohonan/:id" element={<PermohonanDetail />} />
            <Route path="/pekeliling" element={<Pekeliling />} />
            <Route path="/tetapan" element={<Tetapan />} />
            <Route path="/akaun" element={<Akaun />} />
            <Route path="/kalendar" element={<Kalendar />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" richColors />
    </QueryClientProvider>
  )
}
