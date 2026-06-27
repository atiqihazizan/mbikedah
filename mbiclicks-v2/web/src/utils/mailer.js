import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST ?? 'smtp.gmail.com',
  port:   parseInt(process.env.SMTP_PORT ?? '587'),
  secure: process.env.SMTP_PORT === '465',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

function buildIcs(event) {
  const fmt = (d) => new Date(d).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
  const esc = (s) => (s ?? '').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;')

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//MBI//Kalendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:mbi-event-${event.id}@mbi.gov.my`,
    `DTSTAMP:${fmt(new Date())}`,
    `DTSTART:${fmt(event.startAt)}`,
    `DTEND:${fmt(event.endAt)}`,
    `SUMMARY:${esc(event.title)}`,
    event.description ? `DESCRIPTION:${esc(event.description)}` : null,
    event.location    ? `LOCATION:${esc(event.location)}`       : null,
    event.meetLink    ? `URL:${event.meetLink}`                  : null,
    'END:VEVENT',
    'END:VCALENDAR',
  ].filter(Boolean).join('\r\n')
}

function fmtMY(d) {
  return new Date(d).toLocaleString('ms-MY', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: false,
    timeZone: 'Asia/Kuala_Lumpur',
  })
}

export async function sendEventInvite({ event, toUsers, senderName }) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) return

  const icsContent = buildIcs(event)
  const appUrl = process.env.APP_URL ?? 'http://localhost:4000'

  const emailList = toUsers.filter((u) => u.email)
  if (emailList.length === 0) return

  await Promise.allSettled(emailList.map((u) =>
    transporter.sendMail({
      from:    process.env.MAIL_FROM ?? 'MBI Portal <noreply@mbi.gov.my>',
      to:      u.email,
      subject: `Jemputan: ${event.title}`,
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto">
          <div style="background:#166534;padding:20px 24px;border-radius:8px 8px 0 0">
            <h2 style="color:#fff;margin:0;font-size:18px">📅 Jemputan Acara</h2>
          </div>
          <div style="border:1px solid #e5e7eb;border-top:none;padding:24px;border-radius:0 0 8px 8px">
            <p style="color:#374151;margin-top:0">Hai <strong>${u.name}</strong>,</p>
            <p style="color:#374151">Anda dijemput ke acara berikut oleh <strong>${senderName}</strong>:</p>

            <div style="background:#f9fafb;border-left:4px solid #166534;padding:16px;border-radius:4px;margin:16px 0">
              <h3 style="margin:0 0 8px;color:#111827;font-size:16px">${event.title}</h3>
              <p style="margin:4px 0;color:#6b7280;font-size:14px">🕐 ${fmtMY(event.startAt)}</p>
              <p style="margin:4px 0;color:#6b7280;font-size:14px">🕑 hingga ${fmtMY(event.endAt)}</p>
              ${event.location ? `<p style="margin:4px 0;color:#6b7280;font-size:14px">📍 ${event.location}</p>` : ''}
              ${event.meetLink ? `<p style="margin:4px 0;font-size:14px">🔗 <a href="${event.meetLink}" style="color:#166534">${event.meetLink}</a></p>` : ''}
              ${event.description ? `<p style="margin:8px 0 0;color:#374151;font-size:14px">${event.description}</p>` : ''}
            </div>

            <p style="color:#6b7280;font-size:13px">Lampiran .ics boleh dibuka dengan Google Calendar, Apple Calendar atau Outlook untuk menambah acara ini ke kalendar anda secara automatik.</p>

            <a href="${appUrl}" style="display:inline-block;background:#166534;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-size:14px;margin-top:8px">
              Buka Portal MBI
            </a>
          </div>
          <p style="color:#9ca3af;font-size:12px;text-align:center;margin-top:16px">MBI Portal — Menteri Besar Incorporated</p>
        </div>
      `,
      attachments: [{
        filename: `${event.title.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}.ics`,
        content:  icsContent,
        contentType: 'text/calendar; method=REQUEST',
      }],
    })
  ))
}
