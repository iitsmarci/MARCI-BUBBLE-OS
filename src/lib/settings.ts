export type CityPreset = {
  city: string
  name: string
  lat: number
  lon: number
  timeZone: string
}

export const CITY_PRESETS: CityPreset[] = [
  { city: 'CATANIA', name: 'Catania, Italy', lat: 37.5025, lon: 15.0873, timeZone: 'Europe/Rome' },
  { city: 'ROMA', name: 'Rome, Italy', lat: 41.9028, lon: 12.4964, timeZone: 'Europe/Rome' },
  { city: 'MILANO', name: 'Milan, Italy', lat: 45.4642, lon: 9.19, timeZone: 'Europe/Rome' },
  { city: 'LISBONA', name: 'Lisbon, Portugal', lat: 38.7223, lon: -9.1393, timeZone: 'Europe/Lisbon' },
  { city: 'LONDON', name: 'London, UK', lat: 51.5074, lon: -0.1278, timeZone: 'Europe/London' },
  { city: 'TOKYO', name: 'Tokyo, Japan', lat: 35.6762, lon: 139.6503, timeZone: 'Asia/Tokyo' },
  { city: 'NEW YORK', name: 'New York, USA', lat: 40.7128, lon: -74.006, timeZone: 'America/New_York' },
]

export function loadSavedCity(): CityPreset {
  if (typeof window === 'undefined') return CITY_PRESETS[0]
  try {
    const saved = localStorage.getItem('marci_bubble_selected_city')
    if (saved) {
      const found = CITY_PRESETS.find((p) => p.city === saved)
      if (found) return found
    }
  } catch {
    // Ignore storage errors
  }
  return CITY_PRESETS[0]
}

export function saveCity(cityKey: string): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem('marci_bubble_selected_city', cityKey)
  } catch {
    // Ignore storage errors
  }
}

const NOTES_STORAGE_KEY = 'marci_bubble_quick_notes'
const NOTES_SAVED_KEY = 'marci_bubble_quick_notes_saved'

export function loadSavedNotes(): { content: string; savedAt: string | null } {
  if (typeof window === 'undefined') return { content: '', savedAt: null }
  try {
    const content = localStorage.getItem(NOTES_STORAGE_KEY) ?? ''
    const savedAt = localStorage.getItem(NOTES_SAVED_KEY)
    return { content, savedAt: savedAt ?? null }
  } catch {
    return { content: '', savedAt: null }
  }
}

export function saveNotes(content: string): string {
  if (typeof window === 'undefined') return new Date().toISOString()
  const now = new Date().toISOString()
  try {
    localStorage.setItem(NOTES_STORAGE_KEY, content)
    localStorage.setItem(NOTES_SAVED_KEY, now)
  } catch {
    // ignore
  }
  return now
}

export function clearNotes(): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(NOTES_STORAGE_KEY)
    localStorage.removeItem(NOTES_SAVED_KEY)
  } catch {
    // ignore
  }
}
