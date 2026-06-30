import { Router } from 'express'
import { z } from 'zod'
import prisma from '../lib/prisma.js'
import { authenticate } from '../middleware/auth.js'
import { logActivity } from '../utils/activityLog.js'
import { signCalendarFeed, verifyCalendarFeed } from '../utils/jwt.js'
import { sendEventInvite } from '../utils/mailer.js'

const router = Router()

// ─── Feed awam — guna token dalam URL (tanpa authenticate middleware) ─────────
// GET /calendar.ics?token=<accessToken>
router.get('/calendar.ics', async (req, res, next) => {
  try {
    const { token } = req.query
    if (!token) return res.status(401).send('Token diperlukan')

    let userId
    try { userId = verifyCalendarFeed(token)?.sub } catch { return res.status(401).send('Token tidak sah atau tamat tempoh') }
    if (!userId) return res.status(401).send('Token tidak sah')

    // Ambil semua events dari bulan ini ke hadapan
    const events = await prisma.event.findMany({
      where: { isPublic: true, endAt: { gte: new Date() } },
      orderBy: { startAt: 'asc' },
      take: 500,
      include: { createdBy: { select: { name: true } } },
    })

    const fmt = (d) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
    const esc = (s) => (s ?? '').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;')

    const veventLines = events.flatMap((ev) => [
      'BEGIN:VEVENT',
      `UID:mbi-event-${ev.id}@mbi.gov.my`,
      `DTSTAMP:${fmt(new Date())}`,
      ev.isAllDay
        ? `DTSTART;VALUE=DATE:${ev.startAt.toISOString().slice(0,10).replace(/-/g,'')}`
        : `DTSTART:${fmt(ev.startAt)}`,
      ev.isAllDay
        ? `DTEND;VALUE=DATE:${ev.endAt.toISOString().slice(0,10).replace(/-/g,'')}`
        : `DTEND:${fmt(ev.endAt)}`,
      `SUMMARY:${esc(ev.title)}`,
      ev.description ? `DESCRIPTION:${esc(ev.description)}` : null,
      ev.location    ? `LOCATION:${esc(ev.location)}`       : null,
      ev.meetLink    ? `URL:${ev.meetLink}`                  : null,
      `ORGANIZER;CN=${esc(ev.createdBy.name)}:MAILTO:noreply@mbi.gov.my`,
      'END:VEVENT',
    ].filter(Boolean))

    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//MBI//Kalendar//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'X-WR-CALNAME:MBI Kalendar',
      'X-WR-TIMEZONE:Asia/Kuala_Lumpur',
      'REFRESH-INTERVAL;VALUE=DURATION:PT1H',
      ...veventLines,
      'END:VCALENDAR',
    ].join('\r\n')

    res.setHeader('Content-Type', 'text/calendar; charset=utf-8')
    res.setHeader('Content-Disposition', 'inline; filename="mbi-kalendar.ics"')
    res.setHeader('Cache-Control', 'no-cache')
    res.send(ics)
  } catch (err) { next(err) }
})

// GET /public — acara awam (tanpa auth, untuk halaman login)
// Tanpa params: upcoming events; dengan ?year=&month=: events untuk bulan tersebut
router.get('/public', async (req, res, next) => {
  try {
    const { year, month } = req.query
    let where = { isPublic: true }

    if (year && month) {
      const start = new Date(parseInt(year), parseInt(month) - 1, 1)
      const end   = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59)
      where.startAt = { gte: start, lte: end }
    } else {
      where.endAt = { gte: new Date() }
    }

    const events = await prisma.event.findMany({
      where,
      orderBy: { startAt: 'asc' },
      take: 100,
      select: { id: true, title: true, startAt: true, endAt: true, isAllDay: true, location: true, color: true },
    })
    res.json({ data: events })
  } catch (err) { next(err) }
})

router.use(authenticate)

// GET /subscribe-token — jana token calendar feed untuk user semasa (tahan 1 tahun)
router.get('/subscribe-token', (req, res) => {
  const token = signCalendarFeed(req.user.id)
  const baseUrl = `${req.protocol}://${req.get('host')}`
  res.json({ token, feedUrl: `${baseUrl}/api/events/calendar.ics?token=${token}` })
})

const eventSchema = z.object({
  title:        z.string().min(1).max(200),
  description:  z.string().optional().nullable(),
  location:     z.string().max(200).optional().nullable(),
  meetLink:     z.string().url().optional().nullable().or(z.literal('')),
  color:        z.string().max(20).optional().nullable(),
  startAt:      z.string().datetime(),
  endAt:        z.string().datetime(),
  isAllDay:     z.boolean().optional(),
  departmentId: z.number().int().optional().nullable(),
  isPublic:     z.boolean().optional(),
  inviteeIds:   z.array(z.number().int()).optional(),
})

// GET / — senarai events (month/year atau range)
router.get('/', async (req, res, next) => {
  try {
    const { year, month, from, to } = req.query
    let where = { isPublic: true }

    if (from && to) {
      where.startAt = { gte: new Date(from), lte: new Date(to) }
    } else if (year && month) {
      const start = new Date(parseInt(year), parseInt(month) - 1, 1)
      const end   = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59)
      where.startAt = { gte: start, lte: end }
    }

    const events = await prisma.event.findMany({
      where,
      orderBy: { startAt: 'asc' },
      include: {
        createdBy:  { select: { id: true, name: true } },
        department: { select: { id: true, name: true } },
      },
    })
    res.json(events)
  } catch (err) { next(err) }
})

