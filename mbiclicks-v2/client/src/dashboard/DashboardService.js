import api from '@/lib/api'

export const DashboardService = {
  getSummary: async ({ signal } = {}) => {
    const res = await api.get('/me/summary', { signal })
    return res.data
  },
}
