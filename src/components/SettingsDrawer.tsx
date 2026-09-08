import { useEffect } from 'react'
import { Check, X } from 'lucide-react'
import { CITY_PRESETS, type CityPreset } from '../lib/settings'

type SettingsDrawerProps = {
  isOpen: boolean
  onClose: () => void
  currentCity: CityPreset
  onSelectCity: (city: CityPreset) => void
}

export function SettingsDrawer({
  isOpen,
  onClose,
  currentCity,
  onSelectCity,
}: SettingsDrawerProps) {
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="drawer-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Impostazioni Dashboard"
    >
      <aside className="drawer-panel" onClick={(e) => e.stopPropagation()}>
        <header className="drawer-header">
          <div>
            <h2>INSTRUMENT SETTINGS</h2>
            <p>Configure personal feeds and preferences</p>
          </div>
          <button
            className="quiet-button drawer-close"
            onClick={onClose}
            aria-label="Chiudi impostazioni"
            type="button"
          >
            <X size={20} />
          </button>
        </header>

        <section className="drawer-section">
          <h3>LOCATION & WEATHER</h3>
          <p className="drawer-help">Choose your primary city for local weather and hero headers.</p>
          <div className="preset-list">
            {CITY_PRESETS.map((preset) => {
              const isSelected = preset.city === currentCity.city
              return (
                <button
                  key={preset.city}
                  type="button"
                  className={`preset-item ${isSelected ? 'active' : ''}`}
                  onClick={() => onSelectCity(preset)}
                >
                  <div>
                    <b>{preset.city}</b>
                    <span>{preset.name}</span>
                  </div>
                  {isSelected && <Check size={16} className="preset-check" />}
                </button>
              )
            })}
          </div>
        </section>

        <section className="drawer-section">
          <h3>AGENDA CALENDARIO</h3>
          <div className="drawer-info-box">
            <p>
              <strong>Status:</strong>{' '}
              {typeof import.meta !== 'undefined' && import.meta.env?.VITE_CALENDAR_ICAL_URL
                ? 'Feed iCal configurato'
                : 'Agenda Locale attiva'}
            </p>
            <p>
              {typeof import.meta !== 'undefined' && import.meta.env?.VITE_CALENDAR_ICAL_URL
                ? 'Sincronizzazione eventi attiva da feed remoto.'
                : 'Funzionamento autonomo senza dipendenza da server locali.'}
            </p>
          </div>
        </section>

        <section className="drawer-section">
          <h3>DATA FEEDS</h3>
          <div className="feed-status-list">
            <div className="feed-status-row">
              <span>Open-Meteo API</span>
              <span className="live-mini">
                <i /> LIVE
              </span>
            </div>
            <div className="feed-status-row">
              <span>Binance Public Market</span>
              <span className="live-mini">
                <i /> LIVE
              </span>
            </div>
            <div className="feed-status-row">
              <span>Frankfurter Forex</span>
              <span className="live-mini">
                <i /> LIVE
              </span>
            </div>
            <div className="feed-status-row">
              <span>ANSA RSS News Bridge</span>
              <span className="live-mini">
                <i /> LIVE
              </span>
            </div>
          </div>
        </section>

        <footer className="drawer-footer">
          <span>MARCI BUBBLE V1</span>
          <span>Designed to be quiet when nothing happens.</span>
        </footer>
      </aside>
    </div>
  )
}
