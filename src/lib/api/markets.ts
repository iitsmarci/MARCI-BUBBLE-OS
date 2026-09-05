import type { Asset } from '../../types/dashboard'

type CachedMarkets = {
  expiresAt: number
  assets: readonly Asset[]
  fetchedAt: number
}

let marketsCache: CachedMarkets | undefined
let pendingFetch: Promise<MarketsFeed> | null = null
const CACHE_DURATION_MS = 45 * 1000

type Binance24hr = {
  symbol: string
  lastPrice: string
  priceChangePercent: string
}

type BinanceKline = [number, string, string, string, string, ...unknown[]]

function synthPoints(direction: 'up' | 'down', lastChange: number): number[] {
  const base = Array.from({ length: 24 }, (_, i) => 50 + Math.sin(i / 2) * 8)
  const trend = lastChange >= 0 ? 1 : -1
  const magnitude = Math.min(20, Math.abs(lastChange) * 4)
  return base.map((v, i) => v + (trend * (i / 24) * magnitude) - magnitude / 2)
}

function eurFromUsdt(usdtPrice: number, eurUsdRate: number): number {
  return usdtPrice / eurUsdRate
}

async function fetchBinanceSpot(symbol: string, name: string, cacheKey: string): Promise<Asset | null> {
  try {
    const pair = `${symbol}USDT`
    const [tickerRes, klinesRes, fxRes] = await Promise.all([
      fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${pair}`),
      fetch(`https://api.binance.com/api/v3/klines?symbol=${pair}&interval=1h&limit=24`),
      fetch('https://api.frankfurter.dev/v1/latest?base=EUR&symbols=USD'),
    ])
    if (!tickerRes.ok) return null
    const ticker = (await tickerRes.json()) as Binance24hr
    const usdPrice = parseFloat(ticker.lastPrice)
    const change = parseFloat(ticker.priceChangePercent)
    if (!Number.isFinite(usdPrice) || !Number.isFinite(change)) return null

    let eurPrice = usdPrice
    if (fxRes.ok) {
      const fx = (await fxRes.json()) as { rates?: { USD?: number } }
      if (fx.rates?.USD && fx.rates.USD > 0) {
        eurPrice = eurFromUsdt(usdPrice, fx.rates.USD)
      }
    }

    let points: number[] = []
    if (klinesRes.ok) {
      const klines = (await klinesRes.json()) as BinanceKline[]
      if (Array.isArray(klines) && klines.length > 0) {
        points = klines.map((k) => parseFloat(String(k[4])))
      }
    }
    if (points.length === 0) points = synthPoints(change >= 0 ? 'up' : 'down', change)

    return {
      symbol: cacheKey,
      name,
      value: `€ ${eurPrice.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      delta: `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`,
      direction: change >= 0 ? 'up' : 'down',
      points,
    }
  } catch {
    return null
  }
}

type CoinGeckoIds = { bitcoin?: { eur?: number; usd?: number; eur_24h_change?: number } } & {
  ethereum?: { eur?: number; usd?: number; eur_24h_change?: number }
  solana?: { eur?: number; usd?: number; eur_24h_change?: number }
}

async function fetchCoinGeckoAll(): Promise<{ btc: Asset | null; eth: Asset | null; sol: Asset | null }> {
  try {
    const res = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=eur,usd&include_24hr_change=true',
    )
    if (!res.ok) return { btc: null, eth: null, sol: null }
    const data = (await res.json()) as CoinGeckoIds
    const toAsset = (id: keyof CoinGeckoIds, cacheKey: string, name: string): Asset | null => {
      const coin = data[id]
      if (!coin || coin.eur === undefined || coin.eur_24h_change === undefined) return null
      const change = coin.eur_24h_change
      return {
        symbol: cacheKey,
        name,
        value: `€ ${coin.eur.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        delta: `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`,
        direction: change >= 0 ? 'up' : 'down',
        points: synthPoints(change >= 0 ? 'up' : 'down', change),
      }
    }
    return {
      btc: toAsset('bitcoin', 'BTC', 'Bitcoin'),
      eth: toAsset('ethereum', 'ETH', 'Ethereum'),
      sol: toAsset('solana', 'SOL', 'Solana'),
    }
  } catch {
    return { btc: null, eth: null, sol: null }
  }
}

async function fetchFrankfurterEurUsd(): Promise<Asset | null> {
  try {
    const res = await fetch('https://api.frankfurter.dev/v1/latest?base=EUR&symbols=USD')
    if (!res.ok) return null
    const data = (await res.json()) as { rates?: { USD?: number } }
    const rate = data.rates?.USD
    if (rate === undefined) return null
    return {
      symbol: 'EUR/USD',
      name: 'Euro / Dollar',
      value: rate.toFixed(4),
      delta: '—',
      direction: 'down',
      points: Array.from({ length: 24 }, (_, i) => 50 + Math.sin(i / 3) * 2),
    }
  } catch {
    return null
  }
}

export type MarketsFeed = {
  assets: readonly Asset[]
  fetchedAt: number
  sources: readonly string[]
}

export async function fetchLiveMarkets(signal?: AbortSignal): Promise<readonly Asset[]> {
  const result = await fetchMarketsFeed(signal)
  return result.assets
}

export async function fetchMarketsFeed(signal?: AbortSignal): Promise<MarketsFeed> {
  if (marketsCache && marketsCache.expiresAt > Date.now()) {
    return {
      assets: marketsCache.assets,
      fetchedAt: marketsCache.fetchedAt,
      sources: ['cache'],
    }
  }

  const inFlight = pendingFetch
  if (inFlight) {
    return await inFlight
  }

  const task = (async () => {
    const sources: string[] = []

    const [btcBinance, ethBinance, solBinance, cg, eurusd] = await Promise.all([
      fetchBinanceSpot('BTC', 'Bitcoin', 'BTC'),
      fetchBinanceSpot('ETH', 'Ethereum', 'ETH'),
      fetchBinanceSpot('SOL', 'Solana', 'SOL'),
      fetchCoinGeckoAll(),
      fetchFrankfurterEurUsd(),
    ])
    void signal

    const btc = btcBinance ?? cg.btc
    const eth = ethBinance ?? cg.eth
    const sol = solBinance ?? cg.sol

    if (btcBinance || cg.btc) sources.push('Binance', 'CoinGecko')

    const order = ['BTC', 'ETH', 'SOL', 'EUR/USD']
    const finalAssets: Asset[] = []
    if (btc) finalAssets.push(btc)
    if (eth) finalAssets.push(eth)
    if (sol) finalAssets.push(sol)
    if (eurusd) finalAssets.push(eurusd)
    finalAssets.sort((a, b) => order.indexOf(a.symbol) - order.indexOf(b.symbol))

    const fetchedAt = Date.now()
    if (finalAssets.length > 0) {
      marketsCache = { assets: finalAssets, expiresAt: fetchedAt + CACHE_DURATION_MS, fetchedAt }
    }
    return { assets: finalAssets, fetchedAt, sources }
  })()

  pendingFetch = task
  try {
    return await task
  } finally {
    pendingFetch = null
  }
}
