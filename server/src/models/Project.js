import mongoose from 'mongoose'
import { PROJECT_STATUSES } from '../config/constants.js'
import { slugify } from '../utils/slugify.js'

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, index: true },
    description: { type: String, required: true },
    techStack: { type: [String], default: [] },
    githubUrl: { type: String, required: true },
    liveUrl: { type: String, default: null },
    coverImageUrl: { type: String, default: '' },
    status: { type: String, enum: PROJECT_STATUSES, default: 'active' },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true },
)

projectSchema.pre('validate', function (next) {
  if (!this.slug && this.title) this.slug = slugify(this.title)
  next()
})

projectSchema.index({ title: 'text', description: 'text', techStack: 'text' })

export default mongoose.model('Project', projectSchema)
