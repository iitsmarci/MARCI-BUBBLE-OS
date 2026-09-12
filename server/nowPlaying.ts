import { nonEmptyEnvironmentValue } from './calendar.js'

export type ServerNowPlayingTrack = {
  title: string
  artist: string
  album: string
  coverUrl: string
  isNowPlaying: boolean
  playedAt: string | null
  url: string
}

export type ServerNowPlayingFeed =
  | { kind: 'connected'; track: ServerNowPlayingTrack }
  | { kind: 'idle'; lastTrack: ServerNowPlayingTrack | null }
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

function extractTrack(track: LastfmTrack): ServerNowPlayingTrack {
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
    url: track.url ?? 'https://www.last.fm/user/',
  }
}

function unwrapTracks(payload: LastfmResponse): LastfmTrack[] {
  const raw = payload.recenttracks?.track
  if (!raw) return []
  return Array.isArray(raw) ? raw : [raw]
}

export async function fetchLastfmNowPlaying(): Promise<ServerNowPlayingFeed> {
  const username = nonEmptyEnvironmentValue(process.env.LASTFM_USERNAME)
  const apiKey = nonEmptyEnvironmentValue(process.env.LASTFM_API_KEY)
  if (!username || !apiKey) {
    return { kind: 'unavailable' }
  }

  try {
    const url = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${encodeURIComponent(username)}&api_key=${encodeURIComponent(apiKey)}&format=json&limit=1`
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Marci-Bubble/1.0 (server-side proxy)' },
    })
    if (!response.ok) return { kind: 'unavailable' }
    const payload = (await response.json()) as LastfmResponse
    const tracks = unwrapTracks(payload)
    if (tracks.length === 0) return { kind: 'idle', lastTrack: null }

    const live = tracks.find((t) => t['@attr']?.nowplaying === 'true')
    if (live) return { kind: 'connected', track: extractTrack(live) }

    const recent = tracks[0]
    if (!recent) return { kind: 'idle', lastTrack: null }
    return { kind: 'idle', lastTrack: extractTrack(recent) }
  } catch {
    return { kind: 'unavailable' }
  }
}

export function hasLastfmCredentials(): boolean {
  return Boolean(nonEmptyEnvironmentValue(process.env.LASTFM_USERNAME) && nonEmptyEnvironmentValue(process.env.LASTFM_API_KEY))
}
