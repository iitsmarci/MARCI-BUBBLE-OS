export type ServerNewsItem = {
  category: string
  headline: string
  source: string
  published: string
  publishedAt: string
  url: string
}

type CachedNews = {
  expiresAt: number
  fetchedAt: number
  items: ServerNewsItem[]
}

let newsCache: CachedNews | undefined
const FIFTEEN_MINUTES = 15 * 60 * 1000

type FeedSource = {
  id: 'ansa-top' | 'ansa-world' | 'sole24' | 'ilpost' | 'gnews-it'
  name: string
  feedUrl: string
  category: string
}

const SOURCES: readonly FeedSource[] = [
  { id: 'ansa-top',   name: 'ANSA',             feedUrl: 'https://www.ansa.it/sito/notizie/topnews/topnews_rss.xml', category: 'ITALY' },
  { id: 'ansa-world', name: 'ANSA Mondo',       feedUrl: 'https://www.ansa.it/sito/notizie/mondo/mondo_rss.xml',     category: 'WORLD' },
  { id: 'sole24',     name: 'Il Sole 24 Ore',   feedUrl: 'https://www.ilsole24ore.com/rss/italia.xml',                category: 'ITALY' },
  { id: 'ilpost',     name: 'Il Post',          feedUrl: 'https://www.ilpost.it/feed/',                                category: 'ITALY' },
  { id: 'gnews-it',   name: 'Google News IT',   feedUrl: 'https://news.google.com/rss?hl=it&gl=IT&ceid=IT:it',         category: 'TOP' },
]

function decodeEntities(text: string): string {
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

function sanitizeUrl(url: string): string {
  try {
    const parsed = new URL(url)
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      return 'https://www.ansa.it'
    }
    return parsed.toString().slice(0, 500)
  } catch {
    return 'https://www.ansa.it'
  }
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

function extractTag(xml: string, tag: string): string {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i')
  const match = xml.match(re)
  if (!match) return ''
  return decodeEntities(match[1] ?? '')
}

function parseRss(xmlText: string, defaultCategory: string, sourceName: string, maxItems: number): ServerNewsItem[] {
  const items: ServerNewsItem[] = []
  const itemRe = /<item[\s\S]*?<\/item>/gi
  for (const m of xmlText.matchAll(itemRe)) {
    const block = m[0]
    const title = extractTag(block, 'title')
    const link = extractTag(block, 'link') || extractTag(block, 'guid')
    const pubDate = extractTag(block, 'pubDate')
    if (!title || !link) continue
    const cat = extractTag(block, 'category') || defaultCategory
    const parsedPub = pubDate ? new Date(pubDate) : null
    items.push({
      category: cat.toUpperCase().slice(0, 12) || defaultCategory,
      headline: title.replace(/\s+/g, ' ').slice(0, 220),
      source: sourceName,
      published: formatTimeAgo(pubDate),
      publishedAt: parsedPub && !Number.isNaN(parsedPub.getTime()) ? parsedPub.toISOString() : new Date().toISOString(),
      url: sanitizeUrl(link),
    })
    if (items.length >= maxItems) break
  }
  return items
}

async function fetchSource(source: FeedSource, maxItems: number, signal: AbortSignal): Promise<ServerNewsItem[]> {
  try {
    const res = await fetch(source.feedUrl, {
      signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        Accept: 'application/rss+xml, application/xml, text/xml',
      },
    })
    if (!res.ok) return []
    const xml = await res.text()
    return parseRss(xml, source.category, source.name, maxItems)
  } catch {
    return []
  }
}

function dedupeByUrl(items: readonly ServerNewsItem[]): ServerNewsItem[] {
  const seen = new Set<string>()
  const out: ServerNewsItem[] = []
  for (const item of items) {
    if (seen.has(item.url)) continue
    seen.add(item.url)
    out.push(item)
  }
  return out
}

const FALLBACK: readonly ServerNewsItem[] = [
  {
    category: 'ITALY',
    headline: 'Quotidiani italiani indipendenti connessi · ANSA, Il Sole 24 Ore, Il Post, Google News',
    source: 'Editorial Bridge',
    published: 'LIVE',
    publishedAt: new Date().toISOString(),
    url: 'https://www.ansa.it',
  },
  {
    category: 'TOP',
    headline: 'Le notizie del giorno sono in fase di sincronizzazione dai feed autorizzati.',
    source: 'Editorial Bridge',
    published: 'LIVE',
    publishedAt: new Date().toISOString(),
    url: 'https://www.ilsole24ore.com',
  },
  {
    category: 'WORLD',
    headline: 'Cronaca internazionale verificata · fonti qualificate a circuito editoriale indipendente.',
    source: 'Editorial Bridge',
    published: 'LIVE',
    publishedAt: new Date().toISOString(),
    url: 'https://www.ilpost.it',
  },
]

export async function fetchNewsFeed(signal?: AbortSignal): Promise<ServerNewsItem[]> {
  if (newsCache && newsCache.expiresAt > Date.now()) {
    return newsCache.items
  }

  const ac = new AbortController()
  const timeout = setTimeout(() => ac.abort(), 8000)
  if (signal) {
    signal.addEventListener('abort', () => ac.abort(), { once: true })
  }

  try {
    const perSource = SOURCES.map(async (s) => fetchSource(s, 4, ac.signal))
    const all = await Promise.all(perSource)
    const merged = all.flat().sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    const deduped = dedupeByUrl(merged).slice(0, 12)

    if (deduped.length > 0) {
      const fetchedAt = Date.now()
      newsCache = { items: deduped, expiresAt: fetchedAt + FIFTEEN_MINUTES, fetchedAt }
      return deduped
    }
  } catch {
    // fall through to FALLBACK
  } finally {
    clearTimeout(timeout)
  }

  return [...FALLBACK]
}

export function getNewsCacheTimestamp(): number | undefined {
  return newsCache?.fetchedAt
}
