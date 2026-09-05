import { Quote } from 'lucide-react'
import { Bubble } from './Bubble'

const QUOTES: readonly { text: string; author: string; context: string }[] = [
  {
    text: 'La semplicità è la sofisticazione finale.',
    author: 'Leonardo da Vinci',
    context: 'Sugli appunti e i taccuini del Codice Atlantico',
  },
  {
    text: 'Si diventa ciò a cui si dedica attenzione.',
    author: 'Epitteto',
    context: 'Manuale di vita, II secolo',
  },
  {
    text: 'Il futuro appartiene a coloro che credono alla bellezza dei propri sogni.',
    author: 'Eleanor Roosevelt',
    context: 'Discorso alle giovani democratiche, 1936',
  },
  {
    text: 'Non è mai troppo tardi per essere ciò che avresti voluto essere.',
    author: 'George Eliot',
    context: 'Riflessione attribuita, XIX secolo',
  },
  {
    text: 'Le idee migliori non arrivano in un lampo: arrivano in silenzio.',
    author: 'Italo Calvino',
    context: 'Dalle Lezioni americane, 1985',
  },
  {
    text: 'La quiete non è mai vuota: è piena di pensieri non ancora scritti.',
    author: 'Marci Bubble',
    context: 'Editoriale interno, 2026',
  },
]

function dayOfYear(date: Date = new Date()): number {
  const start = new Date(date.getFullYear(), 0, 0)
  const diff = date.getTime() - start.getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

export function DailyQuoteBubble() {
  const quote = QUOTES[dayOfYear() % QUOTES.length] ?? QUOTES[0]!

  return (
    <Bubble
      title="Daily Quote"
      className="daily-quote-bubble"
      meta={<span className="section-meta">EDITORIALE</span>}
    >
      <div className="quote-body">
        <Quote size={32} strokeWidth={1.2} className="quote-mark" aria-hidden="true" />
        <blockquote className="quote-text">{quote.text}</blockquote>
        <div className="quote-meta">
          <b>{quote.author}</b>
          <span>{quote.context}</span>
        </div>
      </div>
    </Bubble>
  )
}
