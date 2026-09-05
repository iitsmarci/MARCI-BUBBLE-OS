import { useCallback, useEffect, useState } from 'react'
import { Zap, Globe, TrendingUp, BookOpen, LayoutDashboard } from 'lucide-react'

export type TabId = 'overview' | 'focus' | 'mobility' | 'finance' | 'editorial'

const TABS: readonly { id: TabId; label: string; Icon: React.ElementType }[] = [
  { id: 'overview', label: 'Overview', Icon: LayoutDashboard },
  { id: 'editorial', label: 'Editorial', Icon: BookOpen },
  { id: 'finance', label: 'Finance', Icon: TrendingUp },
  { id: 'mobility', label: 'Mobility', Icon: Globe },
  { id: 'focus', label: 'Focus & Notes', Icon: Zap },
]

const STORAGE_KEY = 'marci_bubble_active_tab'

function loadTab(): TabId {
  if (typeof window === 'undefined') return 'overview'
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved && TABS.some((t) => t.id === saved)) return saved as TabId
  } catch {
    // ignore
  }
  return 'overview'
}

function saveTab(id: TabId): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, id)
  } catch {
    // ignore
  }
}

type TabBarProps = {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
}

export function TabBar({ activeTab, onTabChange }: TabBarProps) {
  const handleClick = useCallback(
    (id: TabId) => {
      onTabChange(id)
      saveTab(id)
    },
    [onTabChange],
  )

  return (
    <nav className="tab-bar" aria-label="Navigazione viste dashboard">
      {TABS.map(({ id, label, Icon }) => (
        <button
          key={id}
          type="button"
          className={`tab-item ${activeTab === id ? 'tab-item--active' : ''}`}
          onClick={() => handleClick(id)}
          aria-pressed={activeTab === id}
          aria-label={`Vista: ${label}`}
        >
          <Icon size={16} strokeWidth={1.6} aria-hidden="true" />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  )
}
