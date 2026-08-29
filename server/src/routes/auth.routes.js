import { Router } from 'express'
import { signToken } from '../utils/jwt.js'
import { requireAdmin } from '../middleware/requireAdmin.js'
import { authLimiter } from '../middleware/rateLimiters.js'
import { validate } from '../middleware/validate.js'
import { loginSchema } from '../schemas/authSchema.js'
import { buildCookieOptions } from '../utils/cookieOptions.js'
import { timingSafeStringEqual } from '../utils/timingSafeEqual.js'

const router = Router()
const ADMIN_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000 // 7 days

router.post('/login', authLimiter, validate(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body ?? {}
    const adminEmail = process.env.ADMIN_EMAIL
    const adminPassword = process.env.ADMIN_PASSWORD

    if (!adminEmail || !adminPassword) {
      return res
        .status(500)
        .json({ error: 'Admin credentials are not configured — see server/.env.example.' })
    }

    // Plaintext comparison by design — this project deliberately dropped
    // bcrypt hashing for the single-admin credential (see ADMIN_PASSWORD
    // in .env.example for the full rationale: it's one person's own
    // env file, already holding equally sensitive values like
    // MONGODB_URI/JWT_SECRET, and bcrypt hashes contain '$' characters
    // that get silently mangled if that value is ever set via a shell
    // `export`/`source` instead of the dotenv loader — a real, reproduced
    // failure mode, not a hypothetical one. timingSafeStringEqual avoids
    // trading that problem for a timing side-channel from a naive `===`.
    const emailMatches = email === adminEmail
    const passwordMatches = timingSafeStringEqual(password ?? '', adminPassword)

    if (!emailMatches || !passwordMatches) {
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
