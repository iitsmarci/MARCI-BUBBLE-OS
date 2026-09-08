export type NowPlayingTrack = {
  title: string
  artist: string
  album: string
  coverUrl: string
  isNowPlaying: boolean
  playedAt: string | null
  url: string
}

export type NowPlayingFeed =
  | { kind: 'connected'; track: NowPlayingTrack }
  | { kind: 'idle'; lastTrack: NowPlayingTrack | null }
  | { kind: 'unavailable' }

type LastfmRecentTrackAttr = { nowplaying?: string }
type LastfmImage = { '#text': string; size: string }
type LastfmArtist = { '#text': string }
type LastfmAlbum = { '#text': string }
type LastfmDate = { uts: string; '#text': string }
type LastfmTrack = {
  name: string
  mbid?: string
  url?: string
  artist: LastfmArtist
  album: LastfmAlbum
  image: LastfmImage[]
  date?: LastfmDate
  '@attr'?: LastfmRecentTrackAttr
}
type LastfmResponse = {
  recenttracks?: {
    track?: LastfmTrack[] | LastfmTrack
  }
}

function pickBestImage(images: readonly LastfmImage[] | undefined): string {
  if (!images || images.length === 0) return ''
  const priority = ['extralarge', 'large', 'medium', 'small']
  for (const size of priority) {
    const found = images.find((img) => img.size === size && img['#text'])
    if (found && found['#text']) return found['#text']
  }
  const fallback = images.find((img) => img['#text'])
  return fallback && fallback['#text'] ? fallback['#text'] : ''
}

function generatePlaceholderSvg(artist: string, album: string): string {
  const safeArtist = encodeURIComponent(artist.slice(0, 20))
  const safeAlbum = encodeURIComponent(album.slice(0, 20))
  const bg = '1a1a2e'
  const accent = '00d4aa'
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300">
    <rect fill="#${bg}" width="300" height="300"/>
    <circle cx="150" cy="120" r="50" fill="none" stroke="#${accent}" stroke-width="3"/>
    <rect x="100" y="185" width="100" height="4" rx="2" fill="#${accent}"/>
    <text x="150" y="240" font-family="system-ui, sans-serif" font-size="14" fill="#${accent}" text-anchor="middle" opacity="0.7">${safeArtist}</text>
    <text x="150" y="260" font-family="system-ui, sans-serif" font-size="12" fill="#${accent}" text-anchor="middle" opacity="0.5">${safeAlbum}</text>
  </svg>`
  return `data:image/svg+xml;base64,${btoa(svg)}`
}

function readEnv(): { username: string; apiKey: string } | undefined {
  const env = import.meta.env
  const username = typeof env.VITE_LASTFM_USERNAME === 'string' ? env.VITE_LASTFM_USERNAME.trim() : ''
  const apiKey = typeof env.VITE_LASTFM_API_KEY === 'string' ? env.VITE_LASTFM_API_KEY.trim() : ''
  return username.length === 0 || apiKey.length === 0 ? undefined : { username, apiKey }
}

export function hasLastfmCredentials(): boolean {
  return readEnv() !== undefined
}

async function fetchRecentTracks(): Promise<LastfmResponse> {
  const creds = readEnv()
  if (creds === undefined) {
    throw new Error('Missing VITE_LASTFM_USERNAME or VITE_LASTFM_API_KEY')
  }
  const url = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${encodeURIComponent(creds.username)}&api_key=${encodeURIComponent(creds.apiKey)}&format=json&limit=1`
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Last.fm responded with ${response.status}`)
  }
  return (await response.json()) as LastfmResponse
}

function extractTrack(track: LastfmTrack): NowPlayingTrack {
  const isNowPlaying = track['@attr']?.nowplaying === 'true'
  const coverUrl = pickBestImage(track.image) || generatePlaceholderSvg(
    track.artist?.['#text'] ?? 'Unknown',
    track.album?.['#text'] ?? 'Unknown Album',
  )
  return {
    title: track.name ?? 'Unknown',
    artist: track.artist?.['#text'] ?? 'Unknown artist',
    album: track.album?.['#text'] ?? '',
    coverUrl,
    isNowPlaying,
    playedAt: track.date?.uts ? new Date(parseInt(track.date.uts, 10) * 1000).toISOString() : null,
    url: track.url ?? 'https://www.last.fm/user/' + (import.meta.env.VITE_LASTFM_USERNAME ?? ''),
  }
}

function unwrapTracks(payload: LastfmResponse): LastfmTrack[] {
  const raw = payload.recenttracks?.track
  if (!raw) return []
  return Array.isArray(raw) ? raw : [raw]
}

export async function fetchLastfmNowPlaying(): Promise<NowPlayingFeed> {
  try {
    const payload = await fetchRecentTracks()
    const tracks = unwrapTracks(payload)
    if (tracks.length === 0) return { kind: 'idle', lastTrack: null }

    const live = tracks.find((t) => t['@attr']?.nowplaying === 'true')
    if (live) {
      return { kind: 'connected', track: extractTrack(live) }
    }

    const recent = tracks[0]
    if (!recent) return { kind: 'idle', lastTrack: null }
    return { kind: 'idle', lastTrack: extractTrack(recent) }
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('Missing VITE_LASTFM')) {
      return { kind: 'unavailable' }
    }
    return { kind: 'unavailable' }
  }
}
