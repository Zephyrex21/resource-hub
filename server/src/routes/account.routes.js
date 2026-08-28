import { Router } from 'express'
import User from '../models/User.js'
import Progress from '../models/Progress.js'
import SavedItem from '../models/SavedItem.js'
import ActivityLog from '../models/ActivityLog.js'
import { createAccountController } from '../controllers/accountController.js'
import { requireUser } from '../middleware/requireUser.js'
import { validate } from '../middleware/validate.js'
import { accountAuthLimiter } from '../middleware/rateLimiters.js'
import {
  registerSchema,
  userLoginSchema,
  progressToggleSchema,
  savedToggleSchema,
} from '../schemas/accountSchema.js'

const router = Router()
const ctrl = createAccountController({ User, Progress, SavedItem, ActivityLog })

// A dedicated limiter instance, independent from the admin authLimiter —
// see the comment on accountAuthLimiter in rateLimiters.js for why sharing
// one was a real bug, not just a theoretical concern.
router.post('/register', accountAuthLimiter, validate(registerSchema), ctrl.register)
router.post('/login', accountAuthLimiter, validate(userLoginSchema), ctrl.login)
router.post('/logout', ctrl.logout)
router.get('/me', requireUser, ctrl.me)

router.get('/progress', requireUser, ctrl.listProgress)
router.post('/progress', requireUser, validate(progressToggleSchema), ctrl.toggleProgress)

router.get('/saved', requireUser, ctrl.listSaved)
router.post('/saved', requireUser, validate(savedToggleSchema), ctrl.toggleSaved)

router.get('/streak', requireUser, ctrl.getStreak)

export default router
