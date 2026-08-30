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
    viewCount: { type: Number, default: 0 },
    // AI-feature fields — select:false keeps them out of every normal
    // GET /notes list/detail response (extractedText especially could be
    // up to 20k chars; no reason to ship that on every page load). The
    // quiz/explain controllers explicitly .select('+field') when they
    // actually need one of these.
    extractedText: { type: String, default: '', select: false },
    quiz: {
      type: [{ question: String, options: [String], correctIndex: Number, explanation: String }],
      default: [],
      select: false,
    },
    quizGeneratedAt: { type: Date, select: false },
  },
  { timestamps: true },
)

noteSchema.pre('validate', function (next) {
  if (!this.slug && this.title) this.slug = slugify(this.title)
  next()
})

noteSchema.index({ title: 'text', description: 'text', tags: 'text' })

export default mongoose.model('Note', noteSchema)
