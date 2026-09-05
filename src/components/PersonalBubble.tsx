import { useEffect, useState } from 'react'
import { getAppleCalendarFeed, type AppleCalendarEvent } from '../lib/api/calendar'
import { formatEventRelativeNote, formatEventTime } from '../lib/time'
import { Bubble } from './Bubble'

type CalendarState =
  | { status: 'loading' }
  | { status: 'connected'; events: AppleCalendarEvent[]; updatedAt: string }
  | { status: 'setup_required' }
  | { status: 'unavailable' }

export function PersonalBubble() {
  const [feedState, setFeedState] = useState<CalendarState>({ status: 'loading' })

  useEffect(() => {
    let isMounted = true

    async function loadCalendar() {
      const feed = await getAppleCalendarFeed()
      if (!isMounted) return

      if (feed.kind === 'connected') {
        setFeedState({ status: 'connected', events: feed.events, updatedAt: feed.updatedAt })
      } else if (feed.kind === 'setup_required') {
        setFeedState({ status: 'setup_required' })
      } else {
        setFeedState({ status: 'unavailable' })
      }
    }

    loadCalendar()
    const interval = window.setInterval(loadCalendar, 5 * 60 * 1000)
    return () => {
      isMounted = false
      window.clearInterval(interval)
    }
  }, [])

  return (
    <Bubble
      title="Personal"
      className="personal-bubble"
      meta={
        feedState.status === 'connected' ? (
          <span className="live-mini">
            <i /> ICAL
          </span>
        ) : feedState.status === 'setup_required' ? (
          <span className="section-meta">NOT CONNECTED</span>
        ) : feedState.status === 'unavailable' ? (
          <span className="section-meta">OFFLINE</span>
        ) : (
          <span className="section-meta">SYNCING</span>
        )
      }
    >
      {feedState.status === 'loading' && (
        <div className="agenda-skeleton" aria-label="Caricamento eventi calendario">
          <p className="next-label">NEXT</p>
          <div className="skeleton-item">
            <div className="skeleton-time" />
            <div className="skeleton-text">
              <div className="skeleton-line w-70" />
              <div className="skeleton-line w-40" />
            </div>
          </div>
          <div className="skeleton-item">
            <div className="skeleton-time" />
            <div className="skeleton-text">
              <div className="skeleton-line w-60" />
              <div className="skeleton-line w-30" />
            </div>
          </div>
        </div>
      )}

      {feedState.status === 'connected' && (
        <>
          <p className="next-label">NEXT</p>
          {feedState.events.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon" aria-hidden="true">○</span>
              <div>
                <strong>Nessun evento in programma</strong>
                <p>La tua agenda è libera nei prossimi 14 giorni.</p>
              </div>
            </div>
          ) : (
            <div className="agenda-list">
              {feedState.events.slice(0, 3).map((event, index) => (
                <article className="agenda-item" key={event.id}>
                  <time>{formatEventTime(event.start, event.allDay)}</time>
                  <div>
                    <h3>{event.title}</h3>
                    <p>{formatEventRelativeNote(event.start, event.end, event.allDay)} · {event.calendar}</p>
                  </div>
                  {index === 0 && <span className="agenda-marker" />}
                </article>
              ))}
            </div>
          )}
        </>
      )}

      {feedState.status === 'setup_required' && (
        <div className="bubble-state-content">
          <p className="next-label">AGENDA</p>
          <div className="state-card">
            <h3>Apple Calendar not connected</h3>
            <p>Add your iCloud App-Specific Password to <code>.env</code> on your computer to see your schedule.</p>
          </div>
        </div>
      )}

      {feedState.status === 'unavailable' && (
        <div className="bubble-state-content">
          <p className="next-label">AGENDA</p>
          <div className="state-card">
            <h3>Calendar Bridge Offline</h3>
            <p>Could not connect to the local calendar service. Ensure the local server is running.</p>
          </div>
        </div>
      )}

      <footer>
        {feedState.status === 'connected'
          ? `Apple Calendar · ${feedState.events.length} upcoming event${feedState.events.length === 1 ? '' : 's'}`
          : feedState.status === 'setup_required'
          ? 'Setup required · See SETUP_CALENDARIO.md'
          : feedState.status === 'loading'
          ? 'Connecting to Apple Calendar...'
          : 'Calendar service unavailable'}
      </footer>
    </Bubble>
  )
}
