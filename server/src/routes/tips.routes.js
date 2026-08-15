import { Router } from 'express'
import { createCrudController } from '../controllers/crudFactory.js'
import Tip from '../models/Tip.js'

const router = Router()
const ctrl = createCrudController(Tip)

router.get('/', ctrl.list) // ?category=&tag=&search=
router.get('/:slug', ctrl.getBySlug)
router.post('/', ctrl.create)
router.put('/:id', ctrl.update)
router.delete('/:id', ctrl.remove)

export default router
