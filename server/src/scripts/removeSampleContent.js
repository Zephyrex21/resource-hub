// One-off cleanup: removes the original placeholder sample Notes/Tips that
// earlier versions of seed.js used to insert, by exact slug — so your real
// content (anything added via the admin panel or `npm run import-notes`)
// is never touched. Safe to run multiple times; does nothing once the
// samples are already gone.
//
// Usage: npm run clean-samples

import 'dotenv/config'
import mongoose from 'mongoose'
import { connectDB } from '../config/db.js'
import Note from '../models/Note.js'
import Tip from '../models/Tip.js'

const SAMPLE_NOTE_SLUGS = [
  'dbms-fundamentals-normalization-er-modeling',
  'os-process-scheduling-deadlocks',
  'llms-rag-how-it-works',
  'dsa-trees-graphs-traversals',
]

const SAMPLE_TIP_SLUGS = ['install-configure-docker-ubuntu', 'fix-git-push-ssh-permission-denied']

async function cleanSamples() {
  await connectDB()

  if (mongoose.connection.readyState !== 1) {
    console.error('[clean-samples] No database connection — check MONGODB_URI in server/.env')
    process.exit(1)
  }

  const notesResult = await Note.deleteMany({ slug: { $in: SAMPLE_NOTE_SLUGS } })
  const tipsResult = await Tip.deleteMany({ slug: { $in: SAMPLE_TIP_SLUGS } })

  console.log(`[clean-samples] Removed ${notesResult.deletedCount} sample note(s).`)
  console.log(`[clean-samples] Removed ${tipsResult.deletedCount} sample tip(s).`)
  console.log('[clean-samples] Everything else was left untouched.')

  await mongoose.disconnect()
  process.exit(0)
}

cleanSamples().catch((err) => {
  console.error('[clean-samples] Failed:', err)
  process.exit(1)
})
