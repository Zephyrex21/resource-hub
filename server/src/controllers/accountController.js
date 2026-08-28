import bcrypt from 'bcryptjs'
import { signToken } from '../utils/jwt.js'
import { buildCookieOptions } from '../utils/cookieOptions.js'
import { computeStreaks, todayUTC } from '../utils/streak.js'

// Longer than the admin session (7d) on purpose — this is a personal
// "remember me" cookie for a return visitor, not a privileged write
// session, so there's less reason to force re-auth often.
const USER_COOKIE_MAX_AGE = 30 * 24 * 60 * 60 * 1000 // 30 days

function toPublicUser(user) {
  return {
    id: String(user._id ?? user.id),
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl ?? '',
  }
}

// Models are injected (not imported directly) so this can be unit-tested
// with plain mock objects, the same way controllers/crudFactory.js is —
// no real MongoDB connection needed to test the actual business logic.
export function createAccountController({ User, Progress, SavedItem, ActivityLog }) {
  return {
    async register(req, res, next) {
      try {
        const { name, email, password } = req.body
        const existing = await User.findOne({ email })
        if (existing) {
          return res.status(409).json({ error: 'An account with that email already exists.' })
        }

        const passwordHash = await bcrypt.hash(password, 10)
        const user = await User.create({ name, email, passwordHash })

        const token = signToken({ type: 'user', sub: String(user._id) })
        res.cookie('user_token', token, buildCookieOptions(USER_COOKIE_MAX_AGE))
        res.status(201).json(toPublicUser(user))
      } catch (err) {
        next(err)
      }
    },

    async login(req, res, next) {
      try {
        const { email, password } = req.body
        const user = await User.findOne({ email })
        // Same generic message whether the email doesn't exist or the
        // password is wrong — don't leak which one it was.
        if (!user) return res.status(401).json({ error: 'Invalid email or password' })

        const matches = await bcrypt.compare(password, user.passwordHash)
        if (!matches) return res.status(401).json({ error: 'Invalid email or password' })

        const token = signToken({ type: 'user', sub: String(user._id) })
        res.cookie('user_token', token, buildCookieOptions(USER_COOKIE_MAX_AGE))
        res.json(toPublicUser(user))
      } catch (err) {
        next(err)
      }
    },

    logout(_req, res) {
      const { maxAge, ...clearOpts } = buildCookieOptions(USER_COOKIE_MAX_AGE)
      res.clearCookie('user_token', clearOpts)
      res.status(204).end()
    },

    async me(req, res, next) {
      try {
        const user = await User.findById(req.userId)
        if (!user) return res.status(401).json({ error: 'Not signed in' })
        res.json(toPublicUser(user))
      } catch (err) {
        next(err)
      }
    },

    async listProgress(req, res, next) {
      try {
        const items = await Progress.find({ userId: req.userId })
        res.json(items)
      } catch (err) {
        next(err)
      }
    },

    // Toggle, not separate mark/unmark endpoints — mirrors the frontend's
    // single toggleCompleted() call exactly, so the client doesn't need to
    // track "is this currently complete" before deciding which endpoint
    // to hit.
    async toggleProgress(req, res, next) {
      try {
        const { contentType, slug } = req.body
        const existing = await Progress.findOne({ userId: req.userId, contentType, slug })
        if (existing) {
          await Progress.deleteOne({ _id: existing._id })
          // Un-completing something isn't evidence of study, so it does
          // NOT remove today's activity log entry even if this was the
          // only completion today — once a day is logged, it stays
          // logged. Avoids "was this the only thing done today" reference
          // counting for a case that doesn't really matter in practice.
          return res.json({ completed: false })
        }
        await Progress.create({ userId: req.userId, contentType, slug })
        await ActivityLog.updateOne(
          { userId: req.userId, date: todayUTC() },
          { $setOnInsert: { userId: req.userId, date: todayUTC() } },
          { upsert: true },
        )
        res.status(201).json({ completed: true })
      } catch (err) {
        next(err)
      }
    },

    async getStreak(req, res, next) {
      try {
        const logs = await ActivityLog.find({ userId: req.userId }, 'date').lean()
        const dates = logs.map((l) => l.date)
        const { current, longest } = computeStreaks(dates)
        res.json({ current, longest, activeDates: dates })
      } catch (err) {
        next(err)
      }
    },

    async listSaved(req, res, next) {
      try {
        const items = await SavedItem.find({ userId: req.userId })
        res.json(items)
      } catch (err) {
        next(err)
      }
    },

    async toggleSaved(req, res, next) {
      try {
        const { contentType, slug, title, subtitle } = req.body
        const existing = await SavedItem.findOne({ userId: req.userId, contentType, slug })
        if (existing) {
          await SavedItem.deleteOne({ _id: existing._id })
          return res.json({ saved: false })
        }
        await SavedItem.create({ userId: req.userId, contentType, slug, title, subtitle })
        res.status(201).json({ saved: true })
      } catch (err) {
        next(err)
      }
    },
  }
}
