import { Router } from 'express'
import { getRelated } from '../controllers/relatedController.js'

const router = Router()

router.get('/:type/:slug', getRelated)

export default router
