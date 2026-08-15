export function notFound(req, res, next) {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` })
}

export function errorHandler(err, req, res, next) {
  console.error('[error]', err)

  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message })
  }
  if (err.code === 11000) {
    return res.status(409).json({ error: 'A record with that slug already exists.' })
  }

  const status = err.status || 500
  res.status(status).json({ error: err.message || 'Internal server error' })
}
