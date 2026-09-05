export type ThemeMode = 'dark' | 'light'

export type Asset = {
  symbol: string
  name: string
  value: string
  delta: string
  direction: 'up' | 'down'
  points: readonly number[]
}

export type NewsItem = {
  category: string
  headline: string
  source: string
  published: string
  url?: string
}

export type ScheduleItem = {
  time: string
  title: string
  note: string
}
