import type { PropsWithChildren, ReactNode } from 'react'

type BubbleProps = PropsWithChildren<{
  title: string
  className?: string
  meta?: ReactNode
  action?: ReactNode
}>

export function Bubble({ title, meta, action, className = '', children }: BubbleProps) {
  return (
    <section className={`bubble ${className}`} aria-label={title}>
      <header className="bubble-header">
        <div className="bubble-title-row"><h2>{title}</h2>{meta}</div>
        {action}
      </header>
      {children}
    </section>
  )
}
