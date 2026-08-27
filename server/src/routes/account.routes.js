import { Router } from 'express'
import User from '../models/User.js'
import Progress from '../models/Progress.js'
import SavedItem from '../models/SavedItem.js'
import { createAccountController } from '../controllers/accountController.js'
import { requireUser } from '../middleware/requireUser.js'
import { validate } from '../middleware/validate.js'
import { authLimiter } from '../middleware/rateLimiters.js'
import {
  registerSchema,
  userLoginSchema,
  progressToggleSchema,
  savedToggleSchema,
} from '../schemas/accountSchema.js'

const router = Router()
const ctrl = createAccountController({ User, Progress, SavedItem })

// authLimiter is shared with admin login — separate test files each get
// their own fresh module instance under Vitest's per-file isolation, so
// this doesn't eat into the admin login tests' budget (see auth.test.js).
router.post('/register', authLimiter, validate(registerSchema), ctrl.register)
router.post('/login', authLimiter, validate(userLoginSchema), ctrl.login)
router.post('/logout', ctrl.logout)
router.get('/me', requireUser, ctrl.me)

router.get('/progress', requireUser, ctrl.listProgress)
router.post('/progress', requireUser, validate(progressToggleSchema), ctrl.toggleProgress)

router.get('/saved', requireUser, ctrl.listSaved)
router.post('/saved', requireUser, validate(savedToggleSchema), ctrl.toggleSaved)

export default router
