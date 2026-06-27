import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ChevronLeft, ChevronRight, Plus, Calendar, MapPin,
  Video, Clock, Trash2, Pencil, Download, ExternalLink, X, Link2, Check,
} from 'lucide-react'
import { toast } from 'sonner'
import api from '@/lib/api'
import { useAuthStore } from '@/store/auth'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
  Button,
} from '@/components/ui'

// ─── Warna acara ─────────────────────────────────────────────────────────────
const COLORS = [
  { key: 'blue',   bg: 'bg-blue-500',   pill: 'bg-blue-100 text-blue-800',   dot: 'bg-blue-500'   },
  { key: 'green',  bg: 'bg-green-500',  pill: 'bg-green-100 text-green-800', dot: 'bg-green-500'  },
  { key: 'red',    bg: 'bg-red-500',    pill: 'bg-red-100 text-red-800',     dot: 'bg-red-500'    },
  { key: 'orange', bg: 'bg-orange-500', pill: 'bg-orange-100 text-orange-800',dot: 'bg-orange-500'},
  { key: 'purple', bg: 'bg-purple-500', pill: 'bg-purple-100 text-purple-800',dot: 'bg-purple-500'},
  { key: 'pink',   bg: 'bg-pink-500',   pill: 'bg-pink-100 text-pink-800',   dot: 'bg-pink-500'   },
]
const colorCfg = (key) => COLORS.find((c) => c.key === key) ?? COLORS[0]

// ─── Helpers ─────────────────────────────────────────────────────────────────
const DAYS_MY = ['Ahd', 'Isn', 'Sel', 'Rab', 'Kha', 'Jum', 'Sab']
const MONTHS_MY = ['Januari','Februari','Mac','April','Mei','Jun','Julai','Ogos','September','Oktober','November','Disember']

function fmtTime(d) {
  return new Date(d).toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit', hour12: false })
}
function fmtDate(d) {
  const dt = new Date(d)
  return `${dt.getDate()} ${MONTHS_MY[dt.getMonth()]} ${dt.getFullYear()}`
}
function fmtDateTimeLocal(d) {
  if (!d) return ''
  const dt = new Date(d)
  const pad = (n) => String(n).padStart(2,'0')
  return `${dt.getFullYear()}-${pad(dt.getMonth()+1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`
}
function googleCalUrl(ev) {
  const fmt = (d) => new Date(d).toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'')
  const p = new URLSearchParams({
    action:   'TEMPLATE',
    text:     ev.title,
    dates:    `${fmt(ev.startAt)}/${fmt(ev.endAt)}`,
    details:  [ev.description, ev.meetLink ? `\nLink: ${ev.meetLink}` : ''].filter(Boolean).join(''),
    location: ev.location ?? '',
  })
  if (ev.meetLink) p.set('add_video_conferencing', '1')
  return `https://calendar.google.com/calendar/render?${p.toString()}`
}

// ─── Dialog cipta/edit ───────────────────────────────────────────────────────
const EMPTY = {
  title: '', description: '', location: '', meetLink: '',
  color: 'blue', startAt: '', endAt: '', isAllDay: false,
  departmentId: null, isPublic: true, inviteeIds: [],
}

