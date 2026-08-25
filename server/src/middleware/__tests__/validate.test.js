import { describe, it, expect, vi } from 'vitest'
import { z } from 'zod'
import { validate } from '../validate.js'

const schema = z.object({ name: z.string().min(1, 'Name is required') })

function mockRes() {
  const res = {}
  res.status = vi.fn().mockReturnValue(res)
  res.json = vi.fn().mockReturnValue(res)
  return res
}

describe('validate middleware', () => {
  it('calls next() and replaces req.body with the parsed data on success', () => {
    const req = { body: { name: 'Alice' } }
    const res = mockRes()
    const next = vi.fn()

    validate(schema)(req, res, next)

    expect(next).toHaveBeenCalledOnce()
    expect(res.status).not.toHaveBeenCalled()
    expect(req.body).toEqual({ name: 'Alice' })
  })

  it('responds 400 with an { error } message and does not call next() on failure', () => {
    const req = { body: { name: '' } }
    const res = mockRes()
    const next = vi.fn()

    validate(schema)(req, res, next)

    expect(next).not.toHaveBeenCalled()
    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({ error: expect.stringContaining('Name is required') })
  })

  it('applies schema defaults to req.body, not just validates it', () => {
    const schemaWithDefault = z.object({ status: z.enum(['active', 'archived']).default('active') })
    const req = { body: {} }
    const res = mockRes()
    const next = vi.fn()

    validate(schemaWithDefault)(req, res, next)

    expect(req.body).toEqual({ status: 'active' })
  })
})
