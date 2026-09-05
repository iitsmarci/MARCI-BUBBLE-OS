import { useState } from 'react'
import { ExternalLink, Pencil } from 'lucide-react'
import { Bubble } from './Bubble'

export type WazeDestination = {
  id: string
  label: string
  lat: number
  lon: number
  color: 'red' | 'yellow' | 'green'
}

const STORAGE_KEY = 'marci_bubble_waze_destinations'

const DEFAULT_DESTINATIONS: WazeDestination[] = [
  { id: 'home', label: 'Casa', lat: 37.5079, lon: 15.0873, color: 'green' },
  { id: 'gym', label: 'Palestra', lat: 37.52, lon: 15.08, color: 'yellow' },
  { id: 'work', label: 'Ufficio', lat: 37.49, lon: 15.07, color: 'red' },
]

function loadDestinations(): WazeDestination[] {
  if (typeof window === 'undefined') return DEFAULT_DESTINATIONS
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return JSON.parse(stored) as WazeDestination[]
  } catch {
    // ignore
  }
  return DEFAULT_DESTINATIONS
}

function buildWazeUrl(lat: number, lon: number): string {
  return `https://waze.com/ul?ll=${lat},${lon}&navigate=yes`
}

const TRAFFIC_LABELS: Record<WazeDestination['color'], string> = {
  green: 'FLUIDO',
  yellow: 'MODERATO',
  red: 'TRAFFICO',
}

export function WazeCommuteBubble() {
  const [destinations, setDestinations] = useState<WazeDestination[]>(() => loadDestinations())

  const cycleColor = (id: string) => {
    setDestinations((prev) => {
      const next: WazeDestination[] = prev.map((d) =>
        d.id === id
          ? { ...d, color: (d.color === 'green' ? 'yellow' : d.color === 'yellow' ? 'red' : 'green') as WazeDestination['color'] }
          : d,
      )
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      } catch {
        // ignore
      }
      return next
    })
  }

  return (
    <Bubble
      title="Waze Commute"
      className="waze-commute-bubble"
      meta={<span className="section-meta">NAVIGATOR</span>}
    >
      <div className="waze-list">
        {destinations.map((dest) => (
          <div className="waze-row" key={dest.id}>
            <div className={`waze-traffic-dot waze-traffic-dot--${dest.color}`} aria-label={`Stato traffico: ${TRAFFIC_LABELS[dest.color]}`} />
            <div className="waze-info">
              <b>{dest.label}</b>
              <span>{TRAFFIC_LABELS[dest.color]}</span>
            </div>
            <div className="waze-actions">
              <button
                type="button"
                className="waze-cycle-btn"
                onClick={() => cycleColor(dest.id)}
                aria-label={`Cambia stato traffico per ${dest.label}`}
                title="Cambia stato traffico"
              >
                <Pencil size={13} strokeWidth={1.6} />
              </button>
              <a
                href={buildWazeUrl(dest.lat, dest.lon)}
                target="_blank"
                rel="noopener noreferrer"
                className="waze-open-btn"
                aria-label={`Apri ${dest.label} su Waze`}
                title="Apri su Waze"
              >
                <ExternalLink size={14} strokeWidth={1.6} />
                <span>Waze</span>
              </a>
            </div>
          </div>
        ))}
      </div>
      <footer>Waze · Navigazione diretta al tragitto</footer>
    </Bubble>
  )
}
