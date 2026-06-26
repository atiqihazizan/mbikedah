import api from './api'

export const MONTHS = ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ogs', 'Sep', 'Okt', 'Nov', 'Dis']
export const MONTH_KEYS = ['jan', 'feb', 'mac', 'apr', 'mei', 'jun', 'jul', 'ogs', 'sep', 'okt', 'nov', 'dis']

export const STATUS_LABEL = { DRAFT: 'Draf', ACTIVE: 'Aktif', CLOSED: 'Tutup' }
export const STATUS_COLOR = {
  DRAFT: 'bg-gray-100 text-gray-600',
  ACTIVE: 'bg-green-50 text-green-700',
  CLOSED: 'bg-red-50 text-red-600',
}
export const VERSION_LABEL = { ORIGINAL: 'Asal', ADJ1: 'Pindaan 1', ADJ2: 'Pindaan 2' }

export const budgetApi = {
  listYears: () => api.get('/budget/years').then((r) => r.data),
  getYear: (id) => api.get(`/budget/years/${id}`).then((r) => r.data),
  createYear: (data) => api.post('/budget/years', data).then((r) => r.data),
  activateYear: (id) => api.post(`/budget/years/${id}/activate`).then((r) => r.data),
  closeYear: (id) => api.post(`/budget/years/${id}/close`).then((r) => r.data),
  updateConfig: (id, data) => api.patch(`/budget/years/${id}/config`, data).then((r) => r.data),
  initLines: (id) => api.post(`/budget/years/${id}/init-lines`).then((r) => r.data),
  getLines: (id) => api.get(`/budget/years/${id}/lines`).then((r) => r.data),
  saveLines: (id, lines) => api.put(`/budget/years/${id}/lines`, { lines }).then((r) => r.data),
  getSummary: (id) => api.get(`/budget/years/${id}/summary`).then((r) => r.data),
  getAdjustments: (id) => api.get(`/budget/years/${id}/adjustments`).then((r) => r.data),
}
