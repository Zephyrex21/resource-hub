import { describe, it, expect, beforeAll, beforeEach } from 'vitest'
import request from 'supertest'

let app

beforeAll(async () => {
  app = (await import('../../app.js')).default
})

beforeEach(() => {
  // Deliberately unset for every test in this file — the "not configured"
  // path is what's under test here; a real key would be needed to test the
  // success path, which also requires mocking the Mongo models and the
  // Groq fetch call (out of scope for this pass — see askController.test.js
  // for the pure-function coverage of the context-building logic instead).
  delete process.env.GROQ_API_KEY
})

describe('POST /api/v1/ask', () => {
  it('rejects an empty question with 400 before touching the DB or Groq', async () => {
    const res = await request(app).post('/api/v1/ask').send({ question: '' })
    expect(res.status).toBe(400)
  })

  it('rejects a question over 500 characters with 400', async () => {
    const res = await request(app).post('/api/v1/ask').send({ question: 'x'.repeat(501) })
    expect(res.status).toBe(400)
  })

  it('returns 503 with a clear message when GROQ_API_KEY is not set', async () => {
    const res = await request(app).post('/api/v1/ask').send({ question: 'How do I set up Docker?' })
    expect(res.status).toBe(503)
    expect(res.body.error).toMatch(/GROQ_API_KEY/)
  })
})
