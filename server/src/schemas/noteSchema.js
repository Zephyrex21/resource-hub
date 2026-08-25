import { z } from 'zod'
import { NOTE_SUBJECTS, DIFFICULTIES } from '../config/constants.js'

// Mirrors the Mongoose schema's own constraints (required fields, enums) —
// this runs *before* Mongoose ever sees the request, so a malformed payload
// gets a clear, specific 400 instead of a generic Mongoose ValidationError
// or, worse, a subtly-wrong document actually getting saved (e.g. an empty
// string sneaking past a `required` check because it's falsy-but-present).
export const noteCreateSchema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  subject: z.enum(NOTE_SUBJECTS, { message: `Subject must be one of: ${NOTE_SUBJECTS.join(', ')}` }),
  tags: z.array(z.string()).default([]),
  description: z.string().trim().min(1, 'Description is required'),
  fileUrl: z.string().trim().min(1, 'fileUrl is required'),
  fileType: z.enum(['pdf', 'docx']).default('pdf'),
  coverImageUrl: z.string().trim().default(''),
  difficulty: z.enum(DIFFICULTIES).default('beginner'),
})

// Same shape, but every field optional — a PUT can update just one field
// without having to resend the whole document.
export const noteUpdateSchema = noteCreateSchema.partial()
