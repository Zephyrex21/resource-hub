import { describe, it, expect, beforeAll } from 'vitest'
import bcrypt from 'bcryptjs'
import request from 'supertest'

const TEST_EMAIL = 'admin@test.local'
const TEST_PASSWORD = 'correct-horse-battery-staple'

let app

// Env vars must be set BEFORE app.js (and its route imports) are evaluated,
// since the login handler reads process.env.ADMIN_EMAIL/ADMIN_PASSWORD_HASH
// directly. A static top-level `import` would be hoisted ahead of this
// setup, so app.js is imported dynamically inside beforeAll instead.
beforeAll(async () => {
  process.env.JWT_SECRET = 'test-jwt-secret'
  process.env.ADMIN_EMAIL = TEST_EMAIL
  process.env.ADMIN_PASSWORD_HASH = await bcrypt.hash(TEST_PASSWORD, 10)

  app = (await import('../../app.js')).default
})

// Exactly 4 requests in this file, intentionally kept under authLimiter's
// 5-per-15-min cap (see rateLimiting.test.js for the dedicated test of the
// limiter itself, in its own file so it starts with a clean counter).
describe('POST /api/v1/auth/login', () => {
  it('logs in successfully with correct credentials and sets a cookie', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({ email: TEST_EMAIL, password: TEST_PASSWORD })

    expect(res.status).toBe(200)
    expect(res.body).toEqual({ email: TEST_EMAIL })
    expect(res.headers['set-cookie']?.[0]).toMatch(/^token=/)
  })

  it('rejects a wrong password with 401', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: TEST_EMAIL, password: 'wrong-password' })

    expect(res.status).toBe(401)
    expect(res.body.error).toMatch(/invalid email or password/i)
  })

  it('rejects a wrong email with 401', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'someone-else@test.local', password: TEST_PASSWORD })

    expect(res.status).toBe(401)
  })

  it('rejects a malformed email with 400 before ever checking credentials', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'not-an-email', password: TEST_PASSWORD })

    expect(res.status).toBe(400)
  })
})
