import { Router } from 'express'
import { NOTE_SUBJECTS, TIP_CATEGORIES, PROJECT_STATUSES, DIFFICULTIES } from '../config/constants.js'

const router = Router()

// Lets the frontend build filter dropdowns without hardcoding taxonomy client-side.
router.get('/', (req, res) => {
  res.json({
    noteSubjects: NOTE_SUBJECTS,
    tipCategories: TIP_CATEGORIES,
    projectStatuses: PROJECT_STATUSES,
    difficulties: DIFFICULTIES,
  })
})

export default router
