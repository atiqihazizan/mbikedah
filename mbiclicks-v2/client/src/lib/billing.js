import api from './api'

export const billingApi = {
  list:         (params) => api.get('/billings', { params }).then(r => r.data),
  listAktif:    (params) => api.get('/billings/aktif', { params }).then(r => r.data),
  listSejarah:  (params) => api.get('/billings/sejarah', { params }).then(r => r.data),
  get:          (id)     => api.get(`/billings/${id}`).then(r => r.data),
  getReview:    (id)     => api.get(`/billings/${id}/review`).then(r => r.data),
  getView:      (id)     => api.get(`/billings/${id}/view`).then(r => r.data),
  hodReview:    (id)     => api.get(`/billings/${id}/hod`).then(r => r.data),
  ceoReview:    (id)     => api.get(`/billings/${id}/ceo`).then(r => r.data),
  create:       (body)   => api.post('/billings', body).then(r => r.data),
  update:       (id, body) => api.put(`/billings/${id}`, body).then(r => r.data),
  delete:       (id)     => api.delete(`/billings/${id}`).then(r => r.data),
  submit:       (id, body) => api.post(`/billings/${id}/submit`, body).then(r => r.data),
  action:       (id, action, body) => api.post(`/billings/${id}/action/${action}`, body).then(r => r.data),
  pay:          (id, body) => api.post(`/billings/${id}/payments`, body).then(r => r.data),
  payPhase:     (id, phaseId, body) => api.patch(`/billings/${id}/payments/${phaseId}`, body).then(r => r.data),
  listPayments: (id) => api.get(`/billings/${id}/payments`).then(r => r.data),
  close:        (id, body) => api.post(`/billings/${id}/close`, body).then(r => r.data),
  uploadAtt:    (id, file) => {
    const fd = new FormData()
    fd.append('file', file)
    return api.post(`/billings/${id}/attachments`, fd, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data)
  },
  deleteAtt:    (id, attId) => api.delete(`/billings/${id}/attachments/${attId}`).then(r => r.data),
  downloadUrl:  (id, attId) => `/api/billings/${id}/attachments/${attId}/download`,
}

export const vendorApi = {
  list:   (params) => api.get('/vendors', { params }).then(r => r.data),
  create: (body)   => api.post('/vendors', body).then(r => r.data),
  update: (id, body) => api.put(`/vendors/${id}`, body).then(r => r.data),
  toggle: (id)     => api.patch(`/vendors/${id}/toggle`).then(r => r.data),
}

export const BILLING_STATUS = {
  DRAFT:                    { label: 'Draf',                color: 'gray'   },
  PENDING_HOD:              { label: 'Menunggu Ketua Jabatan', color: 'amber' },
  PENDING_CEO:              { label: 'Menunggu Ketua Eksekutif', color: 'rose' },
  PENDING_FINANCE_CHECK:    { label: 'Semakan Kewangan',    color: 'blue'   },
  PENDING_FINANCE_VERIFY:   { label: 'Pengesahan Kewangan', color: 'indigo' },
  PENDING_FINANCE_APPROVAL: { label: 'Kelulusan Kewangan',  color: 'purple' },
  PENDING_CEO_FINAL:        { label: 'Kelulusan Muktamad',  color: 'rose'   },
  APPROVED:                 { label: 'Diluluskan',          color: 'green'  },
  PARTIAL_PAID:             { label: 'Bayaran Ansuran',     color: 'cyan'   },
  PAID:                     { label: 'Selesai Dibayar',     color: 'teal'   },
  CLOSED:                   { label: 'Ditutup',             color: 'gray'   },
  REJECTED:                 { label: 'Ditolak',             color: 'red'    },
  RETURNED:                 { label: 'Dikembalikan',        color: 'orange' },
}

export const STATUS_TABS = [
  { key: '',                       label: 'Semua'              },
  { key: 'DRAFT',                  label: 'Draf'               },
  { key: 'PENDING_HOD',            label: 'Ketua Jabatan'      },
  { key: 'PENDING_CEO',            label: 'Ketua Eksekutif'    },
  { key: 'PENDING_FINANCE_CHECK',  label: 'Semakan'            },
  { key: 'PENDING_FINANCE_VERIFY', label: 'Pengesahan'         },
  { key: 'PENDING_FINANCE_APPROVAL', label: 'Kelulusan'        },
  { key: 'PENDING_CEO_FINAL',      label: 'Kelulusan Muktamad' },
  { key: 'APPROVED',               label: 'Diluluskan'         },
  { key: 'PARTIAL_PAID',           label: 'Bayaran Ansuran'    },
  { key: 'PAID',                   label: 'Selesai Dibayar'    },
  { key: 'CLOSED',                 label: 'Ditutup'            },
  { key: 'REJECTED',               label: 'Ditolak'            },
]
