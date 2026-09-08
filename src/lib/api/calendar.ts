import ICAL from 'ical.js'

export type AppleCalendarEvent = {
  id: string
  title: string
  start: string
  end: string
  allDay: boolean
  calendar: string
}

export type AppleCalendarFeed = {
  kind: 'connected' | 'local'
  events: AppleCalendarEvent[]
  updatedAt: string
}

export function getLocalAgendaEvents(): AppleCalendarEvent[] {
  const now = new Date()
  const yyyy = now.getFullYear()
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  const today = `${yyyy}-${mm}-${dd}`

  return [
    {
      id: 'local-agenda-1',
      title: 'Pianificazione & Focus Strategico',
      start: `${today}T09:30:00`,
      end: `${today}T11:00:00`,
      allDay: false,
      calendar: 'Agenda Locale',
    },
    {
      id: 'local-agenda-2',
      title: 'Revisione Progetti & Dashboard Release',
      start: `${today}T14:30:00`,
      end: `${today}T16:00:00`,
      allDay: false,
      calendar: 'Agenda Locale',
    },
    {
      id: 'local-agenda-3',
      title: 'Riepilogo & Organizzazione Attività',
      start: `${today}T18:00:00`,
      end: `${today}T18:45:00`,
      allDay: false,
      calendar: 'Agenda Locale',
    },
  ]
}

function parseIcalEvents(icsText: string): AppleCalendarEvent[] {
  try {
    const jcal = ICAL.parse(icsText)
    const comp = new ICAL.Component(jcal)
    const vevents = comp.getAllSubcomponents('vevent')
    const results: AppleCalendarEvent[] = []

    for (const vevent of vevents) {
      try {
        const event = new ICAL.Event(vevent)
        const title = event.summary?.trim() || 'Evento senza titolo'
        const startDate = event.startDate?.toJSDate?.()
        const endDate = event.endDate?.toJSDate?.()
        if (!startDate || Number.isNaN(startDate.getTime())) continue

        results.push({
          id: event.uid || `ical-${Math.random().toString(36).slice(2)}`,
          title,
          start: startDate.toISOString(),
          end: endDate && !Number.isNaN(endDate.getTime()) ? endDate.toISOString() : startDate.toISOString(),
          allDay: Boolean(event.startDate?.isDate),
          calendar: 'iCal',
        })
      } catch {
        continue
      }
    }

    results.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
    return results
  } catch {
    return []
  }
}

async function fetchIcalFeed(url: string, timeoutMs = 4000): Promise<string> {
  const cleanUrl = url.replace(/^webcal:\/\//i, 'https://')
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  try {
    // Try direct fetch first
    try {
      const directRes = await fetch(cleanUrl, { signal: controller.signal })
      if (directRes.ok) {
        return await directRes.text()
      }
    } catch {
      // Direct fetch failed (e.g. CORS), fallback to proxy
    }

    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(cleanUrl)}`
    const proxyRes = await fetch(proxyUrl, { signal: controller.signal })
    if (!proxyRes.ok) throw new Error(`Proxy error ${proxyRes.status}`)
    return await proxyRes.text()
  } finally {
    clearTimeout(timer)
  }
}

export async function getAppleCalendarFeed(): Promise<AppleCalendarFeed> {
  const icalUrl =
    typeof import.meta !== 'undefined' && import.meta.env?.VITE_CALENDAR_ICAL_URL
      ? (import.meta.env.VITE_CALENDAR_ICAL_URL as string).trim()
      : undefined

  if (icalUrl) {
    try {
      const icsText = await fetchIcalFeed(icalUrl, 4000)
      const events = parseIcalEvents(icsText)
      if (events.length > 0) {
        return {
          kind: 'connected',
          events,
          updatedAt: new Date().toISOString(),
        }
      }
    } catch {
      // Fallback directly to clean local agenda
    }
  }

  // Autonomous local agenda without localhost dependency
  return {
    kind: 'local',
    events: getLocalAgendaEvents(),
    updatedAt: new Date().toISOString(),
  }
}
