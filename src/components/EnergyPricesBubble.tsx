import { Fuel, Flame, ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { fetchEnergyFeed, type EnergyEntry } from '../lib/api/energy'
import { useDataFeed } from '../lib/hooks/useDataFeed'
import { Bubble } from './Bubble'

function TrendIcon({ direction }: { direction: EnergyEntry['direction'] }) {
  if (direction === 'up') return <ArrowUpRight size={13} strokeWidth={1.6} />
  if (direction === 'down') return <ArrowDownRight size={13} strokeWidth={1.6} />
  return <span>·</span>
}

export function EnergyPricesBubble() {
  const { data, status } = useDataFeed<readonly EnergyEntry[]>({
    fetcher: () => fetchEnergyFeed().then((r) => r.entries),
    refreshIntervalMs: 12 * 60 * 60 * 1000,
    cacheKey: 'live_energy_prices',
    initialData: undefined,
  })

  const entries = data ?? []
  const isLive = status === 'success'
  const isLoading = status === 'loading' && entries.length === 0

  const sources = (() => {
    const cached = localStorage.getItem('marci_bubble_energy_sources')
    return cached ? JSON.parse(cached) as string[] : []
  })()

  const sourceLabel = sources.length > 0
    ? sources.join(', ')
    : 'MISE · GME'

  return (
    <Bubble
      title="Energy & Fuel"
      className="energy-prices-bubble"
      meta={
        <span className="live-mini">
          <i /> {isLive ? 'LIVE' : isLoading ? 'SYNCING' : status === 'unavailable' ? 'OFFLINE' : 'CACHED'}
        </span>
      }
    >
      <div className="energy-list">
        {entries.length === 0 && isLoading ? (
          <div className="energy-skeleton">
            <div className="skeleton-line w-70" />
            <div className="skeleton-line w-50" />
            <div className="skeleton-line w-60" />
            <div className="skeleton-line w-40" />
            <div className="skeleton-line w-55" />
          </div>
        ) : (
          entries.map((entry) => (
            <div className="energy-row" key={entry.label}>
              <div className="energy-icon" aria-hidden="true">
                {entry.label === 'PUN Energia' || entry.label === 'PSV Gas'
                  ? <Flame size={15} strokeWidth={1.4} />
                  : <Fuel size={15} strokeWidth={1.4} />}
              </div>
              <div className="energy-info">
                <b>{entry.label}</b>
                <span>{entry.unit}</span>
              </div>
              <div className="energy-price">
                <b>{entry.value}</b>
                <span className={`energy-delta energy-delta--${entry.direction}`}>
                  <TrendIcon direction={entry.direction} /> {entry.delta}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
      <footer>
        {isLive && entries.length > 0
          ? `Aggiornato oggi alle ${entries[0] ? new Intl.DateTimeFormat('it-IT', { hour: '2-digit', minute: '2-digit' }).format(new Date(entries[0]!.updatedAt)) : '--:--'} · Fonti: ${sourceLabel}`
          : isLoading
            ? 'Sincronizzazione in corso...'
            : 'Connessione non riuscita · Riprova più tardi'}
      </footer>
    </Bubble>
  )
}
