import { z } from 'zod'
import { PROJECT_STATUSES } from '../config/constants.js'

export const projectCreateSchema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  description: z.string().trim().min(1, 'Description is required'),
  techStack: z.array(z.string()).default([]),
  githubUrl: z.string().trim().min(1, 'githubUrl is required'),
  liveUrl: z.string().trim().nullable().default(null),
  coverImageUrl: z.string().trim().default(''),
  status: z.enum(PROJECT_STATUSES).default('active'),
  featured: z.boolean().default(false),
  order: z.number().default(0),
})

export const projectUpdateSchema = projectCreateSchema.partial()
