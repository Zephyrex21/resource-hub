import { describe, it, expect, beforeAll } from 'vitest'
import request from 'supertest'

let app

beforeAll(async () => {
  app = (await import('../../app.js')).default
})

describe('GET /api/v1/health', () => {
  it('responds 200 with status/db/timestamp, and is not behind the rate limiter', async () => {
    const res = await request(app).get('/api/v1/health')

    expect(res.status).toBe(200)
    expect(res.body.status).toBe('ok')
    expect(res.body.db).toBe('disconnected') // no live MongoDB connection in this test process
    expect(typeof res.body.timestamp).toBe('string')
  })

  it('has no meaningful request cap even hit repeatedly (unlike the rest of the API)', async () => {
    // apiLimiter's cap is 300/15min, so 10 rapid hits here is nowhere near
    // enough to prove "unlimited" — this just confirms /health is mounted
    // *before* apiLimiter and therefore isn't subject to it at all, by
    // checking there's no RateLimit-* header on its response.
    const res = await request(app).get('/api/v1/health')
    expect(res.headers['ratelimit-limit']).toBeUndefined()
  })
})
