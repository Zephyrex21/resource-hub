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

// Powers a small "top content" view in the admin panel.
router.get('/top', async (req, res, next) => {
  try {
    const limit = 5
    const [notes, tips, projects] = await Promise.all([
      Note.find().sort({ viewCount: -1 }).limit(limit).select('title slug subject viewCount'),
      Tip.find().sort({ viewCount: -1 }).limit(limit).select('title slug category viewCount'),
      Project.find().sort({ viewCount: -1 }).limit(limit).select('title slug status viewCount'),
    ])
    res.json({ notes, tips, projects })
  } catch (err) {
    next(err)
  }
})

export default router
