import { Router } from 'express'
import Note from '../models/Note.js'
import Tip from '../models/Tip.js'
import Project from '../models/Project.js'

const router = Router()

// Powers the client's ⌘K command palette — one call, results grouped by type.
router.get('/', async (req, res, next) => {
  try {
    const q = (req.query.q ?? '').trim()
    if (!q) return res.json({ notes: [], tips: [], projects: [] })

    const [notes, tips, projects] = await Promise.all([
      Note.find({ $text: { $search: q } }).limit(5),
      Tip.find({ $text: { $search: q } }).limit(5),
      Project.find({ $text: { $search: q } }).limit(5),
    ])

    res.json({ notes, tips, projects })
  } catch (err) {
    next(err)
  }
})

export default router
