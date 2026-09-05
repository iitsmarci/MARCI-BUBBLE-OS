import { useEffect, useState } from 'react'
import type { CityPreset } from '../lib/settings'
import { formatClockDate, formatDigitalClock } from '../lib/time'
import { Bubble } from './Bubble'

type ClockBubbleProps = {
  currentCity?: CityPreset
}

export function ClockBubble({ currentCity }: ClockBubbleProps) {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(interval)
  }, [])

  const timeZone = currentCity?.timeZone ?? 'Europe/Rome'

  return (
    <Bubble
      title="Local time"
      className="clock-bubble"
      meta={<span className="timezone">{timeZone.replace('_', ' ')}</span>}
    >
      <time className="clock-value">{formatDigitalClock(now, timeZone)}</time>
      <p className="clock-date">{formatClockDate(now, timeZone)}</p>
      <div className="clock-rule" />
      <small>{currentCity ? `${currentCity.name} · Real time` : 'Real local time'}</small>
    </Bubble>
  )
}
