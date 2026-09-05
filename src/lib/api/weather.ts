export type WeatherData = {
  city: string
  temperature: number
  feelsLike: number
  condition: string
  weatherCode: number
  humidity: number
  windSpeed: number
  high: number
  low: number
}

const DEFAULT_COORDS = {
  city: 'CATANIA',
  lat: 37.5079,
  lon: 15.0873,
}

type CachedWeather = {
  expiresAt: number
  key: string
  data: WeatherData
}

let weatherCache: CachedWeather | undefined
let pendingWeatherFetch: Promise<WeatherData> | null = null
const CACHE_DURATION_MS = 5 * 60 * 1000 // 5 minutes

export function getWeatherConditionDescription(code: number): string {
  if (code === 0) return 'Clear sky'
  if (code === 1) return 'Mainly clear'
  if (code === 2) return 'Partly cloudy'
  if (code === 3) return 'Overcast'
  if (code === 45 || code === 48) return 'Fog'
  if (code >= 51 && code <= 57) return 'Drizzle'
  if (code >= 61 && code <= 67) return 'Rain'
  if (code >= 71 && code <= 77) return 'Snow'
  if (code >= 80 && code <= 82) return 'Rain showers'
  if (code >= 95 && code <= 99) return 'Thunderstorm'
  return 'Clear'
}

export async function fetchLiveWeather(
  coords = DEFAULT_COORDS,
  signal?: AbortSignal
): Promise<WeatherData> {
  const cacheKey = `${coords.lat}_${coords.lon}`

  if (weatherCache && weatherCache.key === cacheKey && weatherCache.expiresAt > Date.now()) {
    return weatherCache.data
  }

  if (pendingWeatherFetch) {
    return pendingWeatherFetch
  }

  pendingWeatherFetch = (async () => {
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min&timezone=auto`

      const response = await fetch(url, { signal })
      if (!response.ok) {
        throw new Error(`Weather fetch failed: ${response.status}`)
      }

      const json = await response.json()
      const current = json.current
      const daily = json.daily

      const temperature = Math.round(current.temperature_2m)
      const feelsLike = Math.round(current.apparent_temperature)
      const humidity = Math.round(current.relative_humidity_2m)
      const windSpeed = Math.round(current.wind_speed_10m)
      const weatherCode = current.weather_code
      const high = Math.round(daily?.temperature_2m_max?.[0] ?? temperature)
      const low = Math.round(daily?.temperature_2m_min?.[0] ?? temperature)
      const condition = getWeatherConditionDescription(weatherCode)

      const result: WeatherData = {
        city: coords.city,
        temperature,
        feelsLike,
        condition,
        weatherCode,
        humidity,
        windSpeed,
        high,
        low,
      }

      weatherCache = {
        key: cacheKey,
        data: result,
        expiresAt: Date.now() + CACHE_DURATION_MS,
      }

      return result
    } catch {
      if (weatherCache) return weatherCache.data
      return {
        city: coords.city,
        temperature: 28,
        feelsLike: 29,
        condition: 'Clear sky',
        weatherCode: 0,
        humidity: 47,
        windSpeed: 12,
        high: 31,
        low: 23,
      }
    }
  })()

  try {
    return await pendingWeatherFetch
  } finally {
    pendingWeatherFetch = null
  }
}
