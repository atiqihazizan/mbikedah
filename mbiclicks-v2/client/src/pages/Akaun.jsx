import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  Search, Plus, Pencil, Trash2, ToggleLeft, ToggleRight,
  RefreshCw, ChevronLeft, ChevronRight, BookOpen, CheckCircle2, PlusCircle, Database, AlertTriangle,
} from 'lucide-react'
import api from '@/lib/api'
import {
  Button, Badge, Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter, Input, Label, Select, Spinner,
} from '@/components/ui'

// ─── helpers ─────────────────────────────────────────────────────────────────

function fmtDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('ms-MY', { day: 'numeric', month: 'short', year: 'numeric' })
}

const TYPE_CFG = {
  HASIL:   { label: 'Hasil',   variant: 'green' },
  BELANJA: { label: 'Belanja', variant: 'red'   },
}

// mode: 'root' | 'child' | 'edit'
// parentRow: row induk (untuk mode child)
// record: row semasa (untuk mode edit)
// allRows: semua akaun (untuk cari level induk semasa edit)

function AkaunDialog({ open, onClose, mode, parentRow, record, allRows, onSave, isSaving }) {
  const isEdit  = mode === 'edit'
  const isChild = mode === 'child'

  const initForm = () => {
    if (isEdit && record) {
      return {
        accNo:       record.accNo,
        name:        record.name,
        accType:     record.accType,
        parentAccNo: record.parentAccNo ?? '',
        level:       record.level ?? 0,
      }
    }
    if (isChild && parentRow) {
      return {
        accNo:       '',
        name:        '',
        accType:     parentRow.accType,
        parentAccNo: parentRow.accNo,
        level:       (parentRow.level ?? 0) + 1,
      }
    }
    // root
    return { accNo: '', name: '', accType: 'BELANJA', parentAccNo: '', level: 0 }
  }

  const [form, setForm]     = useState(initForm)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (!open) return
    setForm(initForm())
    setErrors({})
  }, [open, mode, parentRow, record])

  function set(f, v) {
    setForm((p) => {
      const next = { ...p, [f]: v }
      // Auto-kira level bila parentAccNo berubah (edit sahaja)
      if (f === 'parentAccNo') {
        const trimmed = v.trim().toUpperCase()
        if (!trimmed) {
          next.level = 0
        } else {
          const parentAcc = allRows?.find((r) => r.accNo === trimmed)
          next.level = parentAcc ? (parentAcc.level ?? 0) + 1 : p.level
        }
      }
      return next
    })
    setErrors((e) => ({ ...e, [f]: undefined }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    const e2 = {}
    if (!form.accNo.trim()) e2.accNo = 'Kod akaun diperlukan'
    if (!form.name.trim())  e2.name  = 'Nama akaun diperlukan'
    if (Object.keys(e2).length) { setErrors(e2); return }
    onSave({
      accNo:       form.accNo.trim().toUpperCase(),
      name:        form.name.trim(),
      accType:     form.accType,
      parentAccNo: form.parentAccNo.trim() || null,
      level:       parseInt(form.level) || 0,
    })
  }

  const title = isEdit ? 'Kemaskini Kod Akaun' : isChild ? `Tambah Akaun Bawah — ${parentRow?.accNo}` : 'Tambah Akaun Induk'

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogContent className="max-w-lg w-full">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {isChild && (
            <p className="text-xs text-gray-400 mt-1">
              Induk: <span className="font-mono text-gray-600">{parentRow?.accNo}</span> — {parentRow?.name}
              <span className="ml-2 text-green-600">Tahap {(parentRow?.level ?? 0) + 1}</span>
            </p>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-1">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Kod Akaun <span className="text-red-500">*</span></Label>
              <Input
                value={form.accNo}
                onChange={(e) => set('accNo', e.target.value.toUpperCase())}
                placeholder={isChild ? `Cth: ${parentRow?.accNo?.split('/')[0]}/101` : 'Cth: 9100/000'}
                disabled={isEdit}
                autoFocus
                className={`font-mono uppercase ${errors.accNo ? 'border-red-400' : ''}`}
              />
              {errors.accNo && <p className="text-xs text-red-500 mt-1">{errors.accNo}</p>}
            </div>
            <div>
              <Label>Jenis <span className="text-red-500">*</span></Label>
              <Select value={form.accType} onChange={(e) => set('accType', e.target.value)}>
                <option value="HASIL">Hasil</option>
                <option value="BELANJA">Belanja</option>
              </Select>
            </div>
          </div>

          <div>
            <Label>Nama Akaun <span className="text-red-500">*</span></Label>
            <Input
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="Nama penuh akaun..."
              className={errors.name ? 'border-red-400' : ''}
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>

          {/* Induk & Tahap — edit sahaja (child & root auto-filled) */}
          {isEdit && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Kod Induk <span className="text-gray-400 font-normal">(pilihan)</span></Label>
                <Input
                  value={form.parentAccNo}
                  onChange={(e) => set('parentAccNo', e.target.value.toUpperCase())}
                  placeholder="Cth: 9100/000"
                  className="font-mono uppercase"
                />
                <p className="text-xs text-gray-400 mt-1">Kosongkan jika akaun induk</p>
              </div>
              <div>
                <Label>Tahap <span className="text-gray-400 font-normal">(auto)</span></Label>
                <div className="flex items-center h-[42px] px-3 rounded-lg border border-gray-200 bg-gray-50">
                  <span className="text-sm font-medium text-gray-700">{form.level}</span>
                  <span className="text-xs text-gray-400 ml-2">— dikira auto dari induk</span>
                </div>
              </div>
            </div>
          )}

          {/* Paparan sahaja untuk child */}
          {isChild && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 bg-green-50 border border-green-100 rounded-lg px-3 py-2.5">
                <div className="text-xs text-green-700 space-x-4">
                  <span>Induk: <span className="font-mono font-medium">{form.parentAccNo}</span></span>
                  <span>Tahap: <span className="font-medium">{form.level}</span></span>
                </div>
              </div>
              {!parentRow?.isGroup && (
                <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5 text-xs text-amber-800">
                  <AlertTriangle size={13} className="shrink-0 mt-0.5" />
                  <span>
                    Akaun <span className="font-mono font-semibold">{parentRow?.accNo}</span> akan bertukar menjadi{' '}
                    <strong>Akaun Kumpulan</strong>. Nilai bajet induk akan dikira secara automatik
                    daripada jumlah semua akaun anak dan tidak boleh diedit secara manual.
                  </span>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Batal</Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving && <Spinner size={14} />}
              {isEdit ? 'Simpan Perubahan' : 'Tambah Akaun'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ─── Dialog konfirmasi padam ──────────────────────────────────────────────────

function DeleteDialog({ open, onClose, record, onConfirm, isDeleting }) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogContent className="max-w-sm w-full">
        <DialogHeader><DialogTitle>Padam Kod Akaun</DialogTitle></DialogHeader>
        <div className="mt-2 space-y-2">
          <p className="text-sm text-gray-600">
            Padam kod akaun{' '}
            <span className="font-mono font-semibold text-gray-900">{record?.accNo}</span>{' '}
            <span className="text-gray-700">— {record?.name}</span>?
          </p>
          <p className="text-xs text-red-600">Tindakan ini tidak boleh dibatalkan.</p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Batal</Button>
          <Button variant="destructive" disabled={isDeleting} onClick={onConfirm}>
            {isDeleting && <Spinner size={14} />} Padam
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Dialog keputusan sync ────────────────────────────────────────────────────

function SyncResultDialog({ open, onClose, result }) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogContent className="max-w-sm w-full">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" /> Sync Berjaya
          </DialogTitle>
        </DialogHeader>
        <div className="mt-3 grid grid-cols-3 gap-3 text-center">
          {[
            { label: 'Ditambah', value: result?.inserted, color: 'text-green-600' },
            { label: 'Dikemaskini', value: result?.updated,  color: 'text-blue-600' },
            { label: 'Tiada Ubah', value: result?.skipped,  color: 'text-gray-400' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-gray-50 rounded-lg p-3">
              <p className={`text-2xl font-bold ${color}`}>{value ?? 0}</p>
              <p className="text-xs text-gray-500 mt-1">{label}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 text-center mt-2">
          {result?.source === 'file' ? 'Sumber: File account.json' : 'Sumber: AutoCount'} · {result?.total ?? 0} rekod
        </p>
        <DialogFooter>
          <Button onClick={onClose} className="w-full">Tutup</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Akaun() {
  const qc = useQueryClient()

  const [page,       setPage]       = useState(1)
  const [search,     setSearch]     = useState('')
  const [dSearch,    setDSearch]    = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [status,     setStatus]     = useState('active')

  // dialog: { mode: 'root'|'child'|'edit', parentRow?, record? }
  const [dialog,       setDialog]       = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [syncResult,   setSyncResult]   = useState(null)

  function openRoot()        { setDialog({ mode: 'root' }) }
  function openChild(row)    { setDialog({ mode: 'child', parentRow: row }) }
  function openEdit(row)     { setDialog({ mode: 'edit',  record: row }) }
  function closeDialog()     { setDialog(null) }

  useEffect(() => {
    const t = setTimeout(() => { setDSearch(search); setPage(1) }, 400)
    return () => clearTimeout(t)
  }, [search])

  const { data, isLoading } = useQuery({
    queryKey: ['accounts', page, dSearch, typeFilter, status],
    queryFn: () => api.get('/accounts', {
      params: { page, limit: 50, search: dSearch || undefined, type: typeFilter || undefined, status: status || undefined },
    }).then((r) => r.data),
    keepPreviousData: true,
  })

  const rows       = data?.data ?? []
  const total      = data?.total ?? 0
  const totalPages = data?.totalPages ?? 1
  const hasil      = data?.totalHasil ?? 0
  const belanja    = data?.totalBelanja ?? 0

  const saveMut = useMutation({
    mutationFn: (body) => dialog?.mode === 'edit'
      ? api.put(`/accounts/${dialog.record.id}`, body)
      : api.post('/accounts', body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['accounts'] })
      closeDialog()
      toast.success(dialog?.mode === 'edit' ? 'Kod akaun dikemaskini' : 'Kod akaun ditambah')
    },
    onError: (err) => toast.error(err.response?.data?.message ?? 'Gagal simpan'),
  })

  const toggleMut = useMutation({
    mutationFn: (id) => api.patch(`/accounts/${id}/toggle`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['accounts'] }); toast.success('Status dikemaskini') },
    onError: (err) => toast.error(err.response?.data?.message ?? 'Gagal'),
  })

  const deleteMut = useMutation({
    mutationFn: (id) => api.delete(`/accounts/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['accounts'] })
      setDeleteTarget(null)
      toast.success('Kod akaun dipadam')
    },
    onError: (err) => toast.error(err.response?.data?.message ?? 'Gagal padam'),
  })

  const syncMut = useMutation({
    mutationFn: () => api.post('/accounts/sync'),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['accounts'] })
      setSyncResult(res.data)
    },
    onError: (err) => toast.error(err.response?.data?.message ?? 'Sync gagal'),
  })

  const syncFileMut = useMutation({
    mutationFn: () => api.post('/accounts/sync-file'),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['accounts'] })
      setSyncResult({ ...res.data, source: 'file' })
    },
    onError: (err) => toast.error(err.response?.data?.message ?? 'Sync dari file gagal'),
  })

  const [actualYear, setActualYear] = useState(new Date().getFullYear())
  const syncActualMut = useMutation({
    mutationFn: () => api.post('/autocount/sync-actuals', { year: actualYear }),
    onSuccess: (res) => toast.success(res.data?.message ?? 'Data sebenar disegerakkan'),
    onError:   (err) => toast.error(err.response?.data?.message ?? 'Sync data sebenar gagal'),
  })

  const { data: syncStatus } = useQuery({
    queryKey: ['autocount-status'],
    queryFn:  () => api.get('/autocount/status').then((r) => r.data),
    staleTime: 30_000,
  })

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-[1400px] mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-green-600" /> Pengurusan Kod Akaun
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Urus kod akaun GL untuk penjanaan laporan dan bajet
          </p>
        </div>
        <div className="flex gap-2 self-start sm:self-auto">
          <Button onClick={openRoot}>
            <Plus className="w-4 h-4" /> Tambah Akaun Induk
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Jumlah Akaun', value: total,   color: 'text-gray-900' },
          { label: 'Hasil',         value: hasil,   color: 'text-green-700' },
          { label: 'Belanja',       value: belanja, color: 'text-red-700'   },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 px-4 py-3 shadow-sm">
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* AutoCount Sync Panel */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <Database className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-semibold text-gray-700">Segerak dari AutoCount</h3>
          {syncStatus?.apiUrl && (
            <span className="text-xs text-gray-400 font-mono">{syncStatus.apiUrl}</span>
          )}
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {/* Sync Kod Akaun */}
          <div className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-gray-700">Kod Akaun (GL)</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {syncStatus?.accounts?.lastSync
                  ? `Terakhir: ${new Date(syncStatus.accounts.lastSync).toLocaleDateString('ms-MY')} · ${syncStatus.accounts.count} rekod`
                  : 'Belum pernah sync'}
              </p>
            </div>
            <Button size="sm" variant="outline" onClick={() => syncMut.mutate()} disabled={syncMut.isPending}>
              {syncMut.isPending ? <Spinner size={14} /> : <RefreshCw className="w-3.5 h-3.5" />}
              {syncMut.isPending ? 'Menyegerak...' : 'Sync'}
            </Button>
          </div>

          {/* Sync Data Sebenar */}
          <div className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-gray-700">Data Sebenar (Trial Balance)</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {syncStatus?.actuals?.lastSync
                  ? `Terakhir: ${new Date(syncStatus.actuals.lastSync).toLocaleDateString('ms-MY')} · Tahun ${syncStatus.actuals.year}`
                  : 'Belum pernah sync'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={actualYear}
                onChange={(e) => setActualYear(+e.target.value)}
                className="text-xs border border-gray-200 rounded-md px-2 py-1.5 bg-white"
              >
                {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
              <Button size="sm" variant="outline" onClick={() => syncActualMut.mutate()} disabled={syncActualMut.isPending}>
                {syncActualMut.isPending ? <Spinner size={14} /> : <RefreshCw className="w-3.5 h-3.5" />}
                {syncActualMut.isPending ? 'Menyegerak...' : 'Sync'}
              </Button>
            </div>
          </div>

          {/* Sync dari File JSON */}
          <div className="flex items-center justify-between rounded-lg border border-amber-100 bg-amber-50 px-4 py-3 sm:col-span-2">
            <div>
              <p className="text-sm font-medium text-gray-700">Kod Akaun (File JSON)</p>
              <p className="text-xs text-gray-400 mt-0.5">Segerak dari <span className="font-mono">account.json</span> dalam server — set aktif=true untuk semua akaun</p>
            </div>
            <Button size="sm" variant="outline" onClick={() => syncFileMut.mutate()} disabled={syncFileMut.isPending}>
              {syncFileMut.isPending ? <Spinner size={14} /> : <RefreshCw className="w-3.5 h-3.5" />}
              {syncFileMut.isPending ? 'Menyegerak...' : 'Sync File'}
            </Button>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Cari kod atau nama akaun..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full rounded-lg border border-gray-300 bg-white pl-9 pr-3 py-2.5 text-sm
              focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
          />
        </div>
        <Select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1) }} className="w-full sm:w-36">
          <option value="">Semua Jenis</option>
          <option value="HASIL">Hasil</option>
          <option value="BELANJA">Belanja</option>
        </Select>
        <Select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1) }} className="w-full sm:w-36">
          <option value="">Semua Status</option>
          <option value="active">Aktif</option>
          <option value="inactive">Tidak Aktif</option>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-medium text-gray-600 w-8">#</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Kod Akaun</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Nama Akaun</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Jenis</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Kod Induk</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600 hidden sm:table-cell">Tahap</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">Sync Akhir</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan={9} className="text-center py-16"><Spinner size={20} /></td></tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-16">
                    <BookOpen className="mx-auto mb-2 text-gray-300" size={32} />
                    <p className="text-gray-400 text-sm">Tiada kod akaun dijumpai</p>
                  </td>
                </tr>
              ) : rows.map((row, i) => (
                <tr key={row.id} className={`transition-colors hover:bg-gray-50 ${!row.isActive ? 'opacity-50' : ''}`}>
                  <td className="px-4 py-3 text-gray-400 text-xs">{(page - 1) * 50 + i + 1}</td>

                  {/* Kod */}
                  <td className="px-4 py-3">
                    <span className="font-mono text-sm font-semibold text-gray-900">{row.accNo}</span>
                  </td>

                  {/* Nama */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2" style={{ paddingLeft: `${(row.level ?? 0) * 12}px` }}>
                      <p className="text-gray-800 text-sm">{row.name}</p>
                      <span className={`shrink-0 text-[10px] px-1.5 py-0.5 rounded font-medium ${
                        row.isGroup
                          ? 'bg-blue-50 text-blue-600 border border-blue-200'
                          : 'bg-gray-100 text-gray-400 border border-gray-200'
                      }`}>
                        {row.isGroup ? 'Kumpulan' : 'Tunggal'}
                      </span>
                    </div>
                  </td>

                  {/* Jenis */}
                  <td className="px-4 py-3">
                    <Badge variant={TYPE_CFG[row.accType]?.variant ?? 'default'}>
                      {TYPE_CFG[row.accType]?.label ?? row.accType}
                    </Badge>
                  </td>

                  {/* Induk */}
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="font-mono text-xs text-gray-400">{row.parentAccNo ?? '—'}</span>
                  </td>

                  {/* Tahap */}
                  <td className="px-4 py-3 hidden sm:table-cell text-center text-gray-400 text-xs">{row.level ?? 0}</td>

                  {/* Sync */}
                  <td className="px-4 py-3 hidden lg:table-cell text-gray-400 text-xs">{fmtDate(row.syncedAt)}</td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <Badge variant={row.isActive ? 'green' : 'default'}>
                      {row.isActive ? 'Aktif' : 'Tidak Aktif'}
                    </Badge>
                  </td>

                  {/* Tindakan */}
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openChild(row)} title="Tambah akaun anak"
                        className="p-1.5 rounded-lg text-gray-400 hover:text-green-700 hover:bg-green-50 transition-colors">
                        <PlusCircle className="w-4 h-4" />
                      </button>
                      <button onClick={() => openEdit(row)} title="Edit"
                        className="p-1.5 rounded-lg text-gray-400 hover:text-blue-700 hover:bg-blue-50 transition-colors">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => toggleMut.mutate(row.id)} title={row.isActive ? 'Nyahaktif' : 'Aktifkan'}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-colors">
                        {row.isActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                      </button>
                      <button onClick={() => setDeleteTarget(row)} title="Padam"
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                        <Trash2 className="w-4 h-4" />
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
            <p className="text-xs text-gray-500">Jumlah: <span className="font-medium">{total}</span> kod akaun</p>
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

      {/* Dialogs */}
      <AkaunDialog
        open={!!dialog}
        onClose={closeDialog}
        mode={dialog?.mode}
        parentRow={dialog?.parentRow}
        record={dialog?.record}
        allRows={rows}
        onSave={(body) => saveMut.mutate(body)}
        isSaving={saveMut.isPending}
      />
      <DeleteDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        record={deleteTarget}
        onConfirm={() => deleteMut.mutate(deleteTarget.id)}
        isDeleting={deleteMut.isPending}
      />
      <SyncResultDialog
        open={!!syncResult}
        onClose={() => setSyncResult(null)}
        result={syncResult}
      />
    </div>
  )
}
