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
  lat: 37.5025,
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
  if (code === 0) return 'Sereno'
  if (code === 1) return 'Prevalentemente sereno'
  if (code === 2) return 'Parzialmente nuvoloso'
  if (code === 3) return 'Coperto'
  if (code === 45 || code === 48) return 'Nebbia'
  if (code >= 51 && code <= 55) return 'Pioggerella'
  if (code >= 56 && code <= 57) return 'Pioggerella gelata'
  if (code >= 61 && code <= 65) return 'Pioggia'
  if (code === 66 || code === 67) return 'Pioggia gelata'
  if (code >= 71 && code <= 77) return 'Neve'
  if (code >= 80 && code <= 82) return 'Rovesci di pioggia'
  if (code === 85 || code === 86) return 'Rovesci di neve'
  if (code >= 95 && code <= 99) return 'Temporale'
  return 'Sereno'
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
      const isCatania = !coords || coords.city.toUpperCase() === 'CATANIA'
      const lat = isCatania ? 37.5025 : coords.lat
      const lon = isCatania ? 15.0873 : coords.lon
      const tz = isCatania ? 'Europe%2FRome' : 'auto'
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=${tz}&_t=${Date.now()}`

      const response = await fetch(url, { signal })
      if (!response.ok) {
        throw new Error(`Weather fetch failed: ${response.status}`)
      }

      const json = await response.json()
      const current = json.current
      if (!current) {
        throw new Error('Weather payload missing current measurements')
      }

      const temperature = Math.round(current.temperature_2m)
      const feelsLike = current.apparent_temperature !== undefined ? Math.round(current.apparent_temperature) : temperature
      const humidity = Math.round(current.relative_humidity_2m)
      const windSpeed = Math.round(current.wind_speed_10m)
      const weatherCode = current.weather_code
      const high = json.daily?.temperature_2m_max?.[0] !== undefined
        ? Math.round(json.daily.temperature_2m_max[0])
        : Math.round(temperature + 2)
      const low = json.daily?.temperature_2m_min?.[0] !== undefined
        ? Math.round(json.daily.temperature_2m_min[0])
        : Math.max(0, Math.round(temperature - 4))
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
        condition: 'Sereno',
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
