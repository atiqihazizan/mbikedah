import { useState, useEffect } from 'react'
import { CalendarDays, X } from 'lucide-react'
import api from '@/lib/api'

const DAYS_MY   = ['Ahd', 'Isn', 'Sel', 'Rab', 'Kha', 'Jum', 'Sab']
const MONTHS_MY = ['Januari','Februari','Mac','April','Mei','Jun','Julai','Ogos','September','Oktober','November','Disember']

const COLOR_DOT = {
  blue:   'bg-blue-400',
  green:  'bg-green-400',
  red:    'bg-red-400',
  orange: 'bg-orange-400',
  purple: 'bg-purple-400',
  pink:   'bg-pink-400',
}

// endpoint: '/events/public' (login, tanpa auth) atau '/events' (dashboard, dengan auth)
export default function MiniCalendar({ endpoint = '/events/public', theme = 'dark' }) {
  const today = new Date()
  const year  = today.getFullYear()
  const month = today.getMonth() + 1

  const [events,      setEvents]      = useState([])
  const [selectedDay, setSelectedDay] = useState(null)

  useEffect(() => {
    api.get(`${endpoint}?year=${year}&month=${month}`)
      .then((r) => setEvents(r.data.data ?? r.data ?? []))
      .catch(() => {})
  }, [endpoint])

  const firstDay    = new Date(year, month - 1, 1).getDay()
  const daysInMonth = new Date(year, month, 0).getDate()
  const cells       = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)]

  const evByDay = {}
  events.forEach((ev) => {
    const d = new Date(ev.startAt)
    if (d.getFullYear() === year && d.getMonth() + 1 === month) {
      const day = d.getDate()
      if (!evByDay[day]) evByDay[day] = []
      evByDay[day].push(ev)
    }
  })

  const isToday      = (day) => day === today.getDate()
  const selectedEvs  = selectedDay ? (evByDay[selectedDay] ?? []) : []

  const isDark = theme === 'dark'

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Header bulan */}
      <div className="flex items-center justify-center mb-3 shrink-0">
        <span className={`text-base font-semibold ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
          {MONTHS_MY[month - 1]} {year}
        </span>
      </div>

      {/* Header hari */}
      <div className="grid grid-cols-7 mb-1 shrink-0">
        {DAYS_MY.map((d) => (
          <div key={d} className={`text-center text-xs font-semibold py-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{d}</div>
        ))}
      </div>

      {/* Grid hari */}
      <div className="grid grid-cols-7 flex-1" style={{ gridAutoRows: '1fr' }}>
        {cells.map((day, idx) => !day ? (
          <div key={`e-${idx}`} />
        ) : (
          <div
            key={day}
            onClick={() => evByDay[day] && setSelectedDay(day)}
            className={`flex flex-col items-center justify-center transition-colors rounded-lg ${
              evByDay[day]
                ? isDark ? 'cursor-pointer hover:bg-gray-800' : 'cursor-pointer hover:bg-gray-100'
                : ''
            }`}
          >
            <span className={`text-sm font-light leading-none ${
              isToday(day)
                ? 'text-green-500 font-semibold'
                : isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>{day}</span>
            {evByDay[day] && (
              <div className="flex gap-0.5 mt-1">
                {evByDay[day].slice(0, 3).map((ev, i) => (
                  <div key={i} className={`w-1.5 h-1.5 rounded-full ${COLOR_DOT[ev.color] ?? 'bg-blue-400'}`} />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Dialog popup event */}
      {selectedDay && selectedEvs.length > 0 && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          onClick={() => setSelectedDay(null)}
        >
          <div
            className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-blue-400" />
                <p className="text-sm font-semibold text-gray-100">
                  {selectedDay} {MONTHS_MY[month - 1]} {year}
                </p>
              </div>
              <button onClick={() => setSelectedDay(null)} className="text-gray-500 hover:text-gray-300 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 space-y-2 max-h-72 overflow-y-auto">
              {selectedEvs.map((ev) => (
                <div key={ev.id} className="flex gap-3 bg-gray-800 rounded-xl p-3">
                  <div className={`w-1 rounded-full shrink-0 self-stretch ${COLOR_DOT[ev.color] ?? 'bg-blue-400'}`} />
                  <div className="min-w-0">
                    <p className="text-sm text-gray-100 font-medium leading-snug">{ev.title}</p>
                    {ev.isAllDay
                      ? <p className="text-xs text-gray-400 mt-1">Sepanjang hari</p>
                      : (
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(ev.startAt).toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit', hour12: false })}
                          {' – '}
                          {new Date(ev.endAt).toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit', hour12: false })}
                        </p>
                      )}
                    {ev.location && <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{ev.location}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
