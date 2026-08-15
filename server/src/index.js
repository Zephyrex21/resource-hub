import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { connectDB } from './config/db.js'
import healthRoutes from './routes/health.routes.js'
import notesRoutes from './routes/notes.routes.js'
import tipsRoutes from './routes/tips.routes.js'
import projectsRoutes from './routes/projects.routes.js'
import metaRoutes from './routes/meta.routes.js'
import { notFound, errorHandler } from './middleware/errorHandler.js'

const app = express()
const PORT = process.env.PORT || 5000
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173'

app.use(cors({ origin: CLIENT_ORIGIN }))
app.use(express.json())

app.use('/api/v1/health', healthRoutes)
app.use('/api/v1/notes', notesRoutes)
app.use('/api/v1/tips', tipsRoutes)
app.use('/api/v1/projects', projectsRoutes)
app.use('/api/v1/meta', metaRoutes)

app.use(notFound)
app.use(errorHandler)

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`[server] Running on http://localhost:${PORT}`)
  })
})
