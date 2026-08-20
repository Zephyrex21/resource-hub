import { Router } from 'express'
import { createCrudController } from '../controllers/crudFactory.js'
import { createCounterIncrementer } from '../controllers/counterFactory.js'
import { requireAdmin } from '../middleware/requireAdmin.js'
import Tip from '../models/Tip.js'

const router = Router()
const ctrl = createCrudController(Tip)

router.get('/', ctrl.list) // ?category=&tag=&search=
router.get('/:slug', ctrl.getBySlug)

router.post('/:slug/view', createCounterIncrementer(Tip, 'viewCount'))

router.post('/', requireAdmin, ctrl.create)
router.put('/:id', requireAdmin, ctrl.update)
router.delete('/:id', requireAdmin, ctrl.remove)

export default router
