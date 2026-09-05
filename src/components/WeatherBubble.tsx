import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  Droplets,
  Sun,
  Wind,
} from 'lucide-react'
import { fetchLiveWeather, type WeatherData } from '../lib/api/weather'
import { useDataFeed } from '../lib/hooks/useDataFeed'
import type { CityPreset } from '../lib/settings'
import { Bubble } from './Bubble'

function WeatherIcon({ code }: { code: number }) {
  if (code === 0) return <Sun className="weather-icon" size={68} strokeWidth={1.2} />
  if (code === 1 || code === 2) return <CloudSun className="weather-icon" size={68} strokeWidth={1.2} />
  if (code === 3) return <Cloud className="weather-icon" size={68} strokeWidth={1.2} />
  if (code === 45 || code === 48) return <CloudFog className="weather-icon" size={68} strokeWidth={1.2} />
  if (code >= 51 && code <= 57) return <CloudDrizzle className="weather-icon" size={68} strokeWidth={1.2} />
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82))
    return <CloudRain className="weather-icon" size={68} strokeWidth={1.2} />
  if (code >= 71 && code <= 77) return <CloudSnow className="weather-icon" size={68} strokeWidth={1.2} />
  if (code >= 95) return <CloudLightning className="weather-icon" size={68} strokeWidth={1.2} />
  return <CloudSun className="weather-icon" size={68} strokeWidth={1.2} />
}

type WeatherBubbleProps = {
  cityPreset?: CityPreset
}

export function WeatherBubble({ cityPreset }: WeatherBubbleProps) {
  const activeCity = cityPreset ?? {
    city: 'CATANIA',
    name: 'Catania, Italy',
    lat: 37.5079,
    lon: 15.0873,
    timeZone: 'Europe/Rome',
  }

  const { data: weather, status } = useDataFeed<WeatherData>({
    fetcher: (signal) =>
      fetchLiveWeather({ city: activeCity.city, lat: activeCity.lat, lon: activeCity.lon }, signal),
    refreshIntervalMs: 15 * 60 * 1000,
    cacheKey: `weather_${activeCity.city.toLowerCase()}`,
    initialData: {
      city: activeCity.city,
      temperature: 28,
      feelsLike: 29,
      condition: 'Clear sky',
      weatherCode: 0,
      humidity: 47,
      windSpeed: 12,
      high: 31,
      low: 23,
    },
  })

  const current = weather ?? {
    city: activeCity.city,
    temperature: 28,
    feelsLike: 29,
    condition: 'Clear sky',
    weatherCode: 0,
    humidity: 47,
    windSpeed: 12,
    high: 31,
    low: 23,
  }

  return (
    <Bubble
      title="Weather"
      className="weather-bubble"
      meta={
        <span className="live-mini">
          <i /> {status === 'success' ? 'OPEN-METEO' : 'CACHED'}
        </span>
      }
    >
      <div className="weather-main">
        <div>
          <p className="weather-place">{current.city}</p>
          <p className="weather-temp">{current.temperature}°</p>
          <p className="weather-condition">
            {current.condition} · feels like {current.feelsLike}°
          </p>
        </div>
        <WeatherIcon code={current.weatherCode} />
      </div>
      <div className="weather-stats">
        <span>
          HIGH <b>{current.high}°</b>
        </span>
        <span>
          LOW <b>{current.low}°</b>
        </span>
        <span>
          <Droplets size={14} /> <b>{current.humidity}%</b>
        </span>
        <span>
          <Wind size={14} /> <b>{current.windSpeed} km/h</b>
        </span>
      </div>
      <footer>Open-Meteo · Live weather for {current.city.toLowerCase()}</footer>
    </Bubble>
  )
}