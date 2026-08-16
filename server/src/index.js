import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { connectDB } from './config/db.js'
import healthRoutes from './routes/health.routes.js'
import notesRoutes from './routes/notes.routes.js'
import tipsRoutes from './routes/tips.routes.js'
import projectsRoutes from './routes/projects.routes.js'
import metaRoutes from './routes/meta.routes.js'
import authRoutes from './routes/auth.routes.js'
import uploadRoutes from './routes/upload.routes.js'
import searchRoutes from './routes/search.routes.js'
import { notFound, errorHandler } from './middleware/errorHandler.js'

const app = express()
const PORT = process.env.PORT || 5000

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

app.use('/api/v1/health', healthRoutes)
app.use('/api/v1/notes', notesRoutes)
app.use('/api/v1/tips', tipsRoutes)
app.use('/api/v1/projects', projectsRoutes)
app.use('/api/v1/meta', metaRoutes)
app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/upload', uploadRoutes)
app.use('/api/v1/search', searchRoutes)

app.use(notFound)
app.use(errorHandler)

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`[server] Running on http://localhost:${PORT}`)
  })
})
