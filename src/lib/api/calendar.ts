import ICAL from 'ical.js'

export type AppleCalendarEvent = {
  id: string
  title: string
  start: string
  end: string
  allDay: boolean
  calendar: string
  location?: string
}

export type AppleCalendarFeed = {
  kind: 'connected' | 'empty'
  events: AppleCalendarEvent[]
  upcomingEvents?: AppleCalendarEvent[]
  updatedAt: string
}

export function isEventToday(startIso: string, endIso?: string, _allDay?: boolean): boolean {
  const now = new Date()
  const todayYear = now.getFullYear()
  const todayMonth = now.getMonth()
  const todayDate = now.getDate()

  const start = new Date(startIso)
  if (Number.isNaN(start.getTime())) return false

  if (
    start.getFullYear() === todayYear &&
    start.getMonth() === todayMonth &&
    start.getDate() === todayDate
  ) {
    return true
  }

  if (endIso) {
    const end = new Date(endIso)
    if (!Number.isNaN(end.getTime())) {
      const todayStart = new Date(todayYear, todayMonth, todayDate, 0, 0, 0)
      const todayEnd = new Date(todayYear, todayMonth, todayDate, 23, 59, 59)
      if (start <= todayEnd && end >= todayStart) {
        return true
      }
    }
  }

  return false
}

function getEnv(key: string): string | undefined {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    const val = (import.meta.env as Record<string, unknown>)[key]
    if (typeof val === 'string' && val.trim().length > 0) return val.trim()
  }
  return undefined
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

        const location =
          typeof event.location === 'string' && event.location.trim().length > 0
            ? event.location.trim()
            : undefined

        results.push({
          id: event.uid || `ical-${Math.random().toString(36).slice(2)}`,
          title,
          start: startDate.toISOString(),
          end: endDate && !Number.isNaN(endDate.getTime()) ? endDate.toISOString() : startDate.toISOString(),
          allDay: Boolean(event.startDate?.isDate),
          calendar: 'iCloud',
          location,
        })
      } catch {
        continue
      }
    }

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
    try {
      const directRes = await fetch(cleanUrl, { signal: controller.signal })
      if (directRes.ok) {
        return await directRes.text()
      }
    } catch {
      // Direct fetch failed (e.g. CORS)
    }

    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(cleanUrl)}`
    const proxyRes = await fetch(proxyUrl, { signal: controller.signal })
    if (!proxyRes.ok) throw new Error(`Proxy error ${proxyRes.status}`)
    return await proxyRes.text()
  } finally {
    clearTimeout(timer)
  }
}

async function fetchLocalBridgeEvents(): Promise<AppleCalendarEvent[]> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 3500)
  try {
    const bridgeUrl =
      typeof window !== 'undefined'
        ? '/api/calendar/events'
        : 'http://127.0.0.1:4317/api/calendar/events'
    const res = await fetch(bridgeUrl, { signal: controller.signal })
    if (!res.ok) return []
    const json = (await res.json()) as { kind?: string; events?: AppleCalendarEvent[] }
    if (json && json.kind === 'connected' && Array.isArray(json.events)) {
      return json.events
    }
    return []
  } catch {
    return []
  } finally {
    clearTimeout(timer)
  }
}

export async function getAppleCalendarFeed(): Promise<AppleCalendarFeed> {
  const icalUrl = getEnv('VITE_APPLE_CALENDAR_URL') || getEnv('VITE_CALENDAR_ICAL_URL')
  const rawEvents: AppleCalendarEvent[] = []

  if (icalUrl) {
    try {
      const icsText = await fetchIcalFeed(icalUrl, 4000)
      const parsed = parseIcalEvents(icsText)
      rawEvents.push(...parsed)
    } catch {
      // iCal fetch error
    }
  }

  // If no iCal events were loaded, check local CalDAV bridge
  if (rawEvents.length === 0) {
    const bridgeEvents = await fetchLocalBridgeEvents()
    rawEvents.push(...bridgeEvents)
  }

  // Format and sort all real events
  const allEvents = rawEvents
    .filter((e) => e && typeof e.title === 'string' && e.title.trim().length > 0)
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())

  // Separate today's events from upcoming events
  const todayEvents = allEvents.filter((e) => isEventToday(e.start, e.end, e.allDay))
  const nowTime = new Date().getTime()
  const upcomingEvents = allEvents.filter((e) => new Date(e.end || e.start).getTime() >= nowTime)

  if (allEvents.length > 0) {
    return {
      kind: 'connected',
      // If there are no events for today, return an empty array []
      events: todayEvents,
      upcomingEvents,
      updatedAt: new Date().toISOString(),
    }
  }

  // If no calendar connection or no events at all
  return {
    kind: 'empty',
    events: [],
    upcomingEvents: [],
    updatedAt: new Date().toISOString(),
  }
}
