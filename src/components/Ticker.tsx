import { fetchLiveMarkets } from '../lib/api/markets'
import { fetchLiveWeather, type WeatherData } from '../lib/api/weather'
import { useDataFeed } from '../lib/hooks/useDataFeed'
import type { CityPreset } from '../lib/settings'
import type { Asset } from '../types/dashboard'

type TickerProps = {
  cityPreset?: CityPreset
}

export function Ticker({ cityPreset }: TickerProps) {
  const activeCity = cityPreset ?? {
    city: 'CATANIA',
    name: 'Catania, Italy',
    lat: 37.5079,
    lon: 15.0873,
    timeZone: 'Europe/Rome',
  }

  const { data: assets } = useDataFeed<readonly Asset[]>({
    fetcher: fetchLiveMarkets,
    refreshIntervalMs: 30 * 1000,
    cacheKey: 'market_assets',
    initialData: undefined,
  })

  const { data: weather } = useDataFeed<WeatherData>({
    fetcher: (signal) =>
      fetchLiveWeather({ city: activeCity.city, lat: activeCity.lat, lon: activeCity.lon }, signal),
    refreshIntervalMs: 15 * 60 * 1000,
    cacheKey: `ticker_weather_${activeCity.city.toLowerCase()}`,
    initialData: {
      city: activeCity.city,
      temperature: 28,
      feelsLike: 29,
      condition: 'CLEAR',
      weatherCode: 0,
      humidity: 47,
      windSpeed: 12,
      high: 31,
      low: 23,
    },
  })

  const currentAssets = assets ?? []
  const currentWeather = weather ?? {
    city: activeCity.city,
    temperature: 28,
    condition: 'CLEAR',
  }

  const renderItems = (keyPrefix: string) => (
    <>
      {currentAssets.length > 0 ? (
        currentAssets.map((asset) => (
          <span key={`${keyPrefix}-${asset.symbol}`}>
            <b>{asset.symbol}</b> {asset.value}{' '}
            <em className={asset.direction}>{asset.delta}</em>
          </span>
        ))
      ) : (
        <>
          <span key={`${keyPrefix}-btc`}><b>BTC</b> -- <em className="muted">…</em></span>
          <span key={`${keyPrefix}-eth`}><b>ETH</b> -- <em className="muted">…</em></span>
          <span key={`${keyPrefix}-sol`}><b>SOL</b> -- <em className="muted">…</em></span>
        </>
      )}
      <span key={`${keyPrefix}-weather`}>
        <b>{currentWeather.city}</b> {currentWeather.temperature}°C{' '}
        <em className="muted">{currentWeather.condition.toUpperCase()}</em>
      </span>
    </>
  )

  return (
    <div className="ticker" aria-label="Ticker dati finanziari e meteo live">
      <div className="ticker-track">
        <div className="ticker-segment">{renderItems('primary')}</div>
        <div className="ticker-segment" aria-hidden="true">
          {renderItems('secondary')}
        </div>
      </div>
    </div>
  )
}
