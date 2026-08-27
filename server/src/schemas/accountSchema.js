import { z } from 'zod'

export const registerSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(80, 'Name is too long'),
  email: z.string().trim().toLowerCase().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export const userLoginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const progressToggleSchema = z.object({
  contentType: z.enum(['note', 'tip']),
  slug: z.string().trim().min(1, 'slug is required'),
})

export const savedToggleSchema = z.object({
  contentType: z.enum(['note', 'tip', 'project']),
  slug: z.string().trim().min(1, 'slug is required'),
  title: z.string().trim().min(1, 'title is required'),
  subtitle: z.string().trim().optional().default(''),
})
