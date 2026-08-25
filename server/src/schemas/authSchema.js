import { z } from 'zod'

// Validates shape only (well-formed email, password present) — whether
// those credentials actually match the configured admin is the route
// handler's job, not this schema's. Keeps a wrong-shape request (missing
// field, non-string password) from ever reaching bcrypt.compare().
export const loginSchema = z.object({
  email: z.string().trim().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})
