import { Router } from 'express'
import { askQuestion } from '../controllers/askController.js'

const router = Router()

router.post('/', askQuestion)

export default router
