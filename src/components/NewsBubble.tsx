import { useCallback, useEffect, useState } from 'react'
import { ArrowUpRight, RefreshCw } from 'lucide-react'
import { fetchLiveNews, type NewsFeed } from '../lib/api/news'
import type { NewsItem } from '../types/dashboard'
import { Bubble } from './Bubble'

const POLL_MS = 20 * 60 * 1000

function formatLastUpdate(d: Date | null): string {
  if (!d) return 'Mai aggiornato'
  const now = new Date()
  const diffMin = Math.floor((now.getTime() - d.getTime()) / 60_000)
  if (diffMin < 1) return 'Aggiornato ora'
  if (diffMin < 60) return `Aggiornato ${diffMin}m fa`
  return `Aggiornato alle ${new Intl.DateTimeFormat('it-IT', { hour: '2-digit', minute: '2-digit' }).format(d)}`
}

export function NewsBubble() {
  const [feed, setFeed] = useState<NewsFeed>({ items: [], sources: [], fetchedAt: null })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [isRefreshing, setIsRefreshing] = useState(false)

  const load = useCallback(async (opts?: { force?: boolean }) => {
    setStatus('loading')
    const result = await fetchLiveNews(undefined, opts)
    setFeed(result)
    setStatus(result.items.length > 0 ? 'success' : 'error')
    setIsRefreshing(false)
  }, [])

  useEffect(() => {
    load()
    const id = window.setInterval(() => load(), POLL_MS)
    return () => window.clearInterval(id)
  }, [load])

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true)
    load({ force: true })
  }, [load])

  const news = feed.items
  const isLoading = status === 'loading'
  const isEmpty = news.length === 0

  return (
    <Bubble
      title="News"
      className="news-bubble"
      meta={
        <span className="live-mini">
          <i />{' '}
          {status === 'success' && feed.sources.length > 0
            ? feed.sources.slice(0, 3).join(', ')
            : status === 'loading'
              ? 'SYNCING'
              : status === 'error'
                ? 'OFFLINE'
                : 'IDLE'}
        </span>
      }
      action={
        <button
          type="button"
          className="quiet-button news-refresh-btn"
          onClick={handleRefresh}
          disabled={isRefreshing}
          aria-label="Aggiorna notizie"
          title="Aggiorna notizie"
        >
          <RefreshCw size={15} strokeWidth={1.6} className={isRefreshing ? 'spin' : ''} />
        </button>
      }
    >
      <div className="news-list">
        {isEmpty && !isLoading ? (
          <div className="news-empty">
            <p>Nessuna notizia disponibile al momento.</p>
            <small>Controlla la connessione e riprova.</small>
          </div>
        ) : (
          news.map((item: NewsItem) => (
            <a
              className="news-row"
              key={item.url + item.headline}
              href={item.url || 'https://www.ansa.it'}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${item.category}: ${item.headline}`}
            >
              <div className="news-index">{item.category}</div>
              <div className="news-body">
                <h3>{item.headline}</h3>
                <p>
                  {item.source}
                  {item.published && item.published !== 'LIVE' ? (
                    <> · <span className="news-time">{item.published}</span></>
                  ) : null}
                </p>
              </div>
              <ArrowUpRight aria-hidden="true" size={17} />
            </a>
          ))
        )}
        {isLoading && isEmpty && (
          <div className="news-skeleton">
            {[1, 2, 3].map((i) => (
              <div key={i} className="news-skeleton-row">
                <div className="skeleton-line w-30" />
                <div className="skeleton-line w-90" />
                <div className="skeleton-line w-50" />
              </div>
            ))}
          </div>
        )}
      </div>
      <footer>
        {status === 'success'
          ? `${formatLastUpdate(feed.fetchedAt)} · ${news.length} notizie`
          : isLoading
            ? 'Aggiornamento notizie in corso...'
            : 'Connessione non riuscita · Riprova più tardi'}
      </footer>
    </Bubble>
  )
}
