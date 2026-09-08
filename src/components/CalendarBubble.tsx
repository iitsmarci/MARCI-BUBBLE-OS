import { useCallback, useEffect, useState } from 'react'
import { Bubble } from './Bubble'
import { getAppleCalendarFeed, getLocalAgendaEvents, type AppleCalendarFeed } from '../lib/api/calendar'

export function CalendarBubble() {
  const [feed, setFeed] = useState<AppleCalendarFeed>(() => ({
    kind: 'local',
    events: getLocalAgendaEvents(),
    updatedAt: new Date().toISOString(),
  }))
  const [isLoading, setIsLoading] = useState(false)

  const load = useCallback(async () => {
    setIsLoading(true)
    const result = await getAppleCalendarFeed()
    setFeed(result)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    load()
    const id = window.setInterval(load, 5 * 60 * 1000)
    return () => window.clearInterval(id)
  }, [load])

  const events = feed.events
  const hasEvents = events.length > 0

  const statusLabel = (() => {
    if (isLoading && !hasEvents) return 'SYNCING'
    if (feed.kind === 'connected') return 'LIVE'
    return 'LOCAL'
  })()

  return (
    <Bubble
      title="Agenda"
      className="calendar-bubble"
      meta={
        <span className="live-mini">
          <i /> {statusLabel}
        </span>
      }
    >
      <div className="calendar-list">
        {isLoading && !hasEvents ? (
          <div className="calendar-skeleton">
            {[1, 2, 3].map((i) => (
              <div key={i} className="calendar-skeleton-row">
                <div className="skeleton-line w-40" />
                <div className="skeleton-line w-70" />
              </div>
            ))}
          </div>
        ) : (
          events.map((event) => {
            const isAllDay = event.allDay
            const startDate = new Date(event.start)
            const dayLabel = startDate.toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric', month: 'short' })
            return (
              <div className="calendar-row" key={event.id}>
                <div className="calendar-date" aria-hidden="true">
                  <span className="calendar-day">{dayLabel}</span>
                </div>
                <div className="calendar-details">
                  <b>{event.title}</b>
                  <span className="calendar-time">
                    {isAllDay
                      ? 'Tutto il giorno'
                      : `${startDate.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })} – ${new Date(event.end).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}`}
                  </span>
                  <span className="calendar-source">{event.calendar}</span>
                </div>
              </div>
            )
          })
        )}
      </div>
      <footer>
        {feed.kind === 'connected'
          ? `Agenda sincronizzata · ${events.length} eventi`
          : `Agenda locale · ${events.length} impegni del giorno`}
      </footer>
    </Bubble>
  )
}