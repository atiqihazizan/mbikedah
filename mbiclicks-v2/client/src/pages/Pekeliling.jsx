import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  Plus, Search, Pencil, Trash2, Bell,
  ChevronLeft, ChevronRight, X, Eye,
  Send, Archive, RotateCcw,
} from 'lucide-react'
import api from '@/lib/api'
import { useAuthStore } from '@/store/auth'
import {
  Button, Badge, Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter, Input, Label, Select, Spinner,
} from '@/components/ui'

// ─── Config ────────────────────────────────────────────────────────────────

const STATUS_CFG = {
  DRAFT:     { label: 'Draf',      badge: 'yellow',  desc: 'Boleh diedit, belum diterbit kepada staf' },
  PUBLISHED: { label: 'Diterbit',  badge: 'green',   desc: 'Kelihatan kepada semua staf berkenaan' },
  ARCHIVED:  { label: 'Diarkib',   badge: 'default', desc: 'Tersembunyi dari staf, boleh dipulihkan' },
}

const AUDIENCE_CFG = {
  ALL:        { label: 'Semua Staf', badge: 'blue' },
  DEPARTMENT: { label: 'Jabatan',    badge: 'purple' },
}

function fmtDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('ms-MY', { day: 'numeric', month: 'short', year: 'numeric' })
}

const EMPTY_FORM = {
  title: '', content: '', audienceType: 'ALL',
  departmentId: '', issuedAt: '', expiresAt: '',
}

// ─── Dialog Form (hanya untuk DRAFT) ─────────────────────────────────────

