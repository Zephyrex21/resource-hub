import { describe, it, expect, beforeAll } from 'vitest'
import bcrypt from 'bcryptjs'
import request from 'supertest'

const TEST_EMAIL = 'admin@test.local'
const TEST_PASSWORD = 'correct-horse-battery-staple'

let app

beforeAll(async () => {
  process.env.JWT_SECRET = 'test-jwt-secret'
  process.env.ADMIN_EMAIL = TEST_EMAIL
  process.env.ADMIN_PASSWORD_HASH = await bcrypt.hash(TEST_PASSWORD, 10)

  app = (await import('../../app.js')).default
})

// authLimiter caps POST /login at 5 requests / 15 min per IP. This is the
// one endpoint that had *zero* brute-force protection before it was added —
// this test exists to prove the limiter is actually wired in, not just
// configured and unused.
describe('login rate limiting', () => {
  it('allows 5 attempts, then blocks the 6th with 429', async () => {
    for (let i = 0; i < 5; i++) {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: TEST_EMAIL, password: 'wrong-on-purpose' })
      expect(res.status).toBe(401) // wrong password, but not rate-limited yet
    }

    const sixth = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: TEST_EMAIL, password: 'wrong-on-purpose' })

    expect(sixth.status).toBe(429)
    expect(sixth.body.error).toMatch(/too many login attempts/i)
  })
})
