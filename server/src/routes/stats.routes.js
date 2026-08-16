import { Router } from 'express'
import Note from '../models/Note.js'
import Tip from '../models/Tip.js'
import Project from '../models/Project.js'

const router = Router()

// Real counts for the homepage stats strip — intentionally not vanity metrics
// (no "30k+ community" style numbers), just what's actually in the database.
router.get('/', async (req, res, next) => {
  try {
    const [notes, tips, projects] = await Promise.all([
      Note.countDocuments(),
      Tip.countDocuments(),
      Project.countDocuments(),
    ])
    res.json({ notes, tips, projects })
  } catch (err) {
    next(err)
  }
})

export default router
