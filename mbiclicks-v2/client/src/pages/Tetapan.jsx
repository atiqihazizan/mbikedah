import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import {
  Users, Plus, Search, Pencil, ToggleLeft, ToggleRight,
  ChevronLeft, ChevronRight, FileText, Building2, Briefcase,
  Activity, ShieldCheck, KeyRound, Save, RefreshCw,
} from 'lucide-react'
import api from '@/lib/api'
import {
  Button, Badge, Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter, Input, Label, Select, Spinner,
} from '@/components/ui'

// ─── constants ────────────────────────────────────────────────────────────────

const ROLE_BADGE = {
  admin: 'red', ceo: 'purple', hod: 'blue',
  finance_hod: 'teal', finance: 'yellow', staff: 'default',
}

const MODULES = ['budget', 'billing', 'circular', 'event', 'user', 'report', 'sync', 'account', 'admin', 'dashboard']

const MODULE_LABEL = {
  budget: 'Bajet', billing: 'Permohonan', circular: 'Pekeliling',
  event: 'Kalendar', user: 'Pengguna', report: 'Laporan',
  sync: 'Sinkronisasi', account: 'Akaun', admin: 'Pentadbiran', dashboard: 'Dashboard',
}

const ACTION_LABEL = {
  LOGIN: 'Log Masuk', LOGOUT: 'Log Keluar',
  CREATE: 'Cipta', UPDATE: 'Kemaskini', DELETE: 'Padam',
  ACTIVATE: 'Aktif', DEACTIVATE: 'Nyahaktif',
  RESET_PASSWORD: 'Reset Kata Laluan',
  PUBLISH: 'Terbit', ARCHIVE: 'Arkib',
}

const ACTION_COLOR = {
  LOGIN: 'bg-green-100 text-green-700',
  LOGOUT: 'bg-gray-100 text-gray-600',
  CREATE: 'bg-blue-100 text-blue-700',
  UPDATE: 'bg-yellow-100 text-yellow-700',
  DELETE: 'bg-red-100 text-red-700',
  ACTIVATE: 'bg-green-100 text-green-700',
  DEACTIVATE: 'bg-gray-100 text-gray-500',
  RESET_PASSWORD: 'bg-orange-100 text-orange-700',
  PUBLISH: 'bg-teal-100 text-teal-700',
  ARCHIVE: 'bg-gray-100 text-gray-500',
}

function fmtDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('ms-MY', { day: 'numeric', month: 'short', year: 'numeric' })
}
function fmtDateTime(d) {
  if (!d) return '—'
  return new Date(d).toLocaleString('ms-MY', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

// ─── Tab nav ──────────────────────────────────────────────────────────────────

const TABS = [
  { id: 'pengguna',  label: 'Pengguna',          icon: Users },
  { id: 'jabatan',   label: 'Jabatan',            icon: Building2 },
  { id: 'jawatan',   label: 'Jawatan',            icon: Briefcase },
  { id: 'log',       label: 'Log Aktiviti',       icon: Activity },
  { id: 'peranan',   label: 'Peranan & Kebenaran',icon: ShieldCheck },
]

// ─── Shared SimpleDialog ──────────────────────────────────────────────────────

function SimpleDialog({ open, onClose, title, children }) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogContent className="max-w-md w-full">
        <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 1 — PENGGUNA
// ═══════════════════════════════════════════════════════════════════════════════

const EMPTY_USER = {
  staffNo: '', name: '', email: '', phone: '',
  roleId: '', departmentId: '', positionId: '',
  isActive: true, canDraftCircular: false,
}

function UserDialog({ open, onClose, record, meta, onSave, isSaving }) {
  const [form, setForm]     = useState(EMPTY_USER)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (!open) return
    setForm(record ? {
      staffNo:          record.staffNo ?? '',
      name:             record.name    ?? '',
      email:            record.email   ?? '',
      phone:            record.phone   ?? '',
      roleId:           record.roleId ?? record.role?.id         ?? '',
      departmentId:     record.departmentId ?? record.department?.id ?? '',
      positionId:       record.positionId   ?? record.position?.id   ?? '',
      isActive:         record.isActive         ?? true,
      canDraftCircular: record.canDraftCircular ?? false,
    } : EMPTY_USER)
    setErrors({})
  }, [open, record])

  function set(f, v) { setForm((p) => ({ ...p, [f]: v })); setErrors((e) => ({ ...e, [f]: undefined })) }

  function handleSubmit(e) {
    e.preventDefault()
    const e2 = {}
    if (!form.staffNo.trim()) e2.staffNo = 'No. staf diperlukan'
    if (!form.name.trim())    e2.name    = 'Nama diperlukan'
    if (!form.roleId)         e2.roleId  = 'Peranan diperlukan'
    if (Object.keys(e2).length) { setErrors(e2); return }
    onSave({
      staffNo: form.staffNo.trim().toUpperCase(), name: form.name.trim(),
      email: form.email.trim() || undefined, phone: form.phone.trim() || undefined,
      roleId: parseInt(form.roleId),
      departmentId: form.departmentId ? parseInt(form.departmentId) : null,
      positionId:   form.positionId   ? parseInt(form.positionId)   : null,
      isActive: form.isActive, canDraftCircular: form.canDraftCircular,
    })
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogContent className="max-w-lg w-full">
        <DialogHeader>
          <DialogTitle>{record ? 'Kemaskini Pengguna' : 'Tambah Pengguna Baharu'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-1">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>No. Staf <span className="text-red-500">*</span></Label>
              <Input value={form.staffNo} onChange={(e) => set('staffNo', e.target.value.toUpperCase())}
                placeholder="Cth: 0032" disabled={!!record}
                className={`uppercase tracking-widest ${errors.staffNo ? 'border-red-400' : ''}`} />
              {errors.staffNo && <p className="text-xs text-red-500 mt-1">{errors.staffNo}</p>}
            </div>
            <div>
              <Label>Nama Penuh <span className="text-red-500">*</span></Label>
              <Input value={form.name} onChange={(e) => set('name', e.target.value)}
                placeholder="Nama pengguna..." className={errors.name ? 'border-red-400' : ''} />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Email <span className="text-gray-400 font-normal">(pilihan)</span></Label>
              <Input type="email" value={form.email} onChange={(e) => set('email', e.target.value)}
                placeholder="email@mbi.gov.my" disabled={!!record} />
            </div>
            <div>
              <Label>No. Telefon <span className="text-gray-400 font-normal">(pilihan)</span></Label>
              <Input value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="0123456789" />
            </div>
          </div>
          <div>
            <Label>Peranan <span className="text-red-500">*</span></Label>
            <Select value={form.roleId} onChange={(e) => set('roleId', e.target.value)}
              className={errors.roleId ? 'border-red-400' : ''}>
              <option value="">— Pilih peranan —</option>
              {(meta?.roles ?? []).map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
            </Select>
            {errors.roleId && <p className="text-xs text-red-500 mt-1">{errors.roleId}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Jabatan</Label>
              <Select value={form.departmentId} onChange={(e) => set('departmentId', e.target.value)}>
                <option value="">— Tiada —</option>
                {(meta?.departments ?? []).map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </Select>
            </div>
            <div>
              <Label>Jawatan</Label>
              <Select value={form.positionId} onChange={(e) => set('positionId', e.target.value)}>
                <option value="">— Tiada —</option>
                {(meta?.positions ?? []).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </Select>
            </div>
          </div>
          <div className="space-y-2.5 pt-1 border-t border-gray-100">
            {[
              { field: 'isActive', label: 'Akaun Aktif', desc: 'Pengguna boleh log masuk ke sistem' },
              { field: 'canDraftCircular', label: 'Boleh Draf Pekeliling', desc: 'Benarkan staf ini cipta dan edit draf pekeliling' },
            ].map(({ field, label, desc }) => (
              <label key={field} className="flex items-center gap-3 cursor-pointer select-none">
                <input type="checkbox" checked={form[field]}
                  onChange={(e) => set(field, e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500" />
                <div>
                  <p className="text-sm font-medium text-gray-700">{label}</p>
                  <p className="text-xs text-gray-400">{desc}</p>
                </div>
              </label>
            ))}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Batal</Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving && <Spinner size={14} />}
              {record ? 'Simpan Perubahan' : 'Tambah Pengguna'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function TabPengguna({ meta }) {
  const qc = useQueryClient()
  const [page, setPage]       = useState(1)
  const [search, setSearch]   = useState('')
  const [dSearch, setDSearch] = useState('')
  const [deptId, setDeptId]   = useState('')
  const [roleId, setRoleId]   = useState('')
  const [status, setStatus]   = useState('')
  const [showForm, setShowForm] = useState(false)
  const [selected, setSelected] = useState(null)
  const [resetTarget, setResetTarget] = useState(null)

  useEffect(() => {
    const t = setTimeout(() => { setDSearch(search); setPage(1) }, 400)
    return () => clearTimeout(t)
  }, [search])

  const { data, isLoading } = useQuery({
    queryKey: ['users', page, dSearch, deptId, roleId, status],
    queryFn: () => api.get('/users', { params: { page, limit: 20, search: dSearch || undefined, deptId: deptId || undefined, roleId: roleId || undefined, status: status || undefined } }).then((r) => r.data),
    keepPreviousData: true,
  })

  const rows = data?.data ?? []; const total = data?.total ?? 0; const totalPages = data?.totalPages ?? 1

  const saveMut = useMutation({
    mutationFn: (body) => selected ? api.put(`/users/${selected.id}`, body) : api.post('/users', body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); setShowForm(false); setSelected(null); toast.success(selected ? 'Pengguna dikemaskini' : 'Pengguna ditambah') },
    onError: (err) => toast.error(err.response?.data?.message ?? 'Gagal simpan'),
  })

  const toggleMut = useMutation({
    mutationFn: (id) => api.patch(`/users/${id}/toggle`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); toast.success('Status dikemaskini') },
    onError: (err) => toast.error(err.response?.data?.message ?? 'Gagal'),
  })

  const draftMut = useMutation({
    mutationFn: (id) => api.patch(`/users/${id}/draft-circular`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); toast.success('Kebenaran dikemaskini') },
    onError: (err) => toast.error(err.response?.data?.message ?? 'Gagal'),
  })

  const resetMut = useMutation({
    mutationFn: (id) => api.patch(`/users/${id}/reset-password`),
    onSuccess: (res) => { setResetTarget(null); toast.success(res.data.message) },
    onError: (err) => toast.error(err.response?.data?.message ?? 'Gagal reset'),
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="text-sm text-gray-500">Jumlah <span className="font-medium text-gray-700">{total}</span> pengguna berdaftar</p>
        <Button onClick={() => { setSelected(null); setShowForm(true) }} className="self-start sm:self-auto">
          <Plus className="w-4 h-4" /> Tambah Pengguna
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input type="text" placeholder="Cari nama, no. staf atau email..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full rounded-lg border border-gray-300 bg-white pl-9 pr-3 py-2.5 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500" />
        </div>
        <Select value={deptId} onChange={(e) => { setDeptId(e.target.value); setPage(1) }} className="w-full sm:w-44">
          <option value="">Semua Jabatan</option>
          {(meta?.departments ?? []).map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </Select>
        <Select value={roleId} onChange={(e) => { setRoleId(e.target.value); setPage(1) }} className="w-full sm:w-36">
          <option value="">Semua Peranan</option>
          {(meta?.roles ?? []).map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
        </Select>
        <Select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1) }} className="w-full sm:w-32">
          <option value="">Semua Status</option>
          <option value="active">Aktif</option>
          <option value="inactive">Tidak Aktif</option>
        </Select>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-medium text-gray-600 w-8">#</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Pengguna</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Jabatan</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">Jawatan</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Peranan</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600 hidden sm:table-cell">Draf Pekeliling</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden xl:table-cell">Log Masuk Akhir</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan={9} className="text-center py-16 text-gray-400"><Spinner size={20} /></td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-16"><Users className="mx-auto mb-2 text-gray-300" size={32} /><p className="text-gray-400 text-sm">Tiada pengguna dijumpai</p></td></tr>
              ) : rows.map((row, i) => (
                <tr key={row.id} className={`transition-colors ${row.isActive ? 'hover:bg-gray-50' : 'bg-gray-50/50 opacity-60'}`}>
                  <td className="px-4 py-3 text-gray-400 text-xs">{(page - 1) * 20 + i + 1}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center shrink-0">
                        <span className="text-white text-xs font-bold">{row.name?.charAt(0).toUpperCase()}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 truncate">{row.name}</p>
                        <p className="text-xs text-gray-400 font-mono">{row.staffNo}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-gray-600 text-xs">{row.department?.name ?? <span className="text-gray-300">—</span>}</td>
                  <td className="px-4 py-3 hidden lg:table-cell text-gray-500 text-xs">{row.position?.name ?? <span className="text-gray-300">—</span>}</td>
                  <td className="px-4 py-3"><Badge variant={ROLE_BADGE[row.role?.slug] ?? 'default'}>{row.role?.name ?? '—'}</Badge></td>
                  <td className="px-4 py-3 hidden sm:table-cell text-center">
                    <button onClick={() => draftMut.mutate(row.id)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${row.canDraftCircular ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}>
                      <FileText className="w-3 h-3" />{row.canDraftCircular ? 'Ya' : 'Tidak'}
                    </button>
                  </td>
                  <td className="px-4 py-3 hidden xl:table-cell text-gray-400 text-xs">{fmtDate(row.lastLogin)}</td>
                  <td className="px-4 py-3"><Badge variant={row.isActive ? 'green' : 'default'}>{row.isActive ? 'Aktif' : 'Tidak Aktif'}</Badge></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => { setSelected(row); setShowForm(true) }} title="Edit"
                        className="p-1.5 rounded-lg text-gray-400 hover:text-blue-700 hover:bg-blue-50 transition-colors">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => toggleMut.mutate(row.id)} title={row.isActive ? 'Nyahaktif' : 'Aktifkan'}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-colors">
                        {row.isActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                      </button>
                      <button onClick={() => setResetTarget(row)} title="Reset Kata Laluan"
                        className="p-1.5 rounded-lg text-gray-400 hover:text-orange-600 hover:bg-orange-50 transition-colors">
                        <KeyRound className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50">
            <p className="text-xs text-gray-500">Jumlah: <span className="font-medium">{total}</span> pengguna</p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage((p) => p - 1)} disabled={page <= 1}
                className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs text-gray-600 px-2">{page} / {totalPages}</span>
              <button onClick={() => setPage((p) => p + 1)} disabled={page >= totalPages}
                className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      <UserDialog open={showForm} onClose={() => { setShowForm(false); setSelected(null) }}
        record={showForm ? selected : null} meta={meta}
        onSave={(body) => saveMut.mutate(body)} isSaving={saveMut.isPending} />

      {/* Reset password confirm */}
      <SimpleDialog open={!!resetTarget} onClose={() => setResetTarget(null)} title="Reset Kata Laluan">
        <div className="mt-2 space-y-3">
          <p className="text-sm text-gray-600">
            Kata laluan <span className="font-semibold text-gray-900">{resetTarget?.name}</span> akan ditetapkan semula kepada{' '}
            <code className="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-xs font-mono">mbi123</code>.
          </p>
          <p className="text-xs text-amber-600">Sila maklumkan kepada pengguna untuk tukar kata laluan selepas log masuk.</p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setResetTarget(null)}>Batal</Button>
          <Button variant="destructive" disabled={resetMut.isPending} onClick={() => resetMut.mutate(resetTarget.id)}>
            {resetMut.isPending && <Spinner size={14} />} Reset
          </Button>
        </DialogFooter>
      </SimpleDialog>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 2 — JABATAN
// ═══════════════════════════════════════════════════════════════════════════════

const EMPTY_DEPT = { code: '', name: '', parentId: '', level: 0, sortOrder: 0 }

function DeptDialog({ open, onClose, record, allDepts, onSave, isSaving }) {
  const [form, setForm] = useState(EMPTY_DEPT)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (!open) return
    setForm(record ? { code: record.code, name: record.name, parentId: record.parentId ?? '', level: record.level ?? 0, sortOrder: record.sortOrder ?? 0 } : EMPTY_DEPT)
    setErrors({})
  }, [open, record])

  function set(f, v) { setForm((p) => ({ ...p, [f]: v })); setErrors((e) => ({ ...e, [f]: undefined })) }

  function handleSubmit(e) {
    e.preventDefault()
    const e2 = {}
    if (!form.code.trim()) e2.code = 'Kod diperlukan'
    if (!form.name.trim()) e2.name = 'Nama diperlukan'
    if (Object.keys(e2).length) { setErrors(e2); return }
    onSave({ code: form.code, name: form.name, parentId: form.parentId ? parseInt(form.parentId) : null, level: parseInt(form.level) || 0, sortOrder: parseInt(form.sortOrder) || 0 })
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogContent className="max-w-md w-full">
        <DialogHeader><DialogTitle>{record ? 'Kemaskini Jabatan' : 'Tambah Jabatan'}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-1">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Kod <span className="text-red-500">*</span></Label>
              <Input value={form.code} onChange={(e) => set('code', e.target.value.toUpperCase())}
                placeholder="Cth: IT" disabled={!!record} className={`uppercase ${errors.code ? 'border-red-400' : ''}`} />
              {errors.code && <p className="text-xs text-red-500 mt-1">{errors.code}</p>}
            </div>
            <div>
              <Label>Susunan</Label>
              <Input type="number" min="0" value={form.sortOrder} onChange={(e) => set('sortOrder', e.target.value)} />
            </div>
          </div>
          <div>
            <Label>Nama Jabatan <span className="text-red-500">*</span></Label>
            <Input value={form.name} onChange={(e) => set('name', e.target.value)}
              placeholder="Nama penuh jabatan..." className={errors.name ? 'border-red-400' : ''} />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Jabatan Induk</Label>
              <Select value={form.parentId} onChange={(e) => set('parentId', e.target.value)}>
                <option value="">— Tiada —</option>
                {(allDepts ?? []).filter((d) => !record || d.id !== record.id).map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Tahap</Label>
              <Input type="number" min="0" value={form.level} onChange={(e) => set('level', e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Batal</Button>
            <Button type="submit" disabled={isSaving}>{isSaving && <Spinner size={14} />}{record ? 'Simpan' : 'Tambah'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function TabJabatan() {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [selected, setSelected] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['departments'],
    queryFn: () => api.get('/departments').then((r) => r.data.data),
  })
  const rows = data ?? []

  const saveMut = useMutation({
    mutationFn: (body) => selected ? api.put(`/departments/${selected.id}`, body) : api.post('/departments', body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['departments'] }); qc.invalidateQueries({ queryKey: ['users-meta'] }); setShowForm(false); setSelected(null); toast.success(selected ? 'Jabatan dikemaskini' : 'Jabatan ditambah') },
    onError: (err) => toast.error(err.response?.data?.message ?? 'Gagal simpan'),
  })

  const toggleMut = useMutation({
    mutationFn: (id) => api.patch(`/departments/${id}/toggle`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['departments'] }); toast.success('Status dikemaskini') },
    onError: (err) => toast.error(err.response?.data?.message ?? 'Gagal'),
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500"><span className="font-medium text-gray-700">{rows.length}</span> jabatan berdaftar</p>
        <Button onClick={() => { setSelected(null); setShowForm(true) }}><Plus className="w-4 h-4" /> Tambah Jabatan</Button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3 font-medium text-gray-600 w-8">#</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Kod</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Nama Jabatan</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Jabatan Induk</th>
              <th className="text-center px-4 py-3 font-medium text-gray-600 hidden sm:table-cell">Pengguna</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Tindakan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr><td colSpan={7} className="text-center py-12"><Spinner size={20} /></td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-12 text-gray-400 text-sm">Tiada jabatan</td></tr>
            ) : rows.map((row, i) => (
              <tr key={row.id} className={`transition-colors hover:bg-gray-50 ${!row.isActive ? 'opacity-50' : ''}`}>
                <td className="px-4 py-3 text-gray-400 text-xs">{i + 1}</td>
                <td className="px-4 py-3"><span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{row.code}</span></td>
                <td className="px-4 py-3 font-medium text-gray-900">{row.name}</td>
                <td className="px-4 py-3 hidden md:table-cell text-gray-500 text-xs">{row.parent?.name ?? <span className="text-gray-300">—</span>}</td>
                <td className="px-4 py-3 hidden sm:table-cell text-center text-gray-600 text-xs">{row._count?.users ?? 0}</td>
                <td className="px-4 py-3"><Badge variant={row.isActive ? 'green' : 'default'}>{row.isActive ? 'Aktif' : 'Tidak Aktif'}</Badge></td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => { setSelected(row); setShowForm(true) }} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-700 hover:bg-blue-50 transition-colors"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => toggleMut.mutate(row.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-colors">
                      {row.isActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <DeptDialog open={showForm} onClose={() => { setShowForm(false); setSelected(null) }}
        record={showForm ? selected : null} allDepts={rows}
        onSave={(body) => saveMut.mutate(body)} isSaving={saveMut.isPending} />
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 3 — JAWATAN
// ═══════════════════════════════════════════════════════════════════════════════

const EMPTY_POS = { code: '', name: '', level: 0 }

function PosDialog({ open, onClose, record, onSave, isSaving }) {
  const [form, setForm] = useState(EMPTY_POS)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (!open) return
    setForm(record ? { code: record.code, name: record.name, level: record.level ?? 0 } : EMPTY_POS)
    setErrors({})
  }, [open, record])

  function set(f, v) { setForm((p) => ({ ...p, [f]: v })); setErrors((e) => ({ ...e, [f]: undefined })) }

  function handleSubmit(e) {
    e.preventDefault()
    const e2 = {}
    if (!form.code.trim()) e2.code = 'Kod diperlukan'
    if (!form.name.trim()) e2.name = 'Nama diperlukan'
    if (Object.keys(e2).length) { setErrors(e2); return }
    onSave({ code: form.code, name: form.name, level: parseInt(form.level) || 0 })
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogContent className="max-w-md w-full">
        <DialogHeader><DialogTitle>{record ? 'Kemaskini Jawatan' : 'Tambah Jawatan'}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-1">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Kod <span className="text-red-500">*</span></Label>
              <Input value={form.code} onChange={(e) => set('code', e.target.value.toUpperCase())}
                placeholder="Cth: EXE" disabled={!!record} className={`uppercase ${errors.code ? 'border-red-400' : ''}`} />
              {errors.code && <p className="text-xs text-red-500 mt-1">{errors.code}</p>}
            </div>
            <div>
              <Label>Tahap Gred</Label>
              <Input type="number" min="0" value={form.level} onChange={(e) => set('level', e.target.value)} placeholder="0" />
            </div>
          </div>
          <div>
            <Label>Nama Jawatan <span className="text-red-500">*</span></Label>
            <Input value={form.name} onChange={(e) => set('name', e.target.value)}
              placeholder="Nama penuh jawatan..." className={errors.name ? 'border-red-400' : ''} />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Batal</Button>
            <Button type="submit" disabled={isSaving}>{isSaving && <Spinner size={14} />}{record ? 'Simpan' : 'Tambah'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function TabJawatan() {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [selected, setSelected] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['positions'],
    queryFn: () => api.get('/positions').then((r) => r.data.data),
  })
  const rows = data ?? []

  const saveMut = useMutation({
    mutationFn: (body) => selected ? api.put(`/positions/${selected.id}`, body) : api.post('/positions', body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['positions'] }); qc.invalidateQueries({ queryKey: ['users-meta'] }); setShowForm(false); setSelected(null); toast.success(selected ? 'Jawatan dikemaskini' : 'Jawatan ditambah') },
    onError: (err) => toast.error(err.response?.data?.message ?? 'Gagal simpan'),
  })

  const toggleMut = useMutation({
    mutationFn: (id) => api.patch(`/positions/${id}/toggle`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['positions'] }); toast.success('Status dikemaskini') },
    onError: (err) => toast.error(err.response?.data?.message ?? 'Gagal'),
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500"><span className="font-medium text-gray-700">{rows.length}</span> jawatan berdaftar</p>
        <Button onClick={() => { setSelected(null); setShowForm(true) }}><Plus className="w-4 h-4" /> Tambah Jawatan</Button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3 font-medium text-gray-600 w-8">#</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Kod</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Nama Jawatan</th>
              <th className="text-center px-4 py-3 font-medium text-gray-600 hidden sm:table-cell">Tahap</th>
              <th className="text-center px-4 py-3 font-medium text-gray-600 hidden sm:table-cell">Pengguna</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Tindakan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr><td colSpan={7} className="text-center py-12"><Spinner size={20} /></td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-12 text-gray-400 text-sm">Tiada jawatan</td></tr>
            ) : rows.map((row, i) => (
              <tr key={row.id} className={`transition-colors hover:bg-gray-50 ${!row.isActive ? 'opacity-50' : ''}`}>
                <td className="px-4 py-3 text-gray-400 text-xs">{i + 1}</td>
                <td className="px-4 py-3"><span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{row.code}</span></td>
                <td className="px-4 py-3 font-medium text-gray-900">{row.name}</td>
                <td className="px-4 py-3 hidden sm:table-cell text-center text-gray-500 text-xs">{row.level}</td>
                <td className="px-4 py-3 hidden sm:table-cell text-center text-gray-600 text-xs">{row._count?.users ?? 0}</td>
                <td className="px-4 py-3"><Badge variant={row.isActive ? 'green' : 'default'}>{row.isActive ? 'Aktif' : 'Tidak Aktif'}</Badge></td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => { setSelected(row); setShowForm(true) }} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-700 hover:bg-blue-50 transition-colors"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => toggleMut.mutate(row.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-colors">
                      {row.isActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <PosDialog open={showForm} onClose={() => { setShowForm(false); setSelected(null) }}
        record={showForm ? selected : null}
        onSave={(body) => saveMut.mutate(body)} isSaving={saveMut.isPending} />
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 4 — LOG AKTIVITI
// ═══════════════════════════════════════════════════════════════════════════════

function TabLog() {
  const [page, setPage]       = useState(1)
  const [module, setModule]   = useState('')
  const [action, setAction]   = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo]   = useState('')

  const { data: logMeta } = useQuery({
    queryKey: ['activity-logs-meta'],
    queryFn: () => api.get('/activity-logs/meta').then((r) => r.data),
    staleTime: 60_000,
  })

  const { data, isLoading } = useQuery({
    queryKey: ['activity-logs', page, module, action, dateFrom, dateTo],
    queryFn: () => api.get('/activity-logs', { params: { page, limit: 50, module: module || undefined, action: action || undefined, dateFrom: dateFrom || undefined, dateTo: dateTo || undefined } }).then((r) => r.data),
    keepPreviousData: true,
  })

  const rows = data?.data ?? []; const total = data?.total ?? 0; const totalPages = data?.totalPages ?? 1

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">Jumlah <span className="font-medium text-gray-700">{total}</span> rekod aktiviti</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Select value={module} onChange={(e) => { setModule(e.target.value); setPage(1) }} className="w-36">
          <option value="">Semua Modul</option>
          {(logMeta?.modules ?? []).map((m) => <option key={m} value={m}>{MODULE_LABEL[m] ?? m}</option>)}
        </Select>
        <Select value={action} onChange={(e) => { setAction(e.target.value); setPage(1) }} className="w-44">
          <option value="">Semua Tindakan</option>
          {(logMeta?.actions ?? []).map((a) => <option key={a} value={a}>{ACTION_LABEL[a] ?? a}</option>)}
        </Select>
        <div className="flex items-center gap-2">
          <input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1) }}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500" />
          <span className="text-gray-400 text-sm">—</span>
          <input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1) }}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500" />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden sm:table-cell">Masa</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Pengguna</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Tindakan</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Modul</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">Butiran</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden xl:table-cell">IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan={6} className="text-center py-12"><Spinner size={20} /></td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-400 text-sm">Tiada rekod aktiviti</td></tr>
              ) : rows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 hidden sm:table-cell text-gray-400 text-xs whitespace-nowrap">{fmtDateTime(row.createdAt)}</td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-gray-900">{row.userName ?? row.user?.name ?? '—'}</p>
                    <p className="text-xs text-gray-400 font-mono">{row.user?.staffNo}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${ACTION_COLOR[row.action] ?? 'bg-gray-100 text-gray-600'}`}>
                      {ACTION_LABEL[row.action] ?? row.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-gray-500 text-xs">{MODULE_LABEL[row.module] ?? row.module}</td>
                  <td className="px-4 py-3 hidden lg:table-cell text-gray-400 text-xs max-w-[200px] truncate">{row.detail ?? '—'}</td>
                  <td className="px-4 py-3 hidden xl:table-cell text-gray-400 text-xs font-mono">{row.ipAddress ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50">
            <p className="text-xs text-gray-500">Jumlah: <span className="font-medium">{total}</span> rekod</p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage((p) => p - 1)} disabled={page <= 1}
                className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed"><ChevronLeft className="w-4 h-4" /></button>
              <span className="text-xs text-gray-600 px-2">{page} / {totalPages}</span>
              <button onClick={() => setPage((p) => p + 1)} disabled={page >= totalPages}
                className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 5 — PERANAN & KEBENARAN
// ═══════════════════════════════════════════════════════════════════════════════

const PERM_COLS = [
  { key: 'canView',    label: 'Lihat' },
  { key: 'canCreate',  label: 'Cipta' },
  { key: 'canEdit',    label: 'Edit' },
  { key: 'canApprove', label: 'Lulus' },
  { key: 'canDelete',  label: 'Padam' },
]

function buildDefaultPerms(existingPerms) {
  const map = {}
  for (const m of MODULES) {
    const found = existingPerms?.find((p) => p.module === m)
    map[m] = { canView: false, canCreate: false, canEdit: false, canApprove: false, canDelete: false, ...found }
  }
  return map
}

function TabPeranan() {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ['permissions'],
    queryFn: () => api.get('/permissions').then((r) => r.data.data),
  })
  const roles = data ?? []

  const [activeRole, setActiveRole] = useState(null)
  const [perms, setPerms]           = useState({})
  const [dirty, setDirty]           = useState(false)

  useEffect(() => {
    if (roles.length && !activeRole) setActiveRole(roles[0])
  }, [roles])

  useEffect(() => {
    if (activeRole) { setPerms(buildDefaultPerms(activeRole.permissions)); setDirty(false) }
  }, [activeRole])

  function toggle(module, col) {
    setPerms((p) => ({ ...p, [module]: { ...p[module], [col]: !p[module][col] } }))
    setDirty(true)
  }

  const saveMut = useMutation({
    mutationFn: () => {
      const body = MODULES.map((m) => ({ module: m, ...perms[m] }))
      return api.put(`/permissions/${activeRole.id}`, body)
    },
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['permissions'] })
      setActiveRole(res.data.data)
      setDirty(false)
      toast.success('Kebenaran dikemaskini')
    },
    onError: (err) => toast.error(err.response?.data?.message ?? 'Gagal simpan'),
  })

  if (isLoading) return <div className="flex justify-center py-20"><Spinner size={24} /></div>

  return (
    <div className="space-y-4">
      {/* Role tabs */}
      <div className="flex flex-wrap gap-2">
        {roles.map((r) => (
          <button key={r.id} onClick={() => { if (dirty && !confirm('Perubahan belum disimpan. Teruskan?')) return; setActiveRole(r) }}
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${activeRole?.id === r.id ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'}`}>
            {r.name}
          </button>
        ))}
      </div>

      {activeRole && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div>
              <p className="font-semibold text-gray-900">{activeRole.name}</p>
              <p className="text-xs text-gray-400 mt-0.5">Urus kebenaran akses setiap modul</p>
            </div>
            <Button onClick={() => saveMut.mutate()} disabled={!dirty || saveMut.isPending} size="sm">
              {saveMut.isPending ? <Spinner size={14} /> : <Save className="w-4 h-4" />} Simpan
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-5 py-3 font-medium text-gray-600 w-40">Modul</th>
                  {PERM_COLS.map((c) => (
                    <th key={c.key} className="text-center px-4 py-3 font-medium text-gray-600 w-20">{c.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {MODULES.map((m) => (
                  <tr key={m} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 font-medium text-gray-700">{MODULE_LABEL[m] ?? m}</td>
                    {PERM_COLS.map((c) => (
                      <td key={c.key} className="px-4 py-3 text-center">
                        <input type="checkbox"
                          checked={perms[m]?.[c.key] ?? false}
                          onChange={() => toggle(m, c.key)}
                          className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer" />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════

export default function Tetapan() {
  const [searchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') ?? 'pengguna'

  const { data: meta } = useQuery({
    queryKey: ['users-meta'],
    queryFn: () => api.get('/users/meta').then((r) => r.data),
    staleTime: 300_000,
  })

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-[1400px] mx-auto">
      <div>
        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-green-600" /> Tetapan Sistem
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">Urus pengguna, jabatan, jawatan, kebenaran dan log aktiviti</p>
      </div>

      {activeTab === 'pengguna' && <TabPengguna meta={meta} />}
      {activeTab === 'jabatan'  && <TabJabatan />}
      {activeTab === 'jawatan'  && <TabJawatan />}
      {activeTab === 'log'      && <TabLog />}
      {activeTab === 'peranan'  && <TabPeranan />}
    </div>
  )
}
