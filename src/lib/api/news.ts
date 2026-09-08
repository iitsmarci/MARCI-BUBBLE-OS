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

const ANSA_RSS_URL = 'https://www.ansa.it/sito/ansait_rss.xml'
const CORS_PROXY_BASE = 'https://api.allorigins.win/raw?url='
const FETCH_TIMEOUT_MS = 4000
const CACHE_KEY = 'marci_bubble_news_feed'

export const FALLBACK_NEWS: readonly ServerNewsItem[] = [
  {
    category: 'TECNOLOGIA',
    headline: "Agenti IA e modelli generativi: l'evoluzione dei sistemi operativi personali intelligenti",
    source: 'ANSA Tech',
    published: '10m fa',
    publishedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    url: 'https://www.ansa.it/canale_tecnologia/',
  },
  {
    category: 'INNOVAZIONE',
    headline: "Transizione energetica e semiconduttori avanzati: nuove scoperte per l'efficienza dei data center",
    source: 'ANSA Scienza',
    published: '25m fa',
    publishedAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    url: 'https://www.ansa.it/canale_scienza_tecnica/',
  },
  {
    category: 'ITALIA',
    headline: 'Infrastrutture digitali e banda ultralarga: accelerano i progetti sul territorio',
    source: 'ANSA',
    published: '45m fa',
    publishedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    url: 'https://www.ansa.it/sito/notizie/cronaca/',
  },
  {
    category: 'ECONOMIA',
    headline: 'Mercati finanziari e borse europee: aperture positive sostenute dal comparto tecnologico',
    source: 'ANSA Economia',
    published: '1h fa',
    publishedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    url: 'https://www.ansa.it/sito/notizie/economia/',
  },
]

function toClientItems(items: readonly ServerNewsItem[]): readonly NewsItem[] {
  return items.map((i) => ({
    category: i.category,
    headline: i.headline,
    source: i.source,
    published: i.published,
    url: i.url,
  }))
}

function loadCached(): NewsFeedResponse | undefined {
  if (typeof window === 'undefined') return undefined
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return undefined
    const parsed = JSON.parse(raw) as NewsFeedResponse
    if (parsed && Array.isArray(parsed.items) && parsed.items.length > 0) {
      return parsed
    }
    return undefined
  } catch {
    return undefined
  }
}

function saveCached(payload: NewsFeedResponse): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(payload))
  } catch {
    // ignore storage errors
  }
}

export type NewsFeed = {
  items: readonly NewsItem[]
  sources: readonly string[]
  fetchedAt: Date | null
}

async function fetchRssFeed(rssUrl: string, timeoutMs: number, signal?: AbortSignal): Promise<ServerNewsItem[]> {
  const proxyUrl = `${CORS_PROXY_BASE}${encodeURIComponent(rssUrl)}`
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  if (signal) {
    signal.addEventListener('abort', () => controller.abort(), { once: true })
  }

  try {
    const res = await fetch(proxyUrl, { signal: controller.signal })
    if (!res.ok) throw new Error(`Proxy responded ${res.status}`)
    const xml = await res.text()
    const parsed = parseRssXml(xml, 'ANSA')
    if (parsed.length === 0) throw new Error('No items parsed from RSS feed')
    return parsed
  } finally {
    clearTimeout(timer)
  }
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

  let finalItems: readonly ServerNewsItem[] = []

  try {
    finalItems = await fetchRssFeed(ANSA_RSS_URL, FETCH_TIMEOUT_MS, signal)
  } catch {
    const cached = loadCached()
    if (cached && cached.items.length > 0) {
      finalItems = cached.items
    } else {
      finalItems = FALLBACK_NEWS
    }
  }

  const stamped: NewsFeedResponse = {
    status: 'ok',
    items: finalItems,
    fetchedAt: Date.now(),
  }
  saveCached(stamped)

  return {
    items: toClientItems(finalItems),
    sources: Array.from(new Set(finalItems.map((i) => i.source))),
    fetchedAt: new Date(stamped.fetchedAt!),
  }
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
    const cat = extractXmlTag(block, 'category') || 'ITALIA'
    const parsedPub = pubDate ? new Date(pubDate) : null
    items.push({
      category: cat.toUpperCase().slice(0, 12) || 'ITALIA',
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
