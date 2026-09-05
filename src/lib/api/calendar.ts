export type AppleCalendarEvent = {
  id: string
  title: string
  start: string
  end: string
  allDay: boolean
  calendar: string
}

export type AppleCalendarFeed =
  | { kind: 'connected'; events: AppleCalendarEvent[]; updatedAt: string }
  | { kind: 'setup_required' }
  | { kind: 'unavailable' }

function isAppleCalendarEvent(value: unknown): value is AppleCalendarEvent {
  if (typeof value !== 'object' || value === null) return false
  const event = value as Record<string, unknown>
  return typeof event.id === 'string' && typeof event.title === 'string' && typeof event.start === 'string' && typeof event.end === 'string' && typeof event.allDay === 'boolean' && typeof event.calendar === 'string'
}

function parseFeed(value: unknown): AppleCalendarFeed {
  if (typeof value !== 'object' || value === null) return { kind: 'unavailable' }
  const feed = value as Record<string, unknown>
  if (feed.kind === 'setup_required') return { kind: 'setup_required' }
  if (feed.kind === 'unavailable') return { kind: 'unavailable' }
  if (feed.kind === 'connected' && Array.isArray(feed.events) && feed.events.every(isAppleCalendarEvent) && typeof feed.updatedAt === 'string') {
    return { kind: 'connected', events: feed.events, updatedAt: feed.updatedAt }
  }
  return { kind: 'unavailable' }
}

export async function getAppleCalendarFeed(): Promise<AppleCalendarFeed> {
  try {
    const response = await fetch('/api/calendar/events')
    return parseFeed(await response.json())
  } catch {
    return { kind: 'unavailable' }
  }
}
