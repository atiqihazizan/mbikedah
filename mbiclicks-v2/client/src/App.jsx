import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import HomeLayout from '@/components/layout/HomeLayout'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Login from '@/pages/Login'
import Dashboard from '@/pages/Dashboard'
import Bajet from '@/pages/Bajet'
import BajetDetail from '@/pages/BajetDetail'
import Pekeliling from '@/pages/Pekeliling'

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
            <Route path="/pekeliling" element={<Pekeliling />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" richColors />
    </QueryClientProvider>
  )
}
