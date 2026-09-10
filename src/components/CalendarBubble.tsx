import { useCallback, useEffect, useState } from 'react'
import { Calendar, MapPin } from 'lucide-react'
import { Bubble } from './Bubble'
import { getAppleCalendarFeed, type AppleCalendarFeed } from '../lib/api/calendar'

export function CalendarBubble() {
  const [feed, setFeed] = useState<AppleCalendarFeed>({
    kind: 'empty',
    events: [],
    updatedAt: new Date().toISOString(),
  })
  const [isLoading, setIsLoading] = useState(true)

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
    return 'IDLE'
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
        ) : !hasEvents ? (
          <div className="calendar-empty">
            <Calendar size={32} className="empty-icon" strokeWidth={1.4} />
            <p className="calendar-empty-text">Nessun evento in programma per oggi</p>
            <small className="calendar-empty-sub">
              {feed.upcomingEvents && feed.upcomingEvents.length > 0
                ? `Prossimo impegno: ${feed.upcomingEvents[0].title} (${new Date(feed.upcomingEvents[0].start).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })})`
                : 'La tua agenda per oggi è libera.'}
            </small>
          </div>
        ) : (
          events.map((event) => {
            const isAllDay = event.allDay
            const startDate = new Date(event.start)
            const endDate = new Date(event.end)
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
                      : `${startDate.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })} – ${endDate.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}`}
                  </span>
                  <div className="calendar-meta-info">
                    <span className="calendar-source">{event.calendar}</span>
                    {event.location && (
                      <span className="calendar-location">
                        <MapPin size={11} /> {event.location}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
      <footer>
        {hasEvents
          ? `Apple Calendar · ${events.length} ${events.length === 1 ? 'evento oggi' : 'eventi oggi'}`
          : feed.upcomingEvents && feed.upcomingEvents.length > 0
          ? `Apple Calendar · Sincronizzato (${feed.upcomingEvents.length} in arrivo)`
          : 'Apple Calendar · Nessun evento in programma'}
      </footer>
    </Bubble>
  )
}