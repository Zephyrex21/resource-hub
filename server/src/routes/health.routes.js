import { Router } from 'express'
import { getConnectionState } from '../config/db.js'

const router = Router()

router.get('/', (req, res) => {
  res.json({
    status: 'ok',
    db: getConnectionState(),
    timestamp: new Date().toISOString(),
  })
})

export default router
