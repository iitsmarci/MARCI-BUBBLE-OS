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

export function hasLastfmCredentials(): boolean {
  return true
}

export async function fetchLastfmNowPlaying(): Promise<NowPlayingFeed> {
  try {
    const response = await fetch('/api/nowplaying', {
      headers: { Accept: 'application/json' },
    })
    if (!response.ok) return { kind: 'unavailable' }
    return (await response.json()) as NowPlayingFeed
  } catch {
    return { kind: 'unavailable' }
  }
}