import { verifyToken } from '../utils/jwt.js'

export function requireAdmin(req, res, next) {
  const token = req.cookies?.token

  if (!token) {
    return res.status(401).json({ error: 'Not authenticated' })
  }

  try {
    req.admin = verifyToken(token)
    next()
  } catch {
    return res.status(401).json({ error: 'Invalid or expired session' })
  }
}
