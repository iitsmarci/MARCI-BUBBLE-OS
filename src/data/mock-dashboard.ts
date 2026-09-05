import type { Asset, NewsItem } from '../types/dashboard'

// Deliberately local mock data: replace this module with API adapters in a later phase.
export const marketAssets: readonly Asset[] = [
  { symbol: 'BTC', name: 'Bitcoin', value: '€ 104,231', delta: '+2.31%', direction: 'up', points: [22, 32, 26, 38, 34, 49, 44, 57, 52, 68, 63, 76] },
  { symbol: 'SPX', name: 'S&P 500', value: '6,481.4', delta: '+0.42%', direction: 'up', points: [42, 39, 43, 41, 47, 45, 49, 47, 53, 56, 54, 61] },
  { symbol: 'EUR/USD', name: 'Euro / Dollar', value: '1.1700', delta: '−0.08%', direction: 'down', points: [67, 66, 69, 65, 64, 66, 62, 63, 59, 61, 57, 55] },
]

export const newsItems: readonly NewsItem[] = [
  { category: 'WORLD', headline: 'Questa sezione è pronta per fonti reali, senza titoli inventati.', source: 'Data layer', published: 'DEMO' },
  { category: 'TECHNOLOGY', headline: 'La dashboard separa l’interfaccia dai provider di dati.', source: 'Marci Bubble', published: 'DEMO' },
  { category: 'ITALY', headline: 'Aggiungi un feed autorizzato dalle impostazioni per iniziare.', source: 'Data layer', published: 'DEMO' },
]
