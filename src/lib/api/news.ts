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
  } catch (err) {
    const cached = loadCached()
    if (cached && cached.items.length > 0) {
      return {
        items: toClientItems(cached.items),
        sources: Array.from(new Set(cached.items.map((i) => i.source))),
        fetchedAt: cached.fetchedAt ? new Date(cached.fetchedAt) : null,
      }
    }
    // Fallback: try fetching RSS directly via CORS proxy
    try {
      const proxyItems = await fetchRssViaProxy(signal)
      if (proxyItems.length > 0) {
        const stamped: NewsFeedResponse = {
          status: 'ok',
          items: proxyItems as ServerNewsItem[],
          fetchedAt: Date.now(),
        }
        saveCached(stamped)
        return {
          items: toClientItems(proxyItems as ServerNewsItem[]),
          sources: Array.from(new Set(proxyItems.map((i) => i.source))),
          fetchedAt: new Date(stamped.fetchedAt!),
        }
      }
    } catch {
      // proxy fallback also failed
    }
    return { items: [], sources: [], fetchedAt: null }
  }
}

async function fetchRssViaProxy(signal?: AbortSignal): Promise<readonly ServerNewsItem[]> {
  const proxyUrl = 'https://api.allorigins.win/raw?url='
  const feeds = [
    { source: 'ANSA', url: 'https://www.ansa.it/sito/ansait_rss.xml' },
    { source: 'Il Sole 24 Ore', url: 'https://www.ilsole24ore.com/rss/italia.xml' },
  ]
  const results: ServerNewsItem[] = []
  for (const feed of feeds) {
    try {
      const res = await fetch(proxyUrl + encodeURIComponent(feed.url), { signal })
      if (!res.ok) continue
      const xml = await res.text()
      const parsed = parseRssXml(xml, feed.source)
      results.push(...parsed)
    } catch {
      continue
    }
  }
  return results
}

function parseRssXml(xmlText: string, sourceName: string): ServerNewsItem[] {
  const items: ServerNewsItem[] = []
  const itemRe = /<item[\s\S]*?<\/item>/gi
  for (const m of xmlText.matchAll(itemRe)) {
    const block = m[0]
    const title = extractXmlTag(block, 'title')
    const link = extractXmlTag(block, 'link') || extractXmlTag(block, 'guid')
    const pubDate = extractXmlTag(block, 'pubDate')
    if (!title || !link) continue
    const cat = extractXmlTag(block, 'category') || 'ITALY'
    const parsedPub = pubDate ? new Date(pubDate) : null
    items.push({
      category: cat.toUpperCase().slice(0, 12) || 'ITALY',
      headline: title.replace(/\s+/g, ' ').slice(0, 220),
      source: sourceName,
      published: formatTimeAgo(pubDate),
      publishedAt: parsedPub && !Number.isNaN(parsedPub.getTime()) ? parsedPub.toISOString() : new Date().toISOString(),
      url: link,
    })
    if (items.length >= 4) break
  }
  return items
}

function extractXmlTag(xml: string, tag: string): string {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i')
  const match = xml.match(re)
  if (!match) return ''
  return decodeXmlEntities(match[1] ?? '')
}

function decodeXmlEntities(text: string): string {
  return text
    .replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .trim()
}

function formatTimeAgo(dateStr: string): string {
  if (!dateStr) return '—'
  const pubDate = new Date(dateStr)
  if (Number.isNaN(pubDate.getTime())) return '—'
  const now = new Date()
  const diffMinutes = Math.floor((now.getTime() - pubDate.getTime()) / (60 * 1000))
  if (diffMinutes < 1) return 'ORA'
  if (diffMinutes < 60) return `${diffMinutes}m fa`
  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) {
    return new Intl.DateTimeFormat('it-IT', { hour: '2-digit', minute: '2-digit' }).format(pubDate)
  }
  return new Intl.DateTimeFormat('it-IT', { day: '2-digit', month: 'short' }).format(pubDate)
}
