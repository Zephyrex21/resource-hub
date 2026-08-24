import { Router } from 'express'
import { askQuestion } from '../controllers/askController.js'
import { askLimiter } from '../middleware/rateLimiters.js'

const router = Router()

router.post('/', askLimiter, askQuestion)

export default router
