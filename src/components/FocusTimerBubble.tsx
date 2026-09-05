import { useCallback, useEffect, useRef, useState } from 'react'
import { Play, Pause, RotateCcw, SkipForward } from 'lucide-react'
import { Bubble } from './Bubble'

type PomodoroPhase = 'work' | 'short-break' | 'long-break'

interface PomodoroConfig {
  work: number
  shortBreak: number
  longBreak: number
}

const CONFIG: PomodoroConfig = { work: 25, shortBreak: 5, longBreak: 15 }
const STORAGE_KEY = 'marci_bubble_pomodoro_sessions'

const PHASE_LABELS: Record<PomodoroPhase, string> = {
  work: 'DEEP WORK',
  'short-break': 'SHORT BREAK',
  'long-break': 'LONG BREAK',
}

const PHASE_DURATIONS: Record<PomodoroPhase, number> = {
  work: CONFIG.work,
  'short-break': CONFIG.shortBreak,
  'long-break': CONFIG.longBreak,
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0')
  const s = (seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

function playChime() {
  try {
    const ctx = new AudioContext()
    const notes = [523.25, 659.25, 783.99, 1046.5]
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = 'sine'
      osc.frequency.value = freq
      const start = ctx.currentTime + i * 0.18
      gain.gain.setValueAtTime(0.18, start)
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.4)
      osc.start(start)
      osc.stop(start + 0.5)
    })
    setTimeout(() => ctx.close(), 2000)
  } catch {
    // Audio not available
  }
}

function usePomodoro() {
  const [phase, setPhase] = useState<PomodoroPhase>('work')
  const [timeLeft, setTimeLeft] = useState(CONFIG.work * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [sessions, setSessions] = useState(0)
  const [sessionsToday, setSessionsToday] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as { date: string; count: number }
        const today = new Date().toDateString()
        return parsed.date === today ? parsed.count : 0
      }
    } catch {
      // ignore
    }
    return 0
  })
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const phaseRef = useRef(phase)
  phaseRef.current = phase

  const clearTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const saveSessions = useCallback((count: number) => {
    const today = new Date().toDateString()
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: today, count }))
    } catch {
      // ignore
    }
  }, [])

  const advancePhase = useCallback(() => {
    const next = phaseRef.current === 'work'
      ? (sessionsToday + 1) % 4 === 0 ? 'long-break' : 'short-break'
      : 'work'
    const newSessions = phaseRef.current === 'work' ? sessionsToday + 1 : sessionsToday
    setPhase(next)
    setTimeLeft(PHASE_DURATIONS[next] * 60)
    setSessions(newSessions)
    setSessionsToday(newSessions)
    saveSessions(newSessions)
    playChime()
  }, [sessionsToday, saveSessions])

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearTimer()
            setIsRunning(false)
            setTimeout(advancePhase, 100)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      clearTimer()
    }
    return clearTimer
  }, [isRunning, clearTimer, advancePhase])

  const toggle = useCallback(() => setIsRunning((r) => !r), [])

  const reset = useCallback(() => {
    clearTimer()
    setIsRunning(false)
    setTimeLeft(PHASE_DURATIONS[phaseRef.current] * 60)
  }, [clearTimer])

  const skip = useCallback(() => {
    clearTimer()
    setIsRunning(false)
    advancePhase()
  }, [clearTimer, advancePhase])

  const progress = 1 - timeLeft / (PHASE_DURATIONS[phaseRef.current] * 60)
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference * (1 - progress)

  return { phase, timeLeft, isRunning, sessions, sessionsToday, toggle, reset, skip, dashOffset, circumference, radius }
}

export function FocusTimerBubble() {
  const { phase, timeLeft, isRunning, sessions, sessionsToday, toggle, reset, skip, dashOffset, circumference, radius } = usePomodoro()

  return (
    <Bubble
      title="Focus Timer"
      className="focus-timer-bubble"
      meta={<span className="live-mini">POMODORO</span>}
    >
      <div className="pomodoro-body">
        <div className="pomodoro-phase-label">{PHASE_LABELS[phase]}</div>

        <div className="pomodoro-ring-wrapper">
          <svg className="pomodoro-ring" viewBox="0 0 128 128" aria-label={`Timer: ${formatTime(timeLeft)}`}>
            <circle
              className="pomodoro-track"
              cx="64" cy="64" r={radius}
              fill="none"
              strokeWidth="6"
            />
            <circle
              className="pomodoro-progress"
              cx="64" cy="64" r={radius}
              fill="none"
              strokeWidth="6"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              transform="rotate(-90 64 64)"
            />
          </svg>
          <div className="pomodoro-time-display" aria-live="polite">
            {formatTime(timeLeft)}
          </div>
        </div>

        <div className="pomodoro-controls">
          <button type="button" className="pom-btn pom-btn--secondary" onClick={reset} aria-label="Reset timer">
            <RotateCcw size={18} strokeWidth={1.8} />
          </button>
          <button type="button" className="pom-btn pom-btn--primary" onClick={toggle} aria-label={isRunning ? 'Pause' : 'Start'}>
            {isRunning ? <Pause size={22} strokeWidth={1.8} /> : <Play size={22} strokeWidth={1.8} />}
          </button>
          <button type="button" className="pom-btn pom-btn--secondary" onClick={skip} aria-label="Skip to next phase">
            <SkipForward size={18} strokeWidth={1.8} />
          </button>
        </div>

        <div className="pomodoro-stats">
          <div className="pom-stat">
            <b>{sessionsToday}</b>
            <span>sessions today</span>
          </div>
          <div className="pom-stat">
            <b>{sessions}</b>
            <span>total sessions</span>
          </div>
        </div>
      </div>
    </Bubble>
  )
}
