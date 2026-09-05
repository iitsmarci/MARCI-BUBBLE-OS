import { useEffect, useState } from 'react'
import { SlidersHorizontal } from 'lucide-react'
import { formatHeaderDate, formatHeaderDay } from '../lib/time'

type HeaderProps = {
  theme: 'dark' | 'light'
  onToggleTheme: () => void
  onOpenSettings: () => void
  isLive?: boolean
}

export function Header({ theme, onToggleTheme, onOpenSettings, isLive = true }: HeaderProps) {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60000)
    return () => window.clearInterval(timer)
  }, [])

  return (
    <header className="topbar">
      <a className="wordmark" href="#dashboard" aria-label="Marci Bubble dashboard">
        MARCI <i /> BUBBLE
      </a>
      <div className="topbar-center">
        <span>{formatHeaderDay(now)}</span>
        <span className="dot-separator">{formatHeaderDate(now)}</span>
      </div>
      <nav className="topbar-actions" aria-label="Azioni dashboard">
        <button
          className="live-status"
          type="button"
          onClick={onOpenSettings}
          aria-label="Stato connessione dati dashboard"
        >
          <i className={isLive ? 'live-dot-green' : 'live-dot-amber'} /> {isLive ? 'DATA / LIVE' : 'DATA / PARTIAL'}
        </button>
        <button
          className="theme-button"
          type="button"
          onClick={onToggleTheme}
          aria-label={`Cambia tema, attuale: ${theme}`}
        >
          <span className="theme-label-full">Theme: {theme === 'dark' ? 'Dark' : 'Light'}</span>
          <span className="theme-label-compact">{theme === 'dark' ? 'Dark' : 'Light'}</span>
        </button>
        <button
          className="icon-button"
          type="button"
          onClick={onOpenSettings}
          aria-label="Apri impostazioni"
        >
          <SlidersHorizontal size={18} strokeWidth={1.6} />
        </button>
      </nav>
    </header>
  )
}
