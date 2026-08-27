import mongoose from 'mongoose'

const progressSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    // Keyed by (contentType, slug) rather than a Note/Tip _id reference.
    // The client already treats slug as the canonical identifier for
    // notes/tips everywhere (ProgressContext, routing, etc.), and slugs
    // are unique + effectively immutable once set (see Note.js/Tip.js —
    // slug is only generated when absent, never regenerated from a later
    // title edit). Matching that here means the existing frontend
    // components needed zero prop-shape changes to sync with this.
    contentType: { type: String, enum: ['note', 'tip'], required: true },
    slug: { type: String, required: true, trim: true },
  },
  { timestamps: true },
)

// One completion record per user per piece of content. Also makes
// "toggle" idempotent from the controller's perspective: existence check
// + delete/create, no risk of duplicate rows from a double-click.
progressSchema.index({ userId: 1, contentType: 1, slug: 1 }, { unique: true })

export default mongoose.model('Progress', progressSchema)
