export function notFound(req, res, next) {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` })
}

export function errorHandler(err, req, res, next) {
  console.error('[error]', err)
  const status = err.status || 500
  res.status(status).json({ error: err.message || 'Internal server error' })
}
