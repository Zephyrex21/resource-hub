import { describe, it, expect, vi, beforeAll } from 'vitest'
import { signToken } from '../../utils/jwt.js'
import { requireAdmin } from '../requireAdmin.js'

beforeAll(() => {
  process.env.JWT_SECRET = 'test-jwt-secret'
})

function mockRes() {
  const res = {}
  res.status = vi.fn().mockReturnValue(res)
  res.json = vi.fn().mockReturnValue(res)
  return res
}

describe('requireAdmin', () => {
  it('calls next() and sets req.admin for a valid admin token', () => {
    const token = signToken({ type: 'admin', email: 'a@test.local' })
    const req = { cookies: { token } }
    const res = mockRes()
    const next = vi.fn()

    requireAdmin(req, res, next)

    expect(req.admin.email).toBe('a@test.local')
    expect(next).toHaveBeenCalled()
  })

  it('rejects with 401 when no cookie is present', () => {
    const res = mockRes()
    const next = vi.fn()
    requireAdmin({ cookies: {} }, res, next)
    expect(res.status).toHaveBeenCalledWith(401)
    expect(next).not.toHaveBeenCalled()
  })

  it('rejects a user-account token presented as an admin token, even though both share JWT_SECRET', () => {
    const userToken = signToken({ type: 'user', sub: 'u1' })
    const req = { cookies: { token: userToken } }
    const res = mockRes()
    const next = vi.fn()

    requireAdmin(req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(next).not.toHaveBeenCalled()
  })
})
