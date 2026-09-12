import { type BubbleProps, Bubble } from './Bubble'
import { formatHeroDate } from '../lib/time'

const WASTE_SCHEDULE = [
  // Day -> (task, color)
  {
    day: 0, // Monday
    task: 'Umido (Organico)',
    color: '#8D6E63'
  },
  {
    day: 1, // Tuesday
    task: 'Carta & Cartone',
    color: '#42A5F5'
  },
  {
    day: 2, // Wednesday
    task: 'Vetro + Umido (Organico)',
    color: '#66BB6A'
  },
  {
    day: 3, // Thursday
    task: 'Indifferenziato',
    color: '#546E7A'
  },
  {
    day: 4, // Friday
    task: 'Umido (Organico)',
    color: '#8D6E63'
  },
  {
    day: 5, // Saturday
    task: 'Nessun conferimento',
    color: '#FFEE58'
  },
  {
    day: 6, // Sunday
    task: 'Plastica & Metalli',
    color: '#FFEE58'
  }
]

// Map days to indices (0-6)
const DAY_INDEX = (day: number) => day % 7

const COLORS = {
  umidoOrganico: '#8D6E63',
  cartaCartone: '#42A5F5',
  vetro: '#66BB6A',
  indifferenziato: '#546E7A',
  plasticaMetalli: '#FFEE58'
}

function getTaskForDay(day: number): string {
  const item = WASTE_SCHEDULE.find(i => i.day === day)
  return item ? item.task : 'Nessuna raccolta'
}

function getBadgeColor(day: number): string {
  switch (DAY_INDEX(day)) {
    case 0: return COLORS.umidoOrganico      // Monday
    case 1: return COLORS.cartaCartone      // Tuesday
    case 2: return COLORS.vetro            // Wednesday
    case 3: return COLORS.indifferenziato  // Thursday
    case 4: return COLORS.umidoOrganico    // Friday
    case 5: return COLORS.plasticaMetalli  // Saturday
    case 6: return COLORS.plasticaMetalli  // Sunday
    default: return COLORS.umidoOrganico
  }
}

export function WasteBubble({ title, meta, action, className = '', children }: BubbleProps) {
  const today = new Date()
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000)
  
  // Get today's task
  const todayTask = getTaskForDay(today.getDay()) // 0=Monday, 6=Sunday
  const todayColor = getBadgeColor(today.getDay())
  
  // Get tomorrow's task (what to put out tonight)
  const tomorrowTask = getTaskForDay(tomorrow.getDay())
  const tomorrowColor = getBadgeColor(tomorrow.getDay())
  
  return (
    <Bubble
      title={title}
      className={`waste-bubble ${className}`}
      meta={meta}
      action={action}
    >
      <div className="waste-bubble__card">
        <div className="waste-bubble__info">
          <span className="waste-bubble__task">{todayTask}</span>
          <span className="waste-bubble__color">{todayColor}</span>
        </div>
        <div className="waste-bubble__details">
          <span className="waste-bubble__detail">{todayTask}</span>
          {tomorrowTask && (
            <div className="waste-bubble__preview">
              <span className="waste-bubble__preview-label">Puoi mettere fuori:</span>
              <span className="waste-bubble__preview-color">{tomorrowColor}</span>
            </div>
          )}
        </div>
      </div>
    </Bubble>
  )
}