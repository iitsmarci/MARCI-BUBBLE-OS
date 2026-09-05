import type { NewsItem } from '../../types/dashboard'

export type ServerNewsItem = {
  category: string
  headline: string
  source: string
  published: string
  publishedAt: string
  url: string
}

type NewsFeedResponse = {
  status: 'ok' | 'error'
  items: readonly ServerNewsItem[]
  fetchedAt?: number
}

function isServerNewsItem(value: unknown): value is ServerNewsItem {
  if (typeof value !== 'object' || value === null) return false
  const i = value as Record<string, unknown>
  return (
    typeof i.category === 'string' &&
    typeof i.headline === 'string' &&
    typeof i.source === 'string' &&
    typeof i.published === 'string' &&
    typeof i.publishedAt === 'string' &&
    typeof i.url === 'string'
  )
}

function toClientItems(items: readonly ServerNewsItem[]): readonly NewsItem[] {
  return items.map((i) => ({
    category: i.category,
    headline: i.headline,
    source: i.source,
    published: i.published,
    url: i.url,
  }))
}

const CACHE_KEY = 'marci_bubble_news_bridge'

function loadCached(): NewsFeedResponse | undefined {
  if (typeof window === 'undefined') return undefined
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return undefined
    return JSON.parse(raw) as NewsFeedResponse
  } catch {
    return undefined
  }
}

function saveCached(payload: NewsFeedResponse): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(payload))
  } catch {
    // ignore
  }
}

export type NewsFeed = {
  items: readonly NewsItem[]
  sources: readonly string[]
  fetchedAt: Date | null
}

export async function fetchLiveNews(signal?: AbortSignal, opts?: { force?: boolean }): Promise<NewsFeed> {
  if (!opts?.force) {
    const cached = loadCached()
    if (cached && cached.items.length > 0) {
      return {
        items: toClientItems(cached.items),
        sources: Array.from(new Set(cached.items.map((i) => i.source))),
        fetchedAt: cached.fetchedAt ? new Date(cached.fetchedAt) : null,
      }
    }
  }

  try {
    const url = opts?.force ? '/api/news?refresh=1' : '/api/news'
    const response = await fetch(url, { signal })
    if (!response.ok) throw new Error(`News bridge responded ${response.status}`)
    const json = (await response.json()) as unknown
    if (typeof json !== 'object' || json === null) throw new Error('Invalid payload')
    const payload = json as NewsFeedResponse
    const items = Array.isArray(payload.items) ? payload.items.filter(isServerNewsItem) : []
    if (items.length === 0) throw new Error('Empty feed')
    const stamped: NewsFeedResponse = { ...payload, items, fetchedAt: Date.now() }
    saveCached(stamped)
    return {
      items: toClientItems(items),
      sources: Array.from(new Set(items.map((i) => i.source))),
      fetchedAt: new Date(stamped.fetchedAt!),
    }
  } catch {
    const cached = loadCached()
    if (cached && cached.items.length > 0) {
      return {
        items: toClientItems(cached.items),
        sources: Array.from(new Set(cached.items.map((i) => i.source))),
        fetchedAt: cached.fetchedAt ? new Date(cached.fetchedAt) : null,
      }
    }
    return { items: [], sources: [], fetchedAt: null }
  }
}
