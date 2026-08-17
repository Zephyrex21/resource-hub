import { Router } from 'express'
import { createCrudController } from '../controllers/crudFactory.js'
import { requireAdmin } from '../middleware/requireAdmin.js'
import Note from '../models/Note.js'

const router = Router()
const ctrl = createCrudController(Note)

router.get('/', ctrl.list) // ?subject=&tag=&search=
router.get('/:slug', ctrl.getBySlug)

// Public, unauthenticated — just a counter, not a write to protect.
router.post('/:slug/download', async (req, res, next) => {
  try {
    const note = await Note.findOneAndUpdate(
      { slug: req.params.slug },
      { $inc: { downloadCount: 1 } },
      { new: true },
    )
    if (!note) return res.status(404).json({ error: 'Not found' })
    res.json({ downloadCount: note.downloadCount })
  } catch (err) {
    next(err)
  }
})

router.post('/', requireAdmin, ctrl.create)
router.put('/:id', requireAdmin, ctrl.update)
router.delete('/:id', requireAdmin, ctrl.remove)

export default router
