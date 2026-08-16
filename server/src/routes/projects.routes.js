import { Router } from 'express'
import { createCrudController } from '../controllers/crudFactory.js'
import { requireAdmin } from '../middleware/requireAdmin.js'
import Project from '../models/Project.js'

const router = Router()
const ctrl = createCrudController(Project)

router.get('/', ctrl.list) // ?status=&featured=&search=
router.get('/:slug', ctrl.getBySlug)
router.post('/', requireAdmin, ctrl.create)
router.put('/:id', requireAdmin, ctrl.update)
router.delete('/:id', requireAdmin, ctrl.remove)

export default router
