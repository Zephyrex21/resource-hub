import { Router } from 'express'
import { createCrudController } from '../controllers/crudFactory.js'
import Note from '../models/Note.js'

const router = Router()
const ctrl = createCrudController(Note)

router.get('/', ctrl.list) // ?subject=&tag=&search=
router.get('/:slug', ctrl.getBySlug)
router.post('/', ctrl.create)
router.put('/:id', ctrl.update)
router.delete('/:id', ctrl.remove)

export default router
