import { z } from 'zod'

export const askSchema = z.object({
  question: z
    .string()
    .trim()
    .min(1, 'Question is required')
    .max(500, 'Keep questions under 500 characters'),
})
