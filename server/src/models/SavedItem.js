import mongoose from 'mongoose'

const savedItemSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    contentType: { type: String, enum: ['note', 'tip', 'project'], required: true },
    slug: { type: String, required: true, trim: true },
    // Denormalized so the Saved page renders immediately from this
    // collection alone, mirroring exactly what BookmarksContext already
    // stores client-side: { type, slug, title, subtitle, savedAt }.
    title: { type: String, required: true, trim: true },
    subtitle: { type: String, default: '', trim: true },
  },
  { timestamps: true },
)

savedItemSchema.index({ userId: 1, contentType: 1, slug: 1 }, { unique: true })

export default mongoose.model('SavedItem', savedItemSchema)
