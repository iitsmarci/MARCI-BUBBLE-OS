const DEFAULT_TIMEZONE = 'Europe/Rome'

/**
 * Returns an appropriate greeting based on the current hour in the target timezone.
 * 05:00–11:59 → Good morning
 * 12:00–17:59 → Good afternoon
 * 18:00–04:59 → Good evening
 */
export function getGreeting(date: Date = new Date(), timeZone: string = DEFAULT_TIMEZONE): string {
  const hourString = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    hour12: false,
    timeZone,
  }).format(date)

  const hour = parseInt(hourString, 10)
  if (hour >= 5 && hour < 12) {
    return 'Good morning'
  }
  if (hour >= 12 && hour < 18) {
    return 'Good afternoon'
  }
  return 'Good evening'
}

/**
 * Formats time as HH:mm:ss for digital clock
 */
export function formatDigitalClock(date: Date = new Date(), timeZone: string = DEFAULT_TIMEZONE): string {
  return new Intl.DateTimeFormat('it-IT', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone,
  }).format(date)
}

/**
 * Formats date for hero section (e.g. "27.08.2026 · Catania")
 */
export function formatHeroDate(date: Date = new Date(), location: string = 'Catania', timeZone: string = DEFAULT_TIMEZONE): string {
  const parts = new Intl.DateTimeFormat('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone,
  }).formatToParts(date)

  const day = parts.find((p) => p.type === 'day')?.value ?? '01'
  const month = parts.find((p) => p.type === 'month')?.value ?? '01'
  const year = parts.find((p) => p.type === 'year')?.value ?? '2026'

  return `${day}.${month}.${year} · ${location}`
}

/**
 * Formats day of the week in uppercase for header (e.g. "THURSDAY")
 */
export function formatHeaderDay(date: Date = new Date(), timeZone: string = DEFAULT_TIMEZONE): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    timeZone,
  }).format(date).toUpperCase()
}

/**
 * Formats full date in uppercase for header (e.g. "27 AUGUST 2026")
 */
export function formatHeaderDate(date: Date = new Date(), timeZone: string = DEFAULT_TIMEZONE): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone,
  }).formatToParts(date)

  const day = parts.find((p) => p.type === 'day')?.value ?? '1'
  const month = parts.find((p) => p.type === 'month')?.value ?? 'JANUARY'
  const year = parts.find((p) => p.type === 'year')?.value ?? '2026'

  return `${day} ${month.toUpperCase()} ${year}`
}

/**
 * Formats full readable date for ClockBubble (e.g. "Thursday, 27 August")
 */
export function formatClockDate(date: Date = new Date(), timeZone: string = DEFAULT_TIMEZONE): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone,
  }).formatToParts(date)

  const weekday = parts.find((p) => p.type === 'weekday')?.value ?? 'Thursday'
  const day = parts.find((p) => p.type === 'day')?.value ?? '1'
  const month = parts.find((p) => p.type === 'month')?.value ?? 'August'

  return `${weekday}, ${day} ${month}`
}

/**
 * Formats calendar event time (e.g. "18:30" or "ALL DAY")
 */
export function formatEventTime(startIso: string, allDay: boolean, timeZone: string = DEFAULT_TIMEZONE): string {
  if (allDay) return 'ALL DAY'
  const date = new Date(startIso)
  if (Number.isNaN(date.getTime())) return '--:--'
  return new Intl.DateTimeFormat('it-IT', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone,
  }).format(date)
}

/**
 * Formats relative note for upcoming calendar events (e.g. "In 01h 12m", "Today", "Tomorrow")
 */
export function formatEventRelativeNote(startIso: string, _endIso: string, allDay: boolean, timeZone: string = DEFAULT_TIMEZONE): string {
  if (allDay) return 'All day event'
  const start = new Date(startIso)
  if (Number.isNaN(start.getTime())) return ''
  const now = new Date()
  const diffMs = start.getTime() - now.getTime()

  if (diffMs > 0 && diffMs < 24 * 60 * 60 * 1000) {
    const diffHours = Math.floor(diffMs / (60 * 60 * 1000))
    const diffMinutes = Math.floor((diffMs % (60 * 60 * 1000)) / (60 * 1000))
    if (diffHours === 0) {
      return `In ${diffMinutes}m`
    }
    return `In ${diffHours.toString().padStart(2, '0')}h ${diffMinutes.toString().padStart(2, '0')}m`
  }

  const isSameDay =
    start.getDate() === now.getDate() &&
    start.getMonth() === now.getMonth() &&
    start.getFullYear() === now.getFullYear()
  if (isSameDay) {
    return 'Today'
  }

  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
  const isTomorrow =
    start.getDate() === tomorrow.getDate() &&
    start.getMonth() === tomorrow.getMonth() &&
    start.getFullYear() === tomorrow.getFullYear()
  if (isTomorrow) {
    return 'Tomorrow'
  }

  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    timeZone,
  }).format(start)
}
