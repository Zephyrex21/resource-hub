import { describe, it, expect, vi, beforeAll } from 'vitest'
import { signToken } from '../../utils/jwt.js'
import { requireUser } from '../requireUser.js'

beforeAll(() => {
  process.env.JWT_SECRET = 'test-jwt-secret'
})

function mockRes() {
  const res = {}
  res.status = vi.fn().mockReturnValue(res)
  res.json = vi.fn().mockReturnValue(res)
  return res
}

describe('requireUser', () => {
  it('calls next() and sets req.userId for a valid user token', () => {
    const token = signToken({ type: 'user', sub: 'u1' })
    const req = { cookies: { user_token: token } }
    const res = mockRes()
    const next = vi.fn()

    requireUser(req, res, next)

    expect(req.userId).toBe('u1')
    expect(next).toHaveBeenCalled()
  })

  it('rejects with 401 when no cookie is present', () => {
    const res = mockRes()
    const next = vi.fn()
    requireUser({ cookies: {} }, res, next)
    expect(res.status).toHaveBeenCalledWith(401)
    expect(next).not.toHaveBeenCalled()
  })

  it("rejects an admin token presented as a user token, even though both share JWT_SECRET", () => {
    const adminToken = signToken({ type: 'admin', email: 'a@test.local' })
    const req = { cookies: { user_token: adminToken } }
    const res = mockRes()
    const next = vi.fn()

    requireUser(req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(next).not.toHaveBeenCalled()
  })

  it('rejects a malformed token with 401', () => {
    const res = mockRes()
    const next = vi.fn()
    requireUser({ cookies: { user_token: 'not-a-real-jwt' } }, res, next)
    expect(res.status).toHaveBeenCalledWith(401)
  })
})
