import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { signToken } from '../utils/jwt.js'
import { requireAdmin } from '../middleware/requireAdmin.js'

const router = Router()

const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
}

router.post('/login', async (req, res, next) => {
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
