import { z } from 'zod'
import { TIP_CATEGORIES } from '../config/constants.js'

// Replicates the Mongoose model's pre('validate') rule (needs either
// contentMarkdown or fileUrl) at the HTTP boundary too, so a bad request
// fails with a specific 400 message instead of reaching Mongoose and
// bubbling up as a generic ValidationError.
const tipBaseSchema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  category: z.enum(TIP_CATEGORIES, { message: `Category must be one of: ${TIP_CATEGORIES.join(', ')}` }),
  tags: z.array(z.string()).default([]),
  summary: z.string().trim().min(1, 'Summary is required'),
  // Deliberately no `.default('')` here — with `.partial()` applied for
  // updates, a defaulted field gets filled in even when the caller's
  // payload never mentioned it, which broke the "did this request actually
  // touch contentMarkdown/fileUrl" check below (every partial update looked
  // like it was clearing both to ''). Mongoose's own schema defaults handle
  // the create-time "always a string" case.
  contentMarkdown: z.string().optional(),
  fileUrl: z.string().optional(),
  coverImageUrl: z.string().trim().default(''),
})

function requireMarkdownOrFile(data, ctx) {
  if (!data.contentMarkdown?.trim() && !data.fileUrl?.trim()) {
    ctx.addIssue({ code: 'custom', message: 'A tip needs either contentMarkdown or a fileUrl.' })
  }
}

export const tipCreateSchema = tipBaseSchema.superRefine(requireMarkdownOrFile)

// A partial update only enforces the markdown-or-file rule if the caller is
// actually touching one of those two fields — otherwise a one-field PATCH-
// style update (e.g. just changing the title) would fail the rule for no
// reason, since neither field is present in the partial payload at all.
// Known trade-off: this can't see the *existing* document, so clearing
// contentMarkdown to '' while relying on an already-set fileUrl that isn't
// part of this request won't be caught here — Mongoose's own
// pre('validate') hook is still the final backstop for that case.
export const tipUpdateSchema = tipBaseSchema.partial().superRefine((data, ctx) => {
  if ('contentMarkdown' in data || 'fileUrl' in data) requireMarkdownOrFile(data, ctx)
})
