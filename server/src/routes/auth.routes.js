import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { signToken } from '../utils/jwt.js'
import { requireAdmin } from '../middleware/requireAdmin.js'
import { authLimiter } from '../middleware/rateLimiters.js'
import { validate } from '../middleware/validate.js'
import { loginSchema } from '../schemas/authSchema.js'
import { buildCookieOptions } from '../utils/cookieOptions.js'

const router = Router()
const ADMIN_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000 // 7 days

router.post('/login', authLimiter, validate(loginSchema), async (req, res, next) => {
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

    const token = signToken({ type: 'admin', email })
    res.cookie('token', token, buildCookieOptions(ADMIN_COOKIE_MAX_AGE))
    res.json({ email })
  } catch (err) {
    next(err)
  }
})

router.post('/logout', (req, res) => {
  const { maxAge, ...clearOpts } = buildCookieOptions(ADMIN_COOKIE_MAX_AGE)
  res.clearCookie('token', clearOpts)
  res.status(204).end()
})

router.get('/me', requireAdmin, (req, res) => {
  res.json({ email: req.admin.email })
})

export default router
