import mongoose from 'mongoose'
import { NOTE_SUBJECTS, DIFFICULTIES } from '../config/constants.js'
import { slugify } from '../utils/slugify.js'

const noteSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, index: true },
    subject: { type: String, required: true, enum: NOTE_SUBJECTS },
    tags: { type: [String], default: [] },
    description: { type: String, required: true },
    fileUrl: { type: String, required: true },
    fileType: { type: String, enum: ['pdf', 'docx'], default: 'pdf' },
    coverImageUrl: { type: String, default: '' },
    difficulty: { type: String, enum: DIFFICULTIES, default: 'beginner' },
    downloadCount: { type: Number, default: 0 },
  },
  { timestamps: true },
)

noteSchema.pre('validate', function (next) {
  if (!this.slug && this.title) this.slug = slugify(this.title)
  next()
})

noteSchema.index({ title: 'text', description: 'text', tags: 'text' })

export default mongoose.model('Note', noteSchema)