function EventDialog({ open, onClose, record, defaultDate, onSave, isSaving, staffList = [] }) {
  const isEdit = !!record
  const [f, setF] = useState(EMPTY)

  useEffect(() => {
    if (!open) return
    if (record) {
      setF({
        ...record,
        startAt: fmtDateTimeLocal(record.startAt),
        endAt: fmtDateTimeLocal(record.endAt),
        meetLink: record.meetLink ?? '',
        departmentId: record.departmentId ?? null,
        inviteeIds: record.invitees?.map((i) => i.userId) ?? [],
      })
    } else {
      setF({ ...EMPTY, startAt: defaultDate ? `${defaultDate}T08:00` : '', endAt: defaultDate ? `${defaultDate}T09:00` : '' })
    }
  }, [open, record, defaultDate])

  const set = (k, v) => setF((p) => ({ ...p, [k]: v }))

  function toggleInvitee(id) {
    setF((p) => ({
      ...p,
      inviteeIds: p.inviteeIds.includes(id)
        ? p.inviteeIds.filter((i) => i !== id)
        : [...p.inviteeIds, id],
    }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!f.title.trim()) return toast.error('Tajuk acara diperlukan')
    if (!f.startAt)       return toast.error('Tarikh mula diperlukan')
    if (!f.endAt)         return toast.error('Tarikh tamat diperlukan')
    if (new Date(f.endAt) <= new Date(f.startAt)) return toast.error('Tarikh tamat mesti selepas tarikh mula')
    onSave({
      ...f,
      meetLink:    f.meetLink.trim() || null,
      description: f.description.trim() || null,
      location:    f.location.trim() || null,
      startAt:     new Date(f.startAt).toISOString(),
      endAt:       new Date(f.endAt).toISOString(),
    })
  }

  return (
    <Dialog open={open} onClose={onClose} className="max-w-lg">
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Kemaskini Acara' : 'Tambah Acara Baharu'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Tajuk */}
          <div>
            <label className="text-sm font-medium text-gray-700">Tajuk *</label>
            <input value={f.title} onChange={(e) => set('title', e.target.value)}
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Tajuk acara" required />
          </div>

          {/* Tarikh & masa */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700">Mula *</label>
              <input type="datetime-local" value={f.startAt}
                min={fmtDateTimeLocal(new Date(new Date().getFullYear(), new Date().getMonth(), 1))}
                onChange={(e) => { set('startAt', e.target.value); if (f.endAt && e.target.value >= f.endAt) set('endAt', '') }}
                className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" required />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Tamat *</label>
              <input type="datetime-local" value={f.endAt}
                min={f.startAt || fmtDateTimeLocal(new Date(new Date().getFullYear(), new Date().getMonth(), 1))}
                onChange={(e) => set('endAt', e.target.value)}
                className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" required />
            </div>
          </div>

          {/* Lokasi */}
          <div>
            <label className="text-sm font-medium text-gray-700">Lokasi</label>
            <input value={f.location} onChange={(e) => set('location', e.target.value)}
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Bilik mesyuarat / alamat" />
          </div>

          {/* Link meeting */}
          <div>
            <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
              <Video className="w-3.5 h-3.5 text-blue-500" /> Link Mesyuarat (Google Meet / Zoom)
            </label>
            <input value={f.meetLink} onChange={(e) => set('meetLink', e.target.value)}
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="https://meet.google.com/..." />
          </div>

          {/* Deskripsi */}
          <div>
            <label className="text-sm font-medium text-gray-700">Deskripsi</label>
            <textarea value={f.description} onChange={(e) => set('description', e.target.value)} rows={2}
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
              placeholder="Penerangan acara (pilihan)" />
          </div>

          {/* Warna */}
          <div>
            <label className="text-sm font-medium text-gray-700">Warna</label>
            <div className="flex gap-2 mt-1.5">
              {COLORS.map((c) => (
                <button key={c.key} type="button" onClick={() => set('color', c.key)}
                  className={`w-7 h-7 rounded-full ${c.bg} transition-transform ${f.color === c.key ? 'ring-2 ring-offset-2 ring-gray-500 scale-110' : 'opacity-60 hover:opacity-100'}`} />
              ))}
            </div>
          </div>

          {/* Jemput staff */}
          {staffList.length > 0 && (
            <div>
              <label className="text-sm font-medium text-gray-700">
                Jemput Staff <span className="text-gray-400 font-normal">(email + notifikasi dihantar)</span>
              </label>
              <div className="mt-1.5 max-h-36 overflow-y-auto border rounded-lg divide-y divide-gray-50">
                {staffList.map((s) => (
                  <label key={s.id} className="flex items-center gap-2.5 px-3 py-2 hover:bg-gray-50 cursor-pointer">
                    <input type="checkbox" checked={f.inviteeIds.includes(s.id)}
                      onChange={() => toggleInvitee(s.id)}
                      className="w-3.5 h-3.5 accent-green-600" />
                    <div className="min-w-0">
                      <p className="text-sm text-gray-800 truncate">{s.name}</p>
                      <p className="text-xs text-gray-400 truncate">{s.email ?? 'Tiada email'}</p>
                    </div>
                  </label>
                ))}
              </div>
              {f.inviteeIds.length > 0 && (
                <p className="text-xs text-green-600 mt-1">{f.inviteeIds.length} staff akan dijemput</p>
              )}
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Batal</Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Menyimpan…' : isEdit ? 'Kemaskini' : 'Simpan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ─── Dialog detail acara ─────────────────────────────────────────────────────
function EventDetailDialog({ event, open, onClose, onEdit, onDelete, currentUserId, isAdmin }) {
  if (!event) return null
  const cfg = colorCfg(event.color)
  const canEdit = event.createdById === currentUserId || isAdmin

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <div className={`w-3 h-3 rounded-full mt-1.5 shrink-0 ${cfg.dot}`} />
            <DialogTitle className="text-base leading-snug">{event.title}</DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-3 py-1 text-sm">
          {/* Tarikh & masa */}
          <div className="flex items-start gap-2 text-gray-600">
            <Clock className="w-4 h-4 mt-0.5 shrink-0" />
            <div>
              <p>{fmtDate(event.startAt)} · {fmtTime(event.startAt)}</p>
              <p className="text-gray-400">hingga {fmtDate(event.endAt)} · {fmtTime(event.endAt)}</p>
            </div>
          </div>

          {/* Lokasi */}
          {event.location && (
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="w-4 h-4 shrink-0" />
              <span>{event.location}</span>
            </div>
          )}

          {/* Link meeting */}
          {event.meetLink && (
            <div className="flex items-center gap-2">
              <Video className="w-4 h-4 shrink-0 text-blue-500" />
              <a href={event.meetLink} target="_blank" rel="noreferrer"
                className="text-blue-600 hover:underline truncate">{event.meetLink}</a>
            </div>
          )}

          {/* Deskripsi */}
          {event.description && (
            <p className="text-gray-600 bg-gray-50 rounded-lg px-3 py-2 text-sm">{event.description}</p>
          )}

          {/* Dicipta oleh */}
          <p className="text-xs text-gray-400">Dicipta oleh: {event.createdBy?.name}</p>
        </div>

        {/* Butang hantar ke kalendar */}
        <div className="flex flex-col gap-2 pt-2 border-t">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Tambah ke Kalendar Anda</p>
          <div className="flex gap-2 flex-wrap">
            <a href={googleCalUrl(event)} target="_blank" rel="noreferrer"
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors font-medium">
              <ExternalLink className="w-3.5 h-3.5" />
              Google Calendar
            </a>
            <a href={`/api/events/${event.id}/ics`} download
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors font-medium">
              <Download className="w-3.5 h-3.5" />
              Muat Turun .ics
            </a>
          </div>
        </div>

        <DialogFooter>
          {canEdit && (
            <>
              <Button variant="outline" size="sm" onClick={onEdit} className="gap-1.5">
                <Pencil className="w-3.5 h-3.5" /> Edit
              </Button>
              <Button variant="destructive" size="sm" onClick={onDelete} className="gap-1.5">
                <Trash2 className="w-3.5 h-3.5" /> Padam
              </Button>
            </>
          )}
          <Button variant="outline" size="sm" onClick={onClose}>Tutup</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Panel subscribe auto-sync ───────────────────────────────────────────────
const CAL_FEED_KEY = 'mbi_cal_feed_url'

function SubscribePanel() {
  const [feedUrl, setFeedUrl]     = useState(() => localStorage.getItem(CAL_FEED_KEY) ?? null)
  const [loading, setLoading]     = useState(false)
  const [copied, setCopied]       = useState(false)

  async function getSubscribeUrl() {
    setLoading(true)
    try {
      const { data } = await api.get('/events/subscribe-token')
      setFeedUrl(data.feedUrl)
      localStorage.setItem(CAL_FEED_KEY, data.feedUrl)
    } catch {
      toast.error('Gagal jana pautan langganan')
    } finally {
      setLoading(false)
    }
  }

  function resetSubscription() {
    localStorage.removeItem(CAL_FEED_KEY)
    setFeedUrl(null)
  }

  async function copyUrl() {
    await navigator.clipboard.writeText(feedUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const webcalUrl = feedUrl?.replace(/^https?:\/\//, 'webcal://')

  return (
    <div className="bg-green-50 rounded-xl border border-green-100 px-4 py-4 space-y-3">
      <div>
        <p className="text-sm font-semibold text-green-800 flex items-center gap-1.5">
          <Calendar className="w-4 h-4" /> Auto-sync ke Kalendar Telefon
        </p>
        <p className="text-xs text-green-700 mt-0.5">
          Subscribe sekali, semua acara baru akan masuk automatik ke Google Calendar / Apple Calendar anda
        </p>
      </div>

      {!feedUrl ? (
        <button onClick={getSubscribeUrl} disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 disabled:opacity-60 transition-colors">
          <Link2 className="w-3.5 h-3.5" />
          {loading ? 'Jana pautan…' : 'Jana Pautan Langganan'}
        </button>
      ) : (
        <div className="space-y-2">
          {/* Copy URL */}
          <div className="flex items-center gap-1.5">
            <input readOnly value={feedUrl} onClick={(e) => e.target.select()}
              className="flex-1 text-[10px] bg-white border border-green-200 rounded-lg px-2 py-1.5 text-gray-600 font-mono truncate" />
            <button onClick={copyUrl}
              className={`shrink-0 p-1.5 rounded-lg transition-colors ${copied ? 'bg-green-600 text-white' : 'bg-white border border-green-200 text-green-700 hover:bg-green-100'}`}>
              {copied ? <Check className="w-3.5 h-3.5" /> : <Link2 className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Butang Google Calendar */}
          <a href={`https://calendar.google.com/calendar/r?cid=${encodeURIComponent(feedUrl)}`}
            target="_blank" rel="noreferrer"
            className="flex items-center justify-center gap-2 py-2 px-3 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors">
            <ExternalLink className="w-3.5 h-3.5" />
            Buka di Google Calendar
          </a>

          {/* Butang Apple Calendar (webcal) */}
          <a href={webcalUrl}
            className="flex items-center justify-center gap-2 py-2 px-3 bg-gray-700 text-white text-xs font-medium rounded-lg hover:bg-gray-800 transition-colors">
            <Download className="w-3.5 h-3.5" />
            Subscribe (Apple / Outlook)
          </a>

          <p className="text-[10px] text-green-600 text-center">
            Refresh automatik setiap ~24 jam oleh Google Calendar
          </p>
          <button onClick={resetSubscription}
            className="w-full text-[10px] text-gray-400 hover:text-red-500 transition-colors text-center py-0.5">
            Jana semula pautan baru
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Halaman utama ────────────────────────────────────────────────────────────
export default function Kalendar() {
  const user    = useAuthStore((s) => s.user)
  const hasRole = useAuthStore((s) => s.hasRole)
  const isAdmin = hasRole('admin')
  const qc      = useQueryClient()

  const today = new Date()
  const [viewDate, setViewDate] = useState({ year: today.getFullYear(), month: today.getMonth() + 1 })
  const [dialog, setDialog]       = useState(null) // { mode: 'create'|'edit'|'detail', event?, defaultDate? }

  // ── Fetch events ───────────────────────────────────────────────────────────
  const { data: events = [] } = useQuery({
    queryKey: ['events', viewDate],
    queryFn: () => api.get('/events', { params: { year: viewDate.year, month: viewDate.month } }).then((r) => r.data),
  })

  // ── Fetch senarai staff untuk jemputan ─────────────────────────────────────
  const { data: staffList = [] } = useQuery({
    queryKey: ['users-for-invite'],
    queryFn: () => api.get('/users', { params: { limit: 200 } }).then((r) => r.data?.data ?? r.data),
    staleTime: 5 * 60_000,
  })

  // ── Mutations ──────────────────────────────────────────────────────────────
  const invalidate = () => qc.invalidateQueries({ queryKey: ['events'] })

  const createMut = useMutation({
    mutationFn: (body) => api.post('/events', body).then((r) => r.data),
    onSuccess: () => { toast.success('Acara berjaya ditambah'); setDialog(null); invalidate() },
    onError:   (e) => toast.error(e.response?.data?.message ?? 'Gagal menyimpan'),
  })

  const updateMut = useMutation({
    mutationFn: ({ id, ...body }) => api.put(`/events/${id}`, body).then((r) => r.data),
    onSuccess: () => { toast.success('Acara berjaya dikemaskini'); setDialog(null); invalidate() },
    onError:   (e) => toast.error(e.response?.data?.message ?? 'Gagal mengemaskini'),
  })

  const deleteMut = useMutation({
    mutationFn: (id) => api.delete(`/events/${id}`),
    onSuccess: () => { toast.success('Acara berjaya dipadam'); setDialog(null); invalidate() },
    onError:   (e) => toast.error(e.response?.data?.message ?? 'Gagal memadam'),
  })

  // ── Bina grid bulan ───────────────────────────────────────────────────────
  const { year, month } = viewDate
  const firstDay = new Date(year, month - 1, 1).getDay()
  const daysInMonth = new Date(year, month, 0).getDate()
  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  // Map event ke hari
  const evByDay = {}
  for (const ev of events) {
    const d = new Date(ev.startAt).getDate()
    if (!evByDay[d]) evByDay[d] = []
    evByDay[d].push(ev)
  }

  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth() + 1
  const isPastMonth = year < today.getFullYear() || (year === today.getFullYear() && month < today.getMonth() + 1)

  function prevMonth() {
    setViewDate(({ year, month }) => month === 1 ? { year: year - 1, month: 12 } : { year, month: month - 1 })
  }
  function nextMonth() {
    setViewDate(({ year, month }) => month === 12 ? { year: year + 1, month: 1 } : { year, month: month + 1 })
  }
  function goToday() {
    setViewDate({ year: today.getFullYear(), month: today.getMonth() + 1 })
  }

  const isToday = (d) => d === today.getDate() && month === today.getMonth() + 1 && year === today.getFullYear()
  const isPastDay = (d) => {
    const cellDate = new Date(year, month - 1, d)
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    return cellDate < todayStart
  }

  const activeEvent = dialog?.mode === 'detail' ? dialog.event : null

  // Upcoming events (next 7 days)
  const upcoming = events
    .filter((e) => new Date(e.startAt) >= today)
    .slice(0, 5)

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-green-600" />
            Kalendar
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Pengurusan acara dan mesyuarat</p>
        </div>
        <button onClick={() => setDialog({ mode: 'create' })}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors">
          <Plus className="w-4 h-4" /> Tambah Acara
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">

        {/* ── Kalendar grid ─────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">

          {/* Nav bulan */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <button onClick={prevMonth} disabled={year <= today.getFullYear() - 2}
                className="p-1.5 rounded-lg text-gray-500 transition-colors hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="text-center w-52">
                <h2 className="text-base font-semibold text-gray-900">
                  {MONTHS_MY[month - 1]} {year}
                </h2>
                {isPastMonth && (
                  <span className="text-[10px] text-amber-600 font-medium">Sejarah — lihat sahaja</span>
                )}
              </div>
              <button onClick={nextMonth}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <button onClick={goToday}
              className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
              Hari Ini
            </button>
          </div>

          {/* Header hari */}
          <div className="grid grid-cols-7 border-b border-gray-100">
            {DAYS_MY.map((d) => (
              <div key={d} className="py-2 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">
                {d}
              </div>
            ))}
          </div>

          {/* Grid hari */}
          <div className="grid grid-cols-7">
            {cells.map((day, idx) => {
              if (!day) return <div key={`e-${idx}`} className="min-h-[90px] border-b border-r border-gray-50 bg-gray-50/40" />
              const dayEvents = evByDay[day] ?? []
              const dateStr = `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`
              const past = isPastDay(day)
              return (
                <div key={day}
                  className={`min-h-[90px] border-b border-r border-gray-100 p-1.5 transition-colors group ${
                    past ? 'bg-gray-50/60 cursor-default' : 'cursor-pointer hover:bg-gray-50'
                  } ${isToday(day) ? 'bg-green-50/50' : ''}`}
                  onClick={() => !past && setDialog({ mode: 'create', defaultDate: dateStr })}>
                  <div className={`text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full mb-1 ${
                    isToday(day) ? 'bg-green-600 text-white' : past ? 'text-gray-300' : 'text-gray-700'
                  }`}>{day}</div>
                  <div className="space-y-0.5">
                    {dayEvents.slice(0, 3).map((ev) => {
                      const cfg = colorCfg(ev.color)
                      return (
                        <div key={ev.id}
                          onClick={(e) => { e.stopPropagation(); setDialog({ mode: 'detail', event: ev }) }}
                          className={`text-[10px] font-medium px-1.5 py-0.5 rounded truncate cursor-pointer ${cfg.pill} hover:opacity-80`}>
                          {ev.title}
                        </div>
                      )
                    })}
                    {dayEvents.length > 3 && (
                      <div className="text-[10px] text-gray-400 px-1">+{dayEvents.length - 3} lagi</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── Panel sisi: acara akan datang ─────────────────────── */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700">Acara Akan Datang</h3>
            </div>
            {upcoming.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-gray-400">Tiada acara akan datang</div>
            ) : (
              <div className="divide-y divide-gray-50">
                {upcoming.map((ev) => {
                  const cfg = colorCfg(ev.color)
                  return (
                    <button key={ev.id} onClick={() => setDialog({ mode: 'detail', event: ev })}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start gap-2.5">
                        <div className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 ${cfg.dot}`} />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{ev.title}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{fmtDate(ev.startAt)}</p>
                          <p className="text-xs text-gray-400">{fmtTime(ev.startAt)} – {fmtTime(ev.endAt)}</p>
                          {ev.location && (
                            <p className="text-xs text-gray-400 truncate mt-0.5 flex items-center gap-1">
                              <MapPin className="w-3 h-3" />{ev.location}
                            </p>
                          )}
                          {ev.meetLink && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-blue-600 mt-0.5">
                              <Video className="w-3 h-3" /> Ada link mesyuarat
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Auto-subscribe */}
          <SubscribePanel />
        </div>
      </div>

      {/* ── Dialog cipta/edit ────────────────────────────────────── */}
      <EventDialog
        open={dialog?.mode === 'create' || dialog?.mode === 'edit'}
        onClose={() => setDialog(null)}
        record={dialog?.mode === 'edit' ? dialog.event : null}
        defaultDate={dialog?.defaultDate}
        staffList={staffList.filter((s) => s.id !== user?.id)}
        onSave={(body) => {
          if (dialog?.mode === 'edit') updateMut.mutate({ id: dialog.event.id, ...body })
          else createMut.mutate(body)
        }}
        isSaving={createMut.isPending || updateMut.isPending}
      />

      {/* ── Dialog detail ────────────────────────────────────────── */}
      <EventDetailDialog
        open={dialog?.mode === 'detail'}
        event={activeEvent}
        onClose={() => setDialog(null)}
        onEdit={() => setDialog({ mode: 'edit', event: activeEvent })}
        onDelete={() => {
          if (confirm('Padam acara ini?')) deleteMut.mutate(activeEvent.id)
        }}
        currentUserId={user?.id}
        isAdmin={isAdmin}
      />
    </div>
  )
}
