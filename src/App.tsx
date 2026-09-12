import { useEffect, useState } from 'react'
import { ClockBubble } from './components/ClockBubble'
import { FinanceBubble } from './components/FinanceBubble'
import { FocusTimerBubble } from './components/FocusTimerBubble'
import { Header } from './components/Header'
import { DailyQuoteBubble } from './components/DailyQuoteBubble'
import { EnergyPricesBubble } from './components/EnergyPricesBubble'
import { NewsBubble } from './components/NewsBubble'
import { NowPlayingBubble } from './components/NowPlayingBubble'
import { PersonalBubble } from './components/PersonalBubble'
import { QuickNotesBubble } from './components/QuickNotesBubble'
import { SettingsDrawer } from './components/SettingsDrawer'
import { TabBar, type TabId } from './components/TabBar'
import { WasteBubble } from './components/WasteBubble'
import { WeatherBubble } from './components/WeatherBubble'
import { WazeCommuteBubble } from './components/WazeCommuteBubble'
import { loadSavedCity, saveCity, type CityPreset } from './lib/settings'
import { formatHeroDate, getGreeting } from './lib/time'
import type { ThemeMode } from './types/dashboard'

export default function App() {
  const [theme, setTheme] = useState<ThemeMode>('dark')
  const [now, setNow] = useState(() => new Date())
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [currentCity, setCurrentCity] = useState<CityPreset>(loadSavedCity)
  const [activeTab, setActiveTab] = useState<TabId>('overview')

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const saved = localStorage.getItem('marci_bubble_active_tab')
      if (saved === 'overview' || saved === 'focus' || saved === 'mobility' || saved === 'finance' || saved === 'editorial') {
        setActiveTab(saved)
      }
    } catch {
      // ignore
    }
  }, [])

  const handleSelectCity = (preset: CityPreset) => {
    setCurrentCity(preset)
    saveCity(preset.city)
  }

  const handleTabChange = (tab: TabId) => {
    setActiveTab(tab)
  }

  return (
    <main id="dashboard">
      <Header
        theme={theme}
        onToggleTheme={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isLive
      />
      <TabBar activeTab={activeTab} onTabChange={handleTabChange} />

      <div className="intro">
        <p>PERSONAL INFORMATION INSTRUMENT</p>
        <h1>
          {getGreeting(now, currentCity.timeZone)},<br />
          <em>Marci.</em>
        </h1>
        <span>{formatHeroDate(now, currentCity.name, currentCity.timeZone)}</span>
      </div>

      {activeTab === 'overview' && (
        <div key={activeTab} className="dashboard-grid dashboard-grid--overview tab-panel">
          <WeatherBubble cityPreset={currentCity} />
          <ClockBubble currentCity={currentCity} />
          <PersonalBubble />
          <WasteBubble title="Raccolta Differenziata" />
          <NowPlayingBubble />
        </div>
      )}

      {activeTab === 'focus' && (
        <div key={activeTab} className="dashboard-grid dashboard-grid--focus tab-panel">
          <FocusTimerBubble />
          <QuickNotesBubble />
        </div>
      )}

      {activeTab === 'mobility' && (
        <div key={activeTab} className="dashboard-grid dashboard-grid--mobility tab-panel">
          <WazeCommuteBubble />
          <QuickNotesBubble />
        </div>
      )}

      {activeTab === 'finance' && (
        <div key={activeTab} className="dashboard-grid dashboard-grid--finance tab-panel">
          <FinanceBubble onOpenMenu={() => setIsSettingsOpen(true)} />
          <EnergyPricesBubble />
        </div>
      )}

      {activeTab === 'editorial' && (
        <div key={activeTab} className="dashboard-grid dashboard-grid--editorial tab-panel">
          <DailyQuoteBubble />
          <NewsBubble />
        </div>
      )}

      <footer className="app-footer">
        <span>MARCI <i /> BUBBLE</span>
        <span>Designed to be quiet when nothing happens.</span>
        <span>V1 · LIVE FEEDS</span>
      </footer>

      <SettingsDrawer
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentCity={currentCity}
        onSelectCity={handleSelectCity}
      />
    </main>
  )
}
