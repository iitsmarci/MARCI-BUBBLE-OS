import { useEffect, useState } from 'react'
import { getAppleCalendarFeed, type AppleCalendarFeed } from '../lib/api/calendar'
import { formatEventRelativeNote, formatEventTime } from '../lib/time'
import { Bubble } from './Bubble'

export function PersonalBubble() {
  const [feed, setFeed] = useState<AppleCalendarFeed>({
    kind: 'empty',
    events: [],
    updatedAt: new Date().toISOString(),
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    let isMounted = true

    async function loadCalendar() {
      setIsLoading(true)
      const data = await getAppleCalendarFeed()
      if (isMounted) {
        setFeed(data)
        setIsLoading(false)
      }
    }

    loadCalendar()
    const interval = window.setInterval(loadCalendar, 5 * 60 * 1000)
    return () => {
      isMounted = false
      window.clearInterval(interval)
    }
  }, [])

  const events = feed.events

  return (
    <Bubble
      title="Personal"
      className="personal-bubble"
      meta={
        <span className="live-mini">
          <i /> {feed.kind === 'connected' ? 'LIVE' : 'SYNCING'}
        </span>
      }
    >
      {isLoading && events.length === 0 ? (
        <div className="agenda-skeleton" aria-label="Caricamento eventi agenda">
          <p className="next-label">NEXT</p>
          <div className="skeleton-item">
            <div className="skeleton-time" />
            <div className="skeleton-text">
              <div className="skeleton-line w-70" />
              <div className="skeleton-line w-40" />
            </div>
          </div>
        </div>
      ) : events.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon" aria-hidden="true">○</span>
          <div>
            <strong>Nessun evento in programma per oggi</strong>
            <p>
              {feed.upcomingEvents && feed.upcomingEvents.length > 0
                ? `Prossimo: ${feed.upcomingEvents[0].title} (${new Date(feed.upcomingEvents[0].start).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })})`
                : 'La tua agenda per oggi è libera.'}
            </p>
          </div>
        </div>
      ) : (
        <>
          <p className="next-label">OGGI IN AGENDA</p>
          <div className="agenda-list">
            {events.slice(0, 3).map((event, index) => (
              <article className="agenda-item" key={event.id}>
                <time>{formatEventTime(event.start, event.allDay)}</time>
                <div>
                  <h3>{event.title}</h3>
                  <p>
                    {formatEventRelativeNote(event.start, event.end, event.allDay)} · {event.calendar}
                    {event.location ? ` · ${event.location}` : ''}
                  </p>
                </div>
                {index === 0 && <span className="agenda-marker" />}
              </article>
            ))}
          </div>
        </>
      )}

      <footer>
        {events.length > 0
          ? `Apple Calendar · ${events.length} ${events.length === 1 ? 'evento oggi' : 'eventi oggi'}`
          : feed.upcomingEvents && feed.upcomingEvents.length > 0
          ? `Apple Calendar · Sincronizzato (${feed.upcomingEvents.length} in arrivo)`
          : 'Apple Calendar · Nessun evento in programma'}
      </footer>
    </Bubble>
  )
}
