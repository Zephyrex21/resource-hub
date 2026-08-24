import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { signToken } from '../utils/jwt.js'
import { requireAdmin } from '../middleware/requireAdmin.js'
import { authLimiter } from '../middleware/rateLimiters.js'

const router = Router()

const isProduction = process.env.NODE_ENV === 'production'

const COOKIE_OPTS = {
  httpOnly: true,
  // In dev, client and server share a site (different localhost ports) so
  // 'lax' works fine. In production they're on different domains entirely
  // (e.g. vercel.app + onrender.com), which requires 'none' — and browsers
  // only accept sameSite:'none' when secure:true (HTTPS), which both
  // Vercel and Render provide by default.
  sameSite: isProduction ? 'none' : 'lax',
  secure: isProduction,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
}

router.post('/login', authLimiter, async (req, res, next) => {
  try {
    const { email, password } = req.body ?? {}
    const adminEmail = process.env.ADMIN_EMAIL
    const adminHash = process.env.ADMIN_PASSWORD_HASH

    if (!adminEmail || !adminHash) {
      return res
        .status(500)
        .json({ error: 'Admin credentials are not configured — see server/.env.example.' })
    }

    if (email !== adminEmail) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    const matches = await bcrypt.compare(password ?? '', adminHash)
    if (!matches) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    const token = signToken({ email })
    res.cookie('token', token, COOKIE_OPTS)
    res.json({ email })
  } catch (err) {
    next(err)
  }
})

router.post('/logout', (req, res) => {
  const { maxAge, ...clearOpts } = COOKIE_OPTS
  res.clearCookie('token', clearOpts)
  res.status(204).end()
})

router.get('/me', requireAdmin, (req, res) => {
  res.json({ email: req.admin.email })
})

export default router
