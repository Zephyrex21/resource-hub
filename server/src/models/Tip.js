import mongoose from 'mongoose'
import { TIP_CATEGORIES } from '../config/constants.js'
import { slugify } from '../utils/slugify.js'

const tipSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, index: true },
    category: { type: String, required: true, enum: TIP_CATEGORIES },
    tags: { type: [String], default: [] },
    summary: { type: String, required: true },
    // Preferred: write tips as markdown so code blocks render natively on-site.
    contentMarkdown: { type: String, default: '' },
    // Fallback: a PDF/DOC, same as Notes, for tips you haven't converted yet.
    fileUrl: { type: String, default: '' },
    fileType: { type: String, enum: ['pdf', 'docx'], default: 'pdf' },
    coverImageUrl: { type: String, default: '' },
    viewCount: { type: Number, default: 0 },
    // AI-feature fields — see Note.js for the select:false rationale.
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

tipSchema.pre('validate', function (next) {
  if (!this.slug && this.title) this.slug = slugify(this.title)
  if (!this.contentMarkdown && !this.fileUrl) {
    return next(new Error('A tip needs either contentMarkdown or a fileUrl.'))
  }
  next()
})

tipSchema.index({ title: 'text', summary: 'text', tags: 'text' })

export default mongoose.model('Tip', tipSchema)
