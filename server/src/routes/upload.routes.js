import { Router } from 'express'
import multer from 'multer'
import { requireAdmin } from '../middleware/requireAdmin.js'
import { uploadFile } from '../config/storage.js'

const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: (req, file, cb) => {
    if (ALLOWED_TYPES.includes(file.mimetype)) cb(null, true)
    else cb(new Error('Only PDF, DOC, and DOCX files are allowed'))
  },
})

const router = Router()

router.post('/', requireAdmin, upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' })
    const url = await uploadFile(req.file.buffer, req.file.originalname, req.file.mimetype)
    res.status(201).json({ url })
  } catch (err) {
    next(err)
  }
})

export default router
