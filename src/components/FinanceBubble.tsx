import { ArrowDownRight, ArrowUpRight, MoreHorizontal } from 'lucide-react'
import { fetchMarketsFeed } from '../lib/api/markets'
import { useDataFeed } from '../lib/hooks/useDataFeed'
import type { Asset } from '../types/dashboard'
import { Bubble } from './Bubble'
import { Sparkline } from './Sparkline'

type FinanceBubbleProps = {
  onOpenMenu?: () => void
}

function formatDateTime(d: Date | null): string {
  if (!d) return ''
  const date = new Intl.DateTimeFormat('it-IT', { day: '2-digit', month: 'short' }).format(d)
  const time = new Intl.DateTimeFormat('it-IT', { hour: '2-digit', minute: '2-digit' }).format(d)
  return `${date} · ${time}`
}

export function FinanceBubble({ onOpenMenu }: FinanceBubbleProps) {
  const { data, status, updatedAt } = useDataFeed<readonly Asset[]>({
    fetcher: () => fetchMarketsFeed().then((r) => r.assets),
    refreshIntervalMs: 30 * 1000,
    cacheKey: 'market_assets',
    initialData: undefined,
  })

  const currentAssets = data ?? []
  const isLive = status === 'success'
  const isLoading = status === 'loading' && currentAssets.length === 0

  return (
    <Bubble
      title="Markets"
      className="finance-bubble"
      meta={
        <span className="live-mini">
          <i /> {isLive ? 'LIVE · BINANCE' : isLoading ? 'SYNCING' : status === 'unavailable' ? 'OFFLINE' : 'CACHED'}
        </span>
      }
      action={
        <button
          className="quiet-button"
          aria-label="Altre opzioni mercati"
          type="button"
          onClick={onOpenMenu}
        >
          <MoreHorizontal size={18} />
        </button>
      }
    >
      <div className="market-list">
        {currentAssets.length === 0 ? (
          <div className="energy-skeleton">
            <div className="skeleton-line w-70" />
            <div className="skeleton-line w-50" />
            <div className="skeleton-line w-60" />
            <div className="skeleton-line w-40" />
          </div>
        ) : (
          currentAssets.map((asset) => (
            <article className="market-row" key={asset.symbol}>
              <div className="asset-ident">
                <b>{asset.symbol}</b>
                <span>{asset.name}</span>
              </div>
              <Sparkline points={asset.points} direction={asset.direction} />
              <div className="asset-price">
                <b>{asset.value}</b>
                <span className={asset.direction}>
                  {asset.direction === 'up' ? <ArrowUpRight size={13} /> : asset.direction === 'down' ? <ArrowDownRight size={13} /> : <span>·</span>}{' '}
                  {asset.delta}
                </span>
              </div>
            </article>
          ))
        )}
      </div>
      <footer>
        {isLive && updatedAt
          ? `Aggiornato oggi alle ${new Intl.DateTimeFormat('it-IT', { hour: '2-digit', minute: '2-digit' }).format(updatedAt)} · Binance + CoinGecko + Frankfurter`
          : isLoading
            ? 'Aggiornamento in corso...'
            : 'Connessione ai mercati non riuscita'}
      </footer>
    </Bubble>
  )
}
