import { useCallback, useEffect, useRef, useState } from 'react'

export type FeedStatus = 'idle' | 'loading' | 'success' | 'error' | 'unavailable'

export type DataFeedResult<T> = {
  data: T | null
  status: FeedStatus
  error: Error | null
  updatedAt: Date | null
  refresh: () => Promise<void>
}

export type UseDataFeedOptions<T> = {
  fetcher: (signal: AbortSignal) => Promise<T>
  refreshIntervalMs?: number
  initialData?: T
  enabled?: boolean
  cacheKey?: string
}

export function useDataFeed<T>({
  fetcher,
  refreshIntervalMs,
  initialData = null as unknown as T,
  enabled = true,
  cacheKey,
}: UseDataFeedOptions<T>): DataFeedResult<T> {
  const [data, setData] = useState<T | null>(() => {
    if (initialData) return initialData
    if (cacheKey && typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem(`marci_bubble_cache_${cacheKey}`)
        if (cached) {
          const parsed = JSON.parse(cached)
          return parsed.data ?? null
        }
      } catch {
        // Ignore cache errors
      }
    }
    return null
  })

  const [status, setStatus] = useState<FeedStatus>(initialData ? 'success' : 'loading')
  const [error, setError] = useState<Error | null>(null)
  const [updatedAt, setUpdatedAt] = useState<Date | null>(() => (initialData ? new Date() : null))

  const abortControllerRef = useRef<AbortController | null>(null)
  const fetcherRef = useRef(fetcher)
  fetcherRef.current = fetcher

  const executeFetch = useCallback(async () => {
    if (!enabled) return

    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    const controller = new AbortController()
    abortControllerRef.current = controller

    setStatus((prev) => (prev === 'success' ? 'success' : 'loading'))

    try {
      const result = await fetcherRef.current(controller.signal)
      if (!controller.signal.aborted) {
        setData(result)
        setStatus('success')
        setError(null)
        const now = new Date()
        setUpdatedAt(now)

        if (cacheKey && typeof window !== 'undefined') {
          try {
            localStorage.setItem(
              `marci_bubble_cache_${cacheKey}`,
              JSON.stringify({ data: result, updatedAt: now.toISOString() })
            )
          } catch {
            // Storage quota exceeded or disabled
          }
        }
      }
    } catch (err: unknown) {
      if (!controller.signal.aborted) {
        const fetchError = err instanceof Error ? err : new Error(String(err))
        setError(fetchError)
        setStatus((prevData) => (prevData !== null ? 'success' : 'unavailable'))
      }
    }
  }, [enabled, cacheKey])

  useEffect(() => {
    executeFetch()

    if (!refreshIntervalMs || refreshIntervalMs <= 0) return

    const timer = window.setInterval(executeFetch, refreshIntervalMs)
    return () => {
      window.clearInterval(timer)
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [executeFetch, refreshIntervalMs])

  return {
    data,
    status,
    error,
    updatedAt,
    refresh: executeFetch,
  }
}
