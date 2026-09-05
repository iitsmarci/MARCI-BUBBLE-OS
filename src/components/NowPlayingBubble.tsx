import { useCallback, useEffect, useState } from 'react'
import { Headphones, Radio } from 'lucide-react'
import { Bubble } from './Bubble'
import { fetchLastfmNowPlaying, hasLastfmCredentials, type NowPlayingFeed } from '../lib/api/nowPlaying'

const POLL_MS = 10_000

function LiveDot() {
  return <span className="np-live-dot" aria-hidden="true" />
}

function formatPlayedAt(iso: string | null): string {
  if (!iso) return ''
  const date = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60_000)
  const diffH = Math.floor(diffMin / 60)
  if (diffMin < 1) return 'appena ora'
  if (diffMin < 60) return `${diffMin}m fa`
  if (diffH < 24) return `${diffH}h fa`
  return new Intl.DateTimeFormat('it-IT', { day: 'numeric', month: 'short' }).format(date)
}

export function NowPlayingBubble() {
  const [feed, setFeed] = useState<NowPlayingFeed>(() => ({ kind: 'idle', lastTrack: null }))
  const [isLoading, setIsLoading] = useState(true)
  const hasCreds = hasLastfmCredentials()

  const load = useCallback(async () => {
    const result = await fetchLastfmNowPlaying()
    setFeed(result)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    load()
    const id = window.setInterval(load, POLL_MS)
    return () => window.clearInterval(id)
  }, [load])

  const statusLabel = (() => {
    if (isLoading || !hasCreds) return 'IDLE'
    if (feed.kind === 'unavailable') return 'OFFLINE'
    if (feed.kind === 'connected') return 'LIVE'
    return 'IDLE'
  })()

  const liveTrack = feed.kind === 'connected' ? feed.track : null
  const lastTrack = feed.kind === 'idle' ? feed.lastTrack : null
  const t = liveTrack ?? lastTrack
  const showCoverImg = liveTrack !== null && liveTrack.coverUrl.length > 0

  return (
    <Bubble
      title="Now Playing"
      className="now-playing-bubble"
      meta={
        <span className="live-mini">
          <i /> {statusLabel}
        </span>
      }
    >
      <div className="np-center">
        <div className="np-cover-wrap">
          {showCoverImg ? (
            <div className="np-cover">
              <img
                src={liveTrack!.coverUrl}
                alt={`Copertina di ${liveTrack!.album || liveTrack!.title}`}
                className="np-cover-img"
              />
              <LiveDot />
            </div>
          ) : (
            <div className="np-cover" aria-hidden="true">
              <Headphones size={42} strokeWidth={1.2} />
            </div>
          )}
        </div>

        <div className="np-meta">
          {t ? (
            <>
              <div className="np-badge-row">
                {liveTrack ? (
                  <span className="np-playing-badge">
                    <Radio size={10} strokeWidth={2} />
                    PLAYING
                  </span>
                ) : (
                  <span className="np-idle-badge">ULTIMO ASCOLTO</span>
                )}
              </div>
              <b className="np-title">{t.title}</b>
              <span className="np-artist">{t.artist}</span>
              {t.album && <small className="np-album">{t.album}</small>}
              <span className="np-when">
                {liveTrack
                  ? 'In riproduzione ora · Last.fm'
                  : `Ascoltato ${formatPlayedAt(t.playedAt)} · Last.fm`}
              </span>
            </>
          ) : (
            <>
              <div className="np-badge-row">
                <span className="np-idle-badge">SILENZIO</span>
              </div>
              <b className="np-title">Nessun brano in riproduzione</b>
              <span className="np-artist">Nessuna sessione audio attiva</span>
              {!hasCreds && (
                <small className="np-album">Aggiungi VITE_LASTFM_USERNAME e VITE_LASTFM_API_KEY in .env</small>
              )}
              {hasCreds && feed.kind === 'unavailable' && (
                <small className="np-album">Connessione a Last.fm non riuscita</small>
              )}
              {hasCreds && isLoading && (
                <small className="np-album">Caricamento in corso...</small>
              )}
            </>
          )}
        </div>
      </div>
    </Bubble>
  )
}