// POST / — cipta event
router.post('/', async (req, res, next) => {
  try {
    const { inviteeIds = [], ...raw } = eventSchema.parse(req.body)
    const data = raw

    const event = await prisma.event.create({
      data: {
        ...data,
        meetLink:    data.meetLink || null,
        createdById: req.user.id,
        invitees: inviteeIds.length ? {
          create: inviteeIds.map((userId) => ({ userId })),
        } : undefined,
      },
      include: {
        createdBy:  { select: { id: true, name: true } },
        department: { select: { id: true, name: true } },
        invitees:   { include: { user: { select: { id: true, name: true, email: true } } } },
      },
    })

    // Hantar email + notifikasi kepada jemputan
    if (inviteeIds.length) {
      const invitedUsers = event.invitees.map((i) => i.user)

      // Notifikasi dalam sistem
      await prisma.notification.createMany({
        data: invitedUsers.map((u) => ({
          userId: u.id,
          title:  `Jemputan: ${event.title}`,
          body:   `${req.user.name} menjemput anda ke acara pada ${new Date(event.startAt).toLocaleDateString('ms-MY')}`,
          link:   '/kalendar',
        })),
        skipDuplicates: true,
      })

      // Email dengan .ics (non-blocking)
      sendEventInvite({ event, toUsers: invitedUsers, senderName: req.user.name }).catch(() => {})
    }

    logActivity({ userId: req.user.id, userName: req.user.name, action: 'CREATE', module: 'event', targetId: event.id, detail: event.title, req })
    res.status(201).json(event)
  } catch (err) { next(err) }
})

// PUT /:id — kemaskini event (hanya pencipta atau admin)
router.put('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id)
    const existing = await prisma.event.findUnique({ where: { id } })
    if (!existing) return res.status(404).json({ message: 'Acara tidak dijumpai' })

    const isAdmin = req.user.role?.slug === 'admin'
    if (existing.createdById !== req.user.id && !isAdmin) {
      return res.status(403).json({ message: 'Tidak dibenarkan mengemaskini acara ini' })
    }

    const data = eventSchema.parse(req.body)
    const event = await prisma.event.update({
      where: { id },
      data: { ...data, meetLink: data.meetLink || null },
      include: {
        createdBy:  { select: { id: true, name: true } },
        department: { select: { id: true, name: true } },
      },
    })
    logActivity({ userId: req.user.id, userName: req.user.name, action: 'UPDATE', module: 'event', targetId: id, detail: event.title, req })
    res.json(event)
  } catch (err) { next(err) }
})

// DELETE /:id
router.delete('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id)
    const existing = await prisma.event.findUnique({ where: { id } })
    if (!existing) return res.status(404).json({ message: 'Acara tidak dijumpai' })

    const isAdmin = req.user.role?.slug === 'admin'
    if (existing.createdById !== req.user.id && !isAdmin) {
      return res.status(403).json({ message: 'Tidak dibenarkan memadam acara ini' })
    }

    await prisma.event.delete({ where: { id } })
    logActivity({ userId: req.user.id, userName: req.user.name, action: 'DELETE', module: 'event', targetId: id, detail: existing.title, req })
    res.json({ message: 'Acara berjaya dipadam' })
  } catch (err) { next(err) }
})

// GET /:id/ics — jana fail iCalendar untuk dimuat turun
router.get('/:id/ics', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id)
    const event = await prisma.event.findUnique({
      where: { id },
      include: { createdBy: { select: { name: true } } },
    })
    if (!event) return res.status(404).json({ message: 'Acara tidak dijumpai' })

    const fmt = (d) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
    const esc = (s) => (s ?? '').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;')

    const lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//MBI//Kalendar//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:mbi-event-${event.id}@mbi.gov.my`,
      `DTSTAMP:${fmt(new Date())}`,
      event.isAllDay
        ? `DTSTART;VALUE=DATE:${event.startAt.toISOString().slice(0,10).replace(/-/g,'')}`
        : `DTSTART:${fmt(event.startAt)}`,
      event.isAllDay
        ? `DTEND;VALUE=DATE:${event.endAt.toISOString().slice(0,10).replace(/-/g,'')}`
        : `DTEND:${fmt(event.endAt)}`,
      `SUMMARY:${esc(event.title)}`,
      event.description ? `DESCRIPTION:${esc(event.description)}` : null,
      event.location    ? `LOCATION:${esc(event.location)}`       : null,
      event.meetLink    ? `URL:${event.meetLink}`                  : null,
      `ORGANIZER;CN=${esc(event.createdBy.name)}:MAILTO:noreply@mbi.gov.my`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].filter(Boolean).join('\r\n')

    const slug = event.title.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase().slice(0, 40)
    res.setHeader('Content-Type', 'text/calendar; charset=utf-8')
    res.setHeader('Content-Disposition', `attachment; filename="${slug}.ics"`)
    res.send(lines)
  } catch (err) { next(err) }
})

export default router
