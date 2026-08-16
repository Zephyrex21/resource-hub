import { Router } from 'express'
import { createCrudController } from '../controllers/crudFactory.js'
import { requireAdmin } from '../middleware/requireAdmin.js'
import Note from '../models/Note.js'

const router = Router()
const ctrl = createCrudController(Note)

router.get('/', ctrl.list) // ?subject=&tag=&search=
router.get('/:slug', ctrl.getBySlug)
router.post('/', requireAdmin, ctrl.create)
router.put('/:id', requireAdmin, ctrl.update)
router.delete('/:id', requireAdmin, ctrl.remove)

export default router
