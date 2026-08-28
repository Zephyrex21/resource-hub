import mongoose from 'mongoose'

const activityLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    // UTC calendar day as 'YYYY-MM-DD' rather than a Date truncated to
    // midnight — a plain string sorts and compares correctly and sidesteps
    // timezone-conversion bugs that a Date field would invite (server's
    // local TZ vs. the visitor's TZ vs. UTC all potentially disagreeing
    // about "which day" a timestamp near midnight falls on).
    date: { type: String, required: true },
  },
  { timestamps: true },
)

// One row per user per day — logging activity twice in the same day is a
// no-op, enforced via upsert in the controller rather than an app-level
// existence check first.
activityLogSchema.index({ userId: 1, date: 1 }, { unique: true })

export default mongoose.model('ActivityLog', activityLogSchema)
