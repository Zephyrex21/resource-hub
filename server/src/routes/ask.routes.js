import { Router } from 'express'
import { askQuestion } from '../controllers/askController.js'
import { askLimiter } from '../middleware/rateLimiters.js'
import { validate } from '../middleware/validate.js'
import { askSchema } from '../schemas/askSchema.js'

const router = Router()

router.post('/', askLimiter, validate(askSchema), askQuestion)

export default router
