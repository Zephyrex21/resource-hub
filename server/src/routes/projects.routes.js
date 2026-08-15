import { Router } from 'express'
import { createCrudController } from '../controllers/crudFactory.js'
import Project from '../models/Project.js'

const router = Router()
const ctrl = createCrudController(Project)

router.get('/', ctrl.list) // ?status=&featured=&search=
router.get('/:slug', ctrl.getBySlug)
router.post('/', ctrl.create)
router.put('/:id', ctrl.update)
router.delete('/:id', ctrl.remove)

export default router
