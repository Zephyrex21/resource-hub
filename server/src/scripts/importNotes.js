// Bulk-imports local files into Notes: uploads each to Supabase Storage and
// creates the corresponding Note record. Reusable for future batches — just
// drop new PDFs/DOCs in server/import/files/ and add an entry to manifest.json.
//
// Usage:
//   npm run import-notes            (real run — uploads + writes to the DB)
//   npm run import-notes:dry-run    (validates everything, touches nothing)

import 'dotenv/config'
import { readFile } from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import mongoose from 'mongoose'
import { connectDB } from '../config/db.js'
import { uploadFile } from '../config/storage.js'
import Note from '../models/Note.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const IMPORT_DIR = path.resolve(__dirname, '../../import')
const FILES_DIR = path.join(IMPORT_DIR, 'files')
const MANIFEST_PATH = path.join(IMPORT_DIR, 'manifest.json')

const MIME_TYPES = {
  '.pdf': 'application/pdf',
  '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
}

const DRY_RUN = process.argv.includes('--dry-run')

async function importNotes() {
  await connectDB()

  if (!DRY_RUN && mongoose.connection.readyState !== 1) {
    console.error('[import] No database connection — check MONGODB_URI in server/.env')
    process.exit(1)
  }

  let manifest
  try {
    manifest = JSON.parse(await readFile(MANIFEST_PATH, 'utf8'))
  } catch (err) {
    console.error(`[import] Couldn't read manifest at ${MANIFEST_PATH}:`, err.message)
    process.exit(1)
  }

  console.log(
    `[import] ${DRY_RUN ? 'Dry run — ' : ''}Importing ${manifest.length} note(s)...\n`,
  )

  let succeeded = 0
  let failed = 0

  for (const entry of manifest) {
    const filePath = path.join(FILES_DIR, entry.file)
    try {
      const buffer = await readFile(filePath)
      const ext = path.extname(entry.file).toLowerCase()
      const mimetype = MIME_TYPES[ext]
      if (!mimetype) throw new Error(`Unsupported file type: ${ext}`)

      const fileType = ext === '.pdf' ? 'pdf' : 'docx'
      const sizeMB = (buffer.length / 1024 / 1024).toFixed(2)

      if (DRY_RUN) {
        // Validates the metadata against the real schema (enum subjects,
        // required fields, etc.) without uploading or writing to the DB.
        const note = new Note({
          title: entry.title,
          subject: entry.subject,
          tags: entry.tags ?? [],
          description: entry.description,
          fileUrl: `https://dry-run-placeholder.example.com/${entry.file}`,
          fileType,
          difficulty: entry.difficulty ?? 'beginner',
        })
        await note.validate()
        console.log(`[dry-run ok] ${entry.file} (${sizeMB} MB) -> slug "${note.slug}"`)
      } else {
        const fileUrl = await uploadFile(buffer, entry.file, mimetype)
        const note = await Note.create({
          title: entry.title,
          subject: entry.subject,
          tags: entry.tags ?? [],
          description: entry.description,
          fileUrl,
          fileType,
          difficulty: entry.difficulty ?? 'beginner',
        })
        console.log(`[ok] ${entry.file} (${sizeMB} MB) -> ${note.slug}`)
      }

      succeeded++
    } catch (err) {
      console.error(`[fail] ${entry.file}: ${err.message}`)
      failed++
    }
  }

  console.log(`\n[import] Done. ${succeeded} succeeded, ${failed} failed.`)
  await mongoose.disconnect()
  process.exit(failed > 0 ? 1 : 0)
}

importNotes().catch((err) => {
  console.error('[import] Fatal error:', err)
  process.exit(1)
})
