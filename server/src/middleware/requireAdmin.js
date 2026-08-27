import { verifyToken } from '../utils/jwt.js'

// Checks payload.type === 'admin' on top of a valid signature — defense in
// depth now that a second token type ('user', for regular accounts) shares
// the same JWT_SECRET. Cookie names already keep the two separate (admin
// uses 'token', accounts use 'user_token'), but an attacker who somehow
// got a user token into the 'token' cookie slot (e.g. via an XSS write to
// document.cookie) shouldn't be able to pass as admin just because the
// signature checks out.
export function requireAdmin(req, res, next) {
  const token = req.cookies?.token

  if (!token) {
    return res.status(401).json({ error: 'Not authenticated' })
  }

  try {
    const payload = verifyToken(token)
    if (payload.type !== 'admin') {
      return res.status(401).json({ error: 'Invalid or expired session' })
    }
    req.admin = payload
    next()
  } catch {
    return res.status(401).json({ error: 'Invalid or expired session' })
  }
}
