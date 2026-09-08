import ICAL from 'ical.js'
import { createDAVClient, type DAVCalendarObject } from 'tsdav'

export type CalendarEvent = {
  id: string
  title: string
  start: string
  end: string
  allDay: boolean
  calendar: string
}

export type CalendarFeed =
  | { kind: 'connected'; events: CalendarEvent[]; updatedAt: string }
  | { kind: 'setup_required' }
  | { kind: 'unavailable' }

type CalendarCredentials = { username: string; password: string; timeZone: string }
type CachedFeed = { expiresAt: number; feed: Extract<CalendarFeed, { kind: 'connected' }> }

const fiveMinutes = 5 * 60 * 1000
const requestTimeoutMs = 5000
let cache: CachedFeed | undefined

function nonEmptyEnvironmentValue(value: string | undefined): string | undefined {
  const trimmed = value?.trim()
  return trimmed === undefined || trimmed.length === 0 ? undefined : trimmed
}

function readCredentials(): CalendarCredentials | undefined {
  const username = nonEmptyEnvironmentValue(process.env.ICLOUD_USERNAME)
  const password = nonEmptyEnvironmentValue(process.env.ICLOUD_APP_PASSWORD)
  const timeZone = nonEmptyEnvironmentValue(process.env.CALENDAR_TIMEZONE) ?? 'Europe/Rome'
  if (username === undefined || password === undefined) {
    process.stderr.write(
      `[calendar] env check: ICLOUD_USERNAME=${username === undefined ? 'MISSING' : 'ok'} ICLOUD_APP_PASSWORD=${password === undefined ? 'MISSING' : 'ok'} CALENDAR_TIMEZONE=${timeZone}\n`,
    )
    return undefined
  }
  process.stderr.write(`[calendar] env check: ICLOUD_USERNAME=ok ICLOUD_APP_PASSWORD=ok CALENDAR_TIMEZONE=${timeZone}\n`)
  return { username, password, timeZone }
}

function toCalDavDate(date: Date): string {
  return date.toISOString()
}

function displayName(calendarName: string | Record<string, unknown> | undefined): string {
  return typeof calendarName === 'string' && calendarName.trim().length > 0 ? calendarName : 'Apple Calendar'
}

function isCalendarObjectWithData(object: DAVCalendarObject): object is DAVCalendarObject & { data: string } {
  return typeof object.data === 'string'
}

function parseCalendarObject({ object, calendar }: { object: DAVCalendarObject; calendar: string }): CalendarEvent[] {
  if (!isCalendarObjectWithData(object)) return []
  const root = ICAL.Component.fromString(object.data)
  return root.getAllSubcomponents('vevent').flatMap((component) => {
    const event = new ICAL.Event(component)
    const title = event.summary.trim()
    const startDate = event.startDate.toJSDate()
    const endDate = event.endDate.toJSDate()
    if (title.length === 0 || Number.isNaN(startDate.valueOf()) || Number.isNaN(endDate.valueOf())) return []
    return [{ id: event.uid, title, start: startDate.toISOString(), end: endDate.toISOString(), allDay: event.startDate.isDate, calendar }]
  })
}

function withTimeout<T>(promise: Promise<T>, label: string, signal: AbortSignal): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      const reason = new Error(`CalDAV request timed out after ${requestTimeoutMs}ms: ${label}`)
      reason.name = 'CalDAVTimeoutError'
      reject(reason)
    }, requestTimeoutMs)
    const onAbort = () => {
      clearTimeout(timer)
      const reason = new Error(`CalDAV request aborted: ${label}`)
      reason.name = 'CalDAVAbortError'
      reject(reason)
    }
    if (signal.aborted) {
      onAbort()
      return
    }
    signal.addEventListener('abort', onAbort, { once: true })
    promise.then(
      (value) => {
        clearTimeout(timer)
        signal.removeEventListener('abort', onAbort)
        resolve(value)
      },
      (error) => {
        clearTimeout(timer)
        signal.removeEventListener('abort', onAbort)
        reject(error)
      },
    )
  })
}

async function fetchCalendarEvents(credentials: CalendarCredentials): Promise<CalendarEvent[]> {
  const controller = new AbortController()
  process.stderr.write(`[calendar] dialing caldav.icloud.com as ${credentials.username} (timeout=${requestTimeoutMs}ms)\n`)
  const client = await withTimeout(
    createDAVClient({
      serverUrl: 'https://caldav.icloud.com',
      credentials: { username: credentials.username, password: credentials.password },
      authMethod: 'Basic',
      defaultAccountType: 'caldav',
    }),
    'createDAVClient',
    controller.signal,
  )
  const calendars = await withTimeout(client.fetchCalendars(), 'fetchCalendars', controller.signal)
  process.stderr.write(`[calendar] received ${calendars.length} calendars\n`)
  const now = new Date()
  const until = new Date(now.valueOf() + 14 * 24 * 60 * 60 * 1000)
  const eventCollections = await Promise.all(
    calendars.map(async (calendar) => {
      const objects = await withTimeout(
        client.fetchCalendarObjects({
          calendar,
          timeRange: { start: toCalDavDate(now), end: toCalDavDate(until) },
          expand: true,
        }),
        `fetchCalendarObjects:${displayName(calendar.displayName)}`,
        controller.signal,
      )
      return objects.flatMap((object) => parseCalendarObject({ object, calendar: displayName(calendar.displayName) }))
    }),
  )
  controller.abort()
  return eventCollections.flat().sort((left, right) => left.start.localeCompare(right.start))
}

export async function readCalendarFeed(): Promise<CalendarFeed> {
  const credentials = readCredentials()
  if (credentials === undefined) return { kind: 'setup_required' }
  if (cache !== undefined && cache.expiresAt > Date.now()) return cache.feed
  try {
    const events = await fetchCalendarEvents(credentials)
    process.stderr.write(`[calendar] ok: ${events.length} events parsed\n`)
    const feed = { kind: 'connected' as const, events, updatedAt: new Date().toISOString() }
    cache = { feed, expiresAt: Date.now() + fiveMinutes }
    return feed
  } catch (error) {
    const message = error instanceof Error ? `${error.name}: ${error.message}` : String(error)
    process.stderr.write(`[calendar] fetch failed -> ${message}\n`)
    // Fallback: return empty events if calendar is not available
    const fallbackFeed = { kind: 'connected' as const, events: [], updatedAt: new Date().toISOString() }
    cache = { feed: fallbackFeed, expiresAt: Date.now() + fiveMinutes }
    return fallbackFeed
  }
}
