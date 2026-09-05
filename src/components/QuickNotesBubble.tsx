import { useCallback, useEffect, useRef, useState } from 'react'
import { Eraser } from 'lucide-react'
import { Bubble } from './Bubble'
import { clearNotes, loadSavedNotes, saveNotes } from '../lib/settings'

export function QuickNotesBubble() {
  const [content, setContent] = useState('')
  const [savedAt, setSavedAt] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastSavedRef = useRef('')

  useEffect(() => {
    const { content: loaded, savedAt: loadedAt } = loadSavedNotes()
    setContent(loaded)
    setSavedAt(loadedAt)
    lastSavedRef.current = loaded
  }, [])

  const scheduleAutoSave = useCallback((text: string) => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(() => {
      if (text !== lastSavedRef.current) {
        setIsSaving(true)
        const now = saveNotes(text)
        setSavedAt(now)
        lastSavedRef.current = text
        setTimeout(() => setIsSaving(false), 800)
      }
    }, 1200)
  }, [])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value
    setContent(text)
    scheduleAutoSave(text)
  }, [scheduleAutoSave])

  const handleClear = useCallback(() => {
    setContent('')
    clearNotes()
    setSavedAt(null)
    lastSavedRef.current = ''
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
  }, [])

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    }
  }, [])

  const charCount = content.length
  const wordCount = content.trim() === '' ? 0 : content.trim().split(/\s+/).length

  const formatSavedAt = (iso: string | null): string => {
    if (!iso) return ''
    const date = new Date(iso)
    return new Intl.DateTimeFormat('it-IT', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date)
  }

  return (
    <Bubble
      title="Quick Notes"
      className="quick-notes-bubble"
      meta={
        <span className="live-mini">
          {isSaving ? 'SAVING' : 'AUTO-SAVE'}
        </span>
      }
      action={
        <button
          type="button"
          className="quiet-button"
          onClick={handleClear}
          aria-label="Cancella note"
          title="Cancella tutto"
        >
          <Eraser size={16} strokeWidth={1.6} />
        </button>
      }
    >
      <div className="qn-body">
        <textarea
          className="qn-textarea"
          value={content}
          onChange={handleChange}
          placeholder="Scrivi i tuoi appunti qui. Vengono salvati automaticamente..."
          aria-label="Area appunti personali"
          spellCheck
        />
        <div className="qn-footer">
          <div className="qn-counts">
            <span>{wordCount} parole</span>
            <span className="qn-sep">·</span>
            <span>{charCount} caratteri</span>
          </div>
          {savedAt && (
            <span className="qn-saved">
              {isSaving ? 'Salvataggio...' : `Salvato alle ${formatSavedAt(savedAt)}`}
            </span>
          )}
        </div>
      </div>
    </Bubble>
  )
}
