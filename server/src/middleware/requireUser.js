import { verifyToken } from '../utils/jwt.js'

// Deliberately separate from requireAdmin.js rather than a shared/parameterized
// middleware: these guard two conceptually different things (one privileged
// content-editor session vs. many ordinary visitor accounts), and keeping
// them as distinct functions means a future change to one can't silently
// change the other's behavior. Different cookie name ('user_token' vs
// 'token') plus the explicit type check below means a token issued for one
// can never be replayed against the other, even though both currently
// share one JWT_SECRET.
export function requireUser(req, res, next) {
  const token = req.cookies?.user_token

  if (!token) {
    return res.status(401).json({ error: 'Not signed in' })
  }

  try {
    const payload = verifyToken(token)
    if (payload.type !== 'user') {
      return res.status(401).json({ error: 'Invalid or expired session' })
    }
    req.userId = payload.sub
    next()
  } catch {
    return res.status(401).json({ error: 'Invalid or expired session' })
  }
}
