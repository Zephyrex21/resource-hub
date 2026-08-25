import { Router } from 'express'
import { createCrudController } from '../controllers/crudFactory.js'
import { createCounterIncrementer } from '../controllers/counterFactory.js'
import { requireAdmin } from '../middleware/requireAdmin.js'
import { validate } from '../middleware/validate.js'
import { projectCreateSchema, projectUpdateSchema } from '../schemas/projectSchema.js'
import Project from '../models/Project.js'

const router = Router()
const ctrl = createCrudController(Project)

router.get('/', ctrl.list) // ?status=&featured=&search=
router.get('/:slug', ctrl.getBySlug)

router.post('/:slug/view', createCounterIncrementer(Project, 'viewCount'))

router.post('/', requireAdmin, validate(projectCreateSchema), ctrl.create)
router.put('/:id', requireAdmin, validate(projectUpdateSchema), ctrl.update)
router.delete('/:id', requireAdmin, ctrl.remove)

export default router