function CircularDialog({ open, onClose, record, departments, onSave, isSaving }) {
  const [form, setForm]     = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (!open) return
    if (record) {
      setForm({
        title:        record.title ?? '',
        content:      record.content ?? '',
        audienceType: record.audienceType ?? 'ALL',
        departmentId: record.departmentId ?? '',
        issuedAt:     record.issuedAt ? record.issuedAt.slice(0, 10) : '',
        expiresAt:    record.expiresAt ? record.expiresAt.slice(0, 10) : '',
      })
    } else {
      setForm({ ...EMPTY_FORM, issuedAt: new Date().toISOString().slice(0, 10) })
    }
    setErrors({})
  }, [open, record])

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
    setErrors((e) => ({ ...e, [field]: undefined }))
  }

  function validate() {
    const e = {}
    if (!form.title.trim())   e.title   = 'Tajuk diperlukan'
    if (!form.content.trim()) e.content = 'Kandungan diperlukan'
    if (form.audienceType === 'DEPARTMENT' && !form.departmentId) e.departmentId = 'Pilih jabatan'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return
    onSave({
      title:        form.title.trim(),
      content:      form.content.trim(),
      audienceType: form.audienceType,
      departmentId: form.audienceType === 'DEPARTMENT' ? parseInt(form.departmentId) : null,
      issuedAt:     form.issuedAt || undefined,
      expiresAt:    form.expiresAt || null,
    })
  }

  const isEdit = !!record

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogContent className="max-w-lg w-full">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Draf Pekeliling' : 'Pekeliling Baharu'}</DialogTitle>
          <p className="text-xs text-gray-400 mt-1">Disimpan sebagai Draf — belum kelihatan kepada staf</p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-1">
          <div>
            <Label>Tajuk <span className="text-red-500">*</span></Label>
            <Input
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              placeholder="Tajuk pekeliling..."
              className={errors.title ? 'border-red-400' : ''}
            />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
          </div>

          <div>
            <Label>Kandungan <span className="text-red-500">*</span></Label>
            <textarea
              value={form.content}
              onChange={(e) => set('content', e.target.value)}
              rows={6}
              placeholder="Kandungan pekeliling..."
              className={`block w-full rounded-lg border px-3 py-2.5 text-sm text-gray-900
                placeholder:text-gray-400 transition-colors resize-none
                focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500
                ${errors.content ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'}`}
            />
            {errors.content && <p className="text-xs text-red-500 mt-1">{errors.content}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Sasaran</Label>
              <Select value={form.audienceType} onChange={(e) => set('audienceType', e.target.value)}>
                <option value="ALL">Semua Staf</option>
                <option value="DEPARTMENT">Jabatan Tertentu</option>
              </Select>
            </div>
            <div>
              <Label>Jabatan</Label>
              <Select
                value={form.departmentId}
                onChange={(e) => set('departmentId', e.target.value)}
                disabled={form.audienceType !== 'DEPARTMENT'}
                className={errors.departmentId ? 'border-red-400' : ''}
              >
                <option value="">— Pilih jabatan —</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </Select>
              {errors.departmentId && <p className="text-xs text-red-500 mt-1">{errors.departmentId}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Tarikh Pekeliling</Label>
              <Input type="date" value={form.issuedAt} onChange={(e) => set('issuedAt', e.target.value)} />
            </div>
            <div>
              <Label>Tarikh Luput <span className="text-gray-400 font-normal">(pilihan)</span></Label>
              <Input type="date" value={form.expiresAt} onChange={(e) => set('expiresAt', e.target.value)} />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Batal</Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving && <Spinner size={14} />}
              {isEdit ? 'Simpan Draf' : 'Simpan sebagai Draf'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ─── Dialog Terbit ────────────────────────────────────────────────────────

function PublishDialog({ open, onClose, record, onConfirm, isLoading }) {
  if (!record) return null
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogContent className="max-w-md w-full">
        <DialogHeader>
          <DialogTitle>Terbit Pekeliling</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 mt-1">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm font-medium text-green-900">{record.title}</p>
            <p className="text-xs text-green-700 mt-1">
              Sasaran: {AUDIENCE_CFG[record.audienceType]?.label}
              {record.department && ` — ${record.department.name}`}
            </p>
          </div>
          <p className="text-sm text-gray-600">
            Pekeliling ini akan <strong>diterbit serta-merta</strong> dan kelihatan kepada staf berkenaan.
            Setelah diterbit, kandungan tidak boleh diedit. Jika perlu pinda, sila arkib dan cipta pekeliling baharu.
          </p>
          <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-3">
            ⚠ Tindakan ini tidak boleh dibatalkan. Pastikan kandungan telah disemak.
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Batal</Button>
          <Button onClick={onConfirm} disabled={isLoading} className="bg-green-600 hover:bg-green-700">
            {isLoading && <Spinner size={14} />}
            <Send className="w-4 h-4" /> Ya, Terbit Sekarang
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Dialog Arkib ─────────────────────────────────────────────────────────

function ArchiveDialog({ open, onClose, record, onConfirm, isLoading }) {
  if (!record) return null
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogContent className="max-w-md w-full">
        <DialogHeader>
          <DialogTitle>Arkib Pekeliling</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 mt-1">
          <p className="text-sm text-gray-600">
            Pekeliling <strong>"{record.title}"</strong> akan diarkib dan tersembunyi dari staf.
            Rekod kekal disimpan dan boleh dipulihkan kemudian.
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Batal</Button>
          <Button onClick={onConfirm} disabled={isLoading} variant="secondary">
            {isLoading && <Spinner size={14} />}
            <Archive className="w-4 h-4" /> Arkib
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Dialog View ──────────────────────────────────────────────────────────

function ViewDialog({ open, onClose, record }) {
  if (!record) return null
  const sc = STATUS_CFG[record.status] ?? STATUS_CFG.DRAFT
  const ac = AUDIENCE_CFG[record.audienceType] ?? AUDIENCE_CFG.ALL
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogContent className="max-w-lg w-full">
        <DialogHeader>
          <div className="flex items-start justify-between gap-3">
            <DialogTitle className="leading-snug">{record.title}</DialogTitle>
            <button onClick={onClose} className="shrink-0 p-1 rounded hover:bg-gray-100 text-gray-400">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            <Badge variant={sc.badge}>{sc.label}</Badge>
            <Badge variant={ac.badge}>{ac.label}</Badge>
            {record.department && <Badge variant="default">{record.department.name}</Badge>}
          </div>
          <div className="text-xs text-gray-400 mt-2 space-y-0.5">
            <p>Tarikh pekeliling: {fmtDate(record.issuedAt)}</p>
            {record.publishedAt && <p>Diterbit: {fmtDate(record.publishedAt)} · oleh {record.issuedBy?.name}</p>}
            {record.archivedAt  && <p>Diarkib: {fmtDate(record.archivedAt)}</p>}
            {record.expiresAt   && <p>Tarikh luput: {fmtDate(record.expiresAt)}</p>}
          </div>
        </DialogHeader>

        <div className="mt-3 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap
          border-t border-gray-100 pt-4 max-h-72 overflow-y-auto">
          {record.content}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Tutup</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────

export default function Pekeliling() {
  const can              = useAuthStore((s) => s.can)
  const user             = useAuthStore((s) => s.user)
  const hasRole          = useAuthStore((s) => s.hasRole)
  const canDraftCircular = useAuthStore((s) => s.canDraftCircular)
  const qc               = useQueryClient()

  const [page,        setPage]        = useState(1)
  const [search,      setSearch]      = useState('')
  const [dSearch,     setDSearch]     = useState('')
  const [statusF,     setStatusF]     = useState('')
  const [audience,    setAudience]    = useState('')
  const [showForm,    setShowForm]    = useState(false)
  const [showView,    setShowView]    = useState(false)
  const [showPublish, setShowPublish] = useState(false)
  const [showArchive, setShowArchive] = useState(false)
  const [selected,    setSelected]    = useState(null)

  useEffect(() => {
    const t = setTimeout(() => { setDSearch(search); setPage(1) }, 400)
    return () => clearTimeout(t)
  }, [search])

  const { data: deptData } = useQuery({
    queryKey: ['circular-depts'],
    queryFn: () => api.get('/circular/departments').then((r) => r.data.data ?? []),
    staleTime: 300_000,
  })
  const departments = deptData ?? []

  const { data, isLoading } = useQuery({
    queryKey: ['circulars', page, dSearch, statusF, audience],
    queryFn: () => api.get('/circular', {
      params: {
        page, limit: 20,
        search:   dSearch  || undefined,
        status:   statusF  || undefined,
        audience: audience || undefined,
      },
    }).then((r) => r.data),
    keepPreviousData: true,
  })

  const rows       = data?.data ?? []
  const total      = data?.total ?? 0
  const totalPages = data?.totalPages ?? 1

  // Permissions
  const canCreate  = canDraftCircular()             // canCreate permission ATAU flag canDraftCircular
  const canApprove = can('circular', 'canApprove')  // publish & archive
  const canDelete  = can('circular', 'canDelete')   // restore & delete kekal

  function isMyDraft(row) {
    return row.status === 'DRAFT' && (row.issuedBy?.id === user?.id || hasRole('admin'))
  }

  // Mutations
  const saveMut = useMutation({
    mutationFn: (body) => selected
      ? api.put(`/circular/${selected.id}`, body)
      : api.post('/circular', body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['circulars'] })
      setShowForm(false); setSelected(null)
      toast.success(selected ? 'Draf dikemaskini' : 'Draf pekeliling disimpan')
    },
    onError: (err) => toast.error(err.response?.data?.message ?? 'Gagal simpan'),
  })

  const publishMut = useMutation({
    mutationFn: (id) => api.post(`/circular/${id}/publish`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['circulars'] })
      setShowPublish(false); setSelected(null)
      toast.success('Pekeliling berjaya diterbit')
    },
    onError: (err) => toast.error(err.response?.data?.message ?? 'Gagal terbit'),
  })

  const archiveMut = useMutation({
    mutationFn: (id) => api.post(`/circular/${id}/archive`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['circulars'] })
      setShowArchive(false); setSelected(null)
      toast.success('Pekeliling diarkib')
    },
    onError: (err) => toast.error(err.response?.data?.message ?? 'Gagal arkib'),
  })

  const restoreMut = useMutation({
    mutationFn: (id) => api.post(`/circular/${id}/restore`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['circulars'] })
      toast.success('Pekeliling dipulihkan ke Draf')
    },
    onError: (err) => toast.error(err.response?.data?.message ?? 'Gagal pulih'),
  })

  const deleteMut = useMutation({
    mutationFn: (id) => api.delete(`/circular/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['circulars'] })
      toast.success('Pekeliling dipadam')
    },
    onError: (err) => toast.error(err.response?.data?.message ?? 'Gagal padam'),
  })

  function handleDelete(row) {
    if (!window.confirm(`Padam "${row.title}"? Tindakan ini tidak boleh dibatalkan.`)) return
    deleteMut.mutate(row.id)
  }

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-[1400px] mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Bell className="w-5 h-5 text-green-600" /> Pekeliling
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Pengurusan pekeliling dan notis rasmi</p>
        </div>
        {canCreate && (
          <Button onClick={() => { setSelected(null); setShowForm(true) }} className="self-start sm:self-auto">
            <Plus className="w-4 h-4" /> Pekeliling Baharu
          </Button>
        )}
      </div>

      {/* Status guide */}
      <div className="flex flex-wrap gap-3">
        {Object.entries(STATUS_CFG).map(([k, v]) => (
          <div key={k} className="flex items-center gap-2 text-xs text-gray-500">
            <Badge variant={v.badge}>{v.label}</Badge>
            <span>{v.desc}</span>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Cari tajuk pekeliling..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full rounded-lg border border-gray-300 bg-white pl-9 pr-3 py-2.5 text-sm
              focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
          />
        </div>
        <Select value={statusF} onChange={(e) => { setStatusF(e.target.value); setPage(1) }} className="w-full sm:w-36">
          <option value="">Semua Status</option>
          <option value="DRAFT">Draf</option>
          <option value="PUBLISHED">Diterbit</option>
          <option value="ARCHIVED">Diarkib</option>
        </Select>
        <Select value={audience} onChange={(e) => { setAudience(e.target.value); setPage(1) }} className="w-full sm:w-40">
          <option value="">Semua Sasaran</option>
          <option value="ALL">Semua Staf</option>
          <option value="DEPARTMENT">Jabatan</option>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-medium text-gray-600 w-8">#</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Tajuk</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden sm:table-cell">Sasaran</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Jabatan</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">Tarikh</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-gray-400">
                    <Spinner size={20} />
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16">
                    <Bell className="mx-auto mb-2 text-gray-300" size={32} />
                    <p className="text-gray-400 text-sm">Tiada pekeliling dijumpai</p>
                  </td>
                </tr>
              ) : (
                rows.map((row, i) => {
                  const sc = STATUS_CFG[row.status] ?? STATUS_CFG.DRAFT
                  const ac = AUDIENCE_CFG[row.audienceType] ?? AUDIENCE_CFG.ALL
                  return (
                    <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-gray-400 text-xs">{(page - 1) * 20 + i + 1}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => { setSelected(row); setShowView(true) }}
                          className="text-left font-medium text-gray-900 hover:text-green-700 transition-colors line-clamp-2 max-w-xs"
                        >
                          {row.title}
                        </button>
                        <p className="text-xs text-gray-400 mt-0.5">{row.issuedBy?.name}</p>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <Badge variant={ac.badge}>{ac.label}</Badge>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-gray-600 text-xs">
                        {row.department?.name ?? <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell text-gray-500 text-xs">
                        <p>{fmtDate(row.issuedAt)}</p>
                        {row.publishedAt && <p className="text-green-600">Terbit: {fmtDate(row.publishedAt)}</p>}
                        {row.archivedAt  && <p className="text-gray-400">Arkib: {fmtDate(row.archivedAt)}</p>}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={sc.badge}>{sc.label}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          {/* Lihat */}
                          <button
                            onClick={() => { setSelected(row); setShowView(true) }}
                            title="Lihat kandungan"
                            className="p-1.5 rounded-lg text-gray-400 hover:text-green-700 hover:bg-green-50 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Edit draf — pencipta atau admin */}
                          {row.status === 'DRAFT' && isMyDraft(row) && (
                            <button
                              onClick={() => { setSelected(row); setShowForm(true) }}
                              title="Edit draf"
                              className="p-1.5 rounded-lg text-gray-400 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                          )}

                          {/* Terbit — DRAFT, perlu canApprove */}
                          {row.status === 'DRAFT' && canApprove && (
                            <button
                              onClick={() => { setSelected(row); setShowPublish(true) }}
                              title="Terbit pekeliling"
                              className="p-1.5 rounded-lg text-gray-400 hover:text-green-700 hover:bg-green-50 transition-colors"
                            >
                              <Send className="w-4 h-4" />
                            </button>
                          )}

                          {/* Arkib — PUBLISHED, perlu canApprove */}
                          {row.status === 'PUBLISHED' && canApprove && (
                            <button
                              onClick={() => { setSelected(row); setShowArchive(true) }}
                              title="Arkib pekeliling"
                              className="p-1.5 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                            >
                              <Archive className="w-4 h-4" />
                            </button>
                          )}

                          {/* Pulih ke Draf — ARCHIVED, perlu canDelete (admin) */}
                          {row.status === 'ARCHIVED' && canDelete && (
                            <button
                              onClick={() => restoreMut.mutate(row.id)}
                              title="Pulihkan ke Draf"
                              className="p-1.5 rounded-lg text-gray-400 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </button>
                          )}

                          {/* Padam — DRAFT/ARCHIVED, perlu canDelete */}
                          {row.status !== 'PUBLISHED' && canDelete && (
                            <button
                              onClick={() => handleDelete(row)}
                              title="Padam"
                              className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50">
            <p className="text-xs text-gray-500">
              Jumlah: <span className="font-medium">{total}</span> rekod
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => p - 1)}
                disabled={page <= 1}
                className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs text-gray-600 px-2">{page} / {totalPages}</span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= totalPages}
                className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Dialogs */}
      <CircularDialog
        open={showForm}
        onClose={() => { setShowForm(false); setSelected(null) }}
        record={showForm ? selected : null}
        departments={departments}
        onSave={(body) => saveMut.mutate(body)}
        isSaving={saveMut.isPending}
      />
      <PublishDialog
        open={showPublish}
        onClose={() => { setShowPublish(false); setSelected(null) }}
        record={showPublish ? selected : null}
        onConfirm={() => publishMut.mutate(selected.id)}
        isLoading={publishMut.isPending}
      />
      <ArchiveDialog
        open={showArchive}
        onClose={() => { setShowArchive(false); setSelected(null) }}
        record={showArchive ? selected : null}
        onConfirm={() => archiveMut.mutate(selected.id)}
        isLoading={archiveMut.isPending}
      />
      <ViewDialog
        open={showView}
        onClose={() => { setShowView(false); setSelected(null) }}
        record={showView ? selected : null}
      />
    </div>
  )
}
