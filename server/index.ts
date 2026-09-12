import 'dotenv/config'
import express from 'express'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
import { readCalendarFeed } from './calendar.js'
import { fetchNewsFeed } from './news.js'
import { fetchLastfmNowPlaying } from './nowPlaying.js'

const app = express()
const port = 4317

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      fontSrc: ["'self'"],
      connectSrc: ["'self'", "https://ws.audioscrobbler.com", "https://api.allorigins.win", "https://api.open-meteo.com", "https://api.binance.com", "https://api.coingecko.com", "https://api.frankfurter.dev"],
      frameSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"]
    }
  },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  xssFilter: true,
  noSniff: true,
  hidePoweredBy: true,
  frameguard: { action: 'deny' },
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  }
}))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
})

app.use(limiter)

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

app.get('/api/nowplaying', async (_request, response) => {
  try {
    const feed = await fetchLastfmNowPlaying()
    response.setHeader('Cache-Control', 'public, max-age=300')
    response.status(200).json(feed)
  } catch {
    response.status(502).json({ status: 'error', items: [] })
  }
})

app.listen(port, '127.0.0.1', () => {
  process.stdout.write(`Local bridge ready on http://127.0.0.1:${port}\n`)
})
