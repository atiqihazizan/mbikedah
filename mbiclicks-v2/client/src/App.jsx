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
import BajetLaporan from '@/pages/BajetLaporan'
import LaporanBajet from '@/pages/LaporanBajet'

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
            <Route path="/bajet/:id/laporan" element={<BajetLaporan />} />
            <Route path="/laporan" element={<Laporan />} />
            <Route path="/laporan/bajet" element={<LaporanBajet />} />
            <Route path="/laporan/bajet/:id" element={<LaporanBajet />} />
            <Route path="/laporan/layouts" element={<LaporanLayout />} />
            <Route path="/laporan/layouts/:id" element={<LaporanLayout />} />
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
