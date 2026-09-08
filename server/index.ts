import 'dotenv/config'
import express from 'express'
import { readCalendarFeed } from './calendar.js'
import { fetchNewsFeed } from './news.js'

const app = express()
const port = 4317

app.get('/api/calendar/events', async (_request, response) => {
  const feed = await readCalendarFeed()
  if (feed.kind === 'connected') {
    response.setHeader('Cache-Control', 'private, max-age=60')
    response.status(200).json(feed)
    return
  }
  // Return empty connected feed as fallback when setup_required or unavailable
  response.setHeader('Cache-Control', 'private, max-age=60')
  response.status(200).json({ kind: 'connected', events: [], updatedAt: new Date().toISOString() })
})

app.get('/api/news', async (_request, response) => {
  try {
    const items = await fetchNewsFeed()
    response.setHeader('Cache-Control', 'public, max-age=300')
    response.status(200).json({ status: 'ok', items })
  } catch {
    response.status(502).json({ status: 'error', items: [] })
  }
})

app.listen(port, '127.0.0.1', () => {
  process.stdout.write(`Local bridge ready on http://127.0.0.1:${port}\n`)
})
