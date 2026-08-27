import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import helmet from 'helmet'
import healthRoutes from './routes/health.routes.js'
import notesRoutes from './routes/notes.routes.js'
import tipsRoutes from './routes/tips.routes.js'
import projectsRoutes from './routes/projects.routes.js'
import metaRoutes from './routes/meta.routes.js'
import authRoutes from './routes/auth.routes.js'
import accountRoutes from './routes/account.routes.js'
import uploadRoutes from './routes/upload.routes.js'
import searchRoutes from './routes/search.routes.js'
import statsRoutes from './routes/stats.routes.js'
import relatedRoutes from './routes/related.routes.js'
import askRoutes from './routes/ask.routes.js'
import { apiLimiter } from './middleware/rateLimiters.js'
import { notFound, errorHandler } from './middleware/errorHandler.js'

// Split out from index.js (which now only handles connectDB + app.listen)
// so tests can `import app from './app.js'` and hit it with supertest
// directly — no real network listener, no real MongoDB connection required
// for the routes that don't touch the DB.
const app = express()
app.set('trust proxy', 1)

// Sets a standard set of security headers (X-Content-Type-Options,
// X-Frame-Options, a conservative default CSP, etc.). This is a pure JSON
// API — no HTML/inline scripts of its own — so helmet's defaults are safe
// to use as-is with no CSP tuning needed.
app.use(helmet())

// Supports a comma-separated list so production + a local dev origin can both
// work at once, e.g. CLIENT_ORIGIN=https://myapp.vercel.app,http://localhost:5173
const ALLOWED_ORIGINS = (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

// `credentials: true` is required so the admin session cookie survives
// cross-origin requests between the client and this API (different ports in
// dev, different domains in production).
app.use(
  cors({
    origin(origin, callback) {
      // Allow non-browser requests (curl, health checks, server-to-server)
      // which don't send an Origin header at all.
      if (!origin || ALLOWED_ORIGINS.includes(origin)) return callback(null, true)
      callback(new Error(`Origin ${origin} is not allowed by CORS`))
    },
    credentials: true,
  }),
)
app.use(express.json())
app.use(cookieParser())

// Health stays outside the rate limiter — the client's cold-start "waking
// up" banner polls this repeatedly while the backend spins up, and it's
// cheap enough that it doesn't need protecting the way content/write
// endpoints do.
app.use('/api/v1/health', healthRoutes)

// Baseline abuse/DoS protection for everything else. Route-specific
// limiters (askLimiter, authLimiter) stack on top of this for the couple
// of endpoints that need a tighter cap.
app.use('/api/v1', apiLimiter)

app.use('/api/v1/notes', notesRoutes)
app.use('/api/v1/tips', tipsRoutes)
app.use('/api/v1/projects', projectsRoutes)
app.use('/api/v1/meta', metaRoutes)
app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/account', accountRoutes)
app.use('/api/v1/upload', uploadRoutes)
app.use('/api/v1/search', searchRoutes)
app.use('/api/v1/stats', statsRoutes)
app.use('/api/v1/related', relatedRoutes)
app.use('/api/v1/ask', askRoutes)

app.use(notFound)
app.use(errorHandler)

export default app
