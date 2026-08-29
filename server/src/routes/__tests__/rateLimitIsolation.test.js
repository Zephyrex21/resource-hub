import { describe, it, expect, beforeAll } from 'vitest'
import request from 'supertest'

const TEST_EMAIL = 'admin@test.local'
const TEST_PASSWORD = 'correct-horse-battery-staple'

let app

beforeAll(async () => {
  process.env.JWT_SECRET = 'test-jwt-secret'
  process.env.ADMIN_EMAIL = TEST_EMAIL
  process.env.ADMIN_PASSWORD = TEST_PASSWORD

  app = (await import('../../app.js')).default
})

// Regression test for a real bug: account.routes.js originally reused the
// same authLimiter instance as admin login, so exhausting the shared
// budget by testing account signup/login a few times (normal, expected
// traffic) would then reject a subsequent *correct* admin login with 429
// — indistinguishable from "login is broken" even though nothing about
// the admin credentials was wrong. This proves the two are independent.
describe('admin vs. account rate limiting isolation', () => {
  it('exhausting the account auth limiter does not affect admin login', async () => {
    for (let i = 0; i < 5; i++) {
      const res = await request(app).post('/api/v1/account/register').send({})
      expect(res.status).toBe(400) // validation failure, but not rate-limited yet
    }

    const sixthAccountAttempt = await request(app).post('/api/v1/account/register').send({})
    expect(sixthAccountAttempt.status).toBe(429) // account limiter is now exhausted

    const adminLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: TEST_EMAIL, password: TEST_PASSWORD })

    expect(adminLogin.status).toBe(200) // admin login is unaffected
  })
})
