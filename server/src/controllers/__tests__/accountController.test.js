import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest'
import bcrypt from 'bcryptjs'
import { createAccountController } from '../accountController.js'

function mockRes() {
  const res = {}
  res.status = vi.fn().mockReturnValue(res)
  res.json = vi.fn().mockReturnValue(res)
  res.end = vi.fn().mockReturnValue(res)
  res.cookie = vi.fn().mockReturnValue(res)
  res.clearCookie = vi.fn().mockReturnValue(res)
  return res
}

// signToken() reads process.env.JWT_SECRET directly, same requirement as
// the existing admin auth.test.js.
beforeAll(() => {
  process.env.JWT_SECRET = 'test-jwt-secret'
})

describe('createAccountController', () => {
  let User, Progress, SavedItem, ActivityLog, ctrl, next

  beforeEach(() => {
    User = { findOne: vi.fn(), create: vi.fn(), findById: vi.fn() }
    Progress = { find: vi.fn(), findOne: vi.fn(), create: vi.fn(), deleteOne: vi.fn() }
    SavedItem = { find: vi.fn(), findOne: vi.fn(), create: vi.fn(), deleteOne: vi.fn() }
    ActivityLog = { find: vi.fn(), updateOne: vi.fn() }
    ctrl = createAccountController({ User, Progress, SavedItem, ActivityLog })
    next = vi.fn()
  })

  describe('register', () => {
    it('hashes the password (never stores it raw), creates the user, and sets a cookie', async () => {
      User.findOne.mockResolvedValue(null)
      User.create.mockImplementation(async (data) => ({ _id: 'u1', ...data }))
      const res = mockRes()

      await ctrl.register(
        { body: { name: 'Zephyr', email: 'z@test.local', password: 'password123' } },
        res,
        next,
      )

      expect(User.findOne).toHaveBeenCalledWith({ email: 'z@test.local' })
      const createdArg = User.create.mock.calls[0][0]
      expect(createdArg.passwordHash).not.toBe('password123')
      expect(await bcrypt.compare('password123', createdArg.passwordHash)).toBe(true)

      expect(res.cookie).toHaveBeenCalledWith(
        'user_token',
        expect.any(String),
        expect.objectContaining({ httpOnly: true }),
      )
      expect(res.status).toHaveBeenCalledWith(201)
      // Public shape only — no passwordHash leaked in the response.
      expect(res.json).toHaveBeenCalledWith({ id: 'u1', name: 'Zephyr', email: 'z@test.local', avatarUrl: '' })
    })

    it('rejects a duplicate email with 409 and never calls create', async () => {
      User.findOne.mockResolvedValue({ _id: 'existing' })
      const res = mockRes()

      await ctrl.register({ body: { name: 'X', email: 'dup@test.local', password: 'password123' } }, res, next)

      expect(res.status).toHaveBeenCalledWith(409)
      expect(User.create).not.toHaveBeenCalled()
    })

    it('forwards unexpected errors to next() instead of throwing', async () => {
      const error = new Error('db down')
      User.findOne.mockRejectedValue(error)
      await ctrl.register({ body: { name: 'X', email: 'x@test.local', password: 'password123' } }, mockRes(), next)
      expect(next).toHaveBeenCalledWith(error)
    })
  })

  describe('login', () => {
    it('logs in with correct credentials and sets a cookie', async () => {
      const hash = await bcrypt.hash('password123', 10)
      User.findOne.mockResolvedValue({
        _id: 'u1',
        name: 'Zephyr',
        email: 'z@test.local',
        avatarUrl: '',
        passwordHash: hash,
      })
      const res = mockRes()

      await ctrl.login({ body: { email: 'z@test.local', password: 'password123' } }, res, next)

      expect(res.cookie).toHaveBeenCalledWith('user_token', expect.any(String), expect.any(Object))
      expect(res.json).toHaveBeenCalledWith({ id: 'u1', name: 'Zephyr', email: 'z@test.local', avatarUrl: '' })
    })

    it('rejects an unknown email with 401', async () => {
      User.findOne.mockResolvedValue(null)
      const res = mockRes()
      await ctrl.login({ body: { email: 'ghost@test.local', password: 'whatever' } }, res, next)
      expect(res.status).toHaveBeenCalledWith(401)
    })

    it('rejects a wrong password with 401 using the same message as an unknown email', async () => {
      const hash = await bcrypt.hash('password123', 10)
      User.findOne.mockResolvedValue({ _id: 'u1', passwordHash: hash })
      const res = mockRes()
      await ctrl.login({ body: { email: 'z@test.local', password: 'wrong' } }, res, next)
      expect(res.status).toHaveBeenCalledWith(401)
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid email or password' })
    })
  })

  describe('me', () => {
    it("returns the current user's public shape", async () => {
      User.findById.mockResolvedValue({ _id: 'u1', name: 'Zephyr', email: 'z@test.local', avatarUrl: '' })
      const res = mockRes()
      await ctrl.me({ userId: 'u1' }, res, next)
      expect(User.findById).toHaveBeenCalledWith('u1')
      expect(res.json).toHaveBeenCalledWith({ id: 'u1', name: 'Zephyr', email: 'z@test.local', avatarUrl: '' })
    })

    it('returns 401 when the user no longer exists (e.g. deleted account, valid token)', async () => {
      User.findById.mockResolvedValue(null)
      const res = mockRes()
      await ctrl.me({ userId: 'gone' }, res, next)
      expect(res.status).toHaveBeenCalledWith(401)
    })
  })

  describe('toggleProgress', () => {
    it('marks complete when no record exists yet, and logs today as an active day', async () => {
      Progress.findOne.mockResolvedValue(null)
      const res = mockRes()
      await ctrl.toggleProgress({ userId: 'u1', body: { contentType: 'note', slug: 'dbms-normalization' } }, res, next)
      expect(Progress.create).toHaveBeenCalledWith({ userId: 'u1', contentType: 'note', slug: 'dbms-normalization' })
      expect(ActivityLog.updateOne).toHaveBeenCalledTimes(1)
      const [filter, update, opts] = ActivityLog.updateOne.mock.calls[0]
      expect(filter.userId).toBe('u1')
      expect(opts).toEqual({ upsert: true })
      expect(update.$setOnInsert.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(res.status).toHaveBeenCalledWith(201)
      expect(res.json).toHaveBeenCalledWith({ completed: true })
    })

    it('unmarks (toggles off) when a record already exists, and does NOT log activity', async () => {
      Progress.findOne.mockResolvedValue({ _id: 'p1' })
      const res = mockRes()
      await ctrl.toggleProgress({ userId: 'u1', body: { contentType: 'note', slug: 'dbms-normalization' } }, res, next)
      expect(Progress.deleteOne).toHaveBeenCalledWith({ _id: 'p1' })
      expect(Progress.create).not.toHaveBeenCalled()
      expect(ActivityLog.updateOne).not.toHaveBeenCalled()
      expect(res.json).toHaveBeenCalledWith({ completed: false })
    })

    it('scopes the lookup to the requesting user (never another user\'s record)', async () => {
      Progress.findOne.mockResolvedValue(null)
      await ctrl.toggleProgress({ userId: 'u1', body: { contentType: 'tip', slug: 'git-rebase' } }, mockRes(), next)
      expect(Progress.findOne).toHaveBeenCalledWith({ userId: 'u1', contentType: 'tip', slug: 'git-rebase' })
    })
  })

  describe('getStreak', () => {
    it('computes current/longest streak from the user\'s activity log', async () => {
      ActivityLog.find.mockReturnValue({ lean: vi.fn().mockResolvedValue([{ date: '2026-08-27' }, { date: '2026-08-26' }]) })
      const res = mockRes()
      await ctrl.getStreak({ userId: 'u1' }, res, next)
      expect(ActivityLog.find).toHaveBeenCalledWith({ userId: 'u1' }, 'date')
      const payload = res.json.mock.calls[0][0]
      expect(payload.activeDates.sort()).toEqual(['2026-08-26', '2026-08-27'])
      expect(typeof payload.current).toBe('number')
      expect(typeof payload.longest).toBe('number')
    })

    it('returns zeros for a user with no activity yet', async () => {
      ActivityLog.find.mockReturnValue({ lean: vi.fn().mockResolvedValue([]) })
      const res = mockRes()
      await ctrl.getStreak({ userId: 'u1' }, res, next)
      expect(res.json).toHaveBeenCalledWith({ current: 0, longest: 0, activeDates: [] })
    })
  })

  describe('toggleSaved', () => {
    it('saves (with denormalized title/subtitle) when not already saved', async () => {
      SavedItem.findOne.mockResolvedValue(null)
      const res = mockRes()
      await ctrl.toggleSaved(
        { userId: 'u1', body: { contentType: 'project', slug: 'aurient', title: 'AURIENT', subtitle: 'Watch site' } },
        res,
        next,
      )
      expect(SavedItem.create).toHaveBeenCalledWith({
        userId: 'u1',
        contentType: 'project',
        slug: 'aurient',
        title: 'AURIENT',
        subtitle: 'Watch site',
      })
      expect(res.json).toHaveBeenCalledWith({ saved: true })
    })

    it('unsaves (toggles off) when already saved', async () => {
      SavedItem.findOne.mockResolvedValue({ _id: 's1' })
      const res = mockRes()
      await ctrl.toggleSaved(
        { userId: 'u1', body: { contentType: 'project', slug: 'aurient', title: 'AURIENT', subtitle: '' } },
        res,
        next,
      )
      expect(SavedItem.deleteOne).toHaveBeenCalledWith({ _id: 's1' })
      expect(res.json).toHaveBeenCalledWith({ saved: false })
    })
  })

  describe('listProgress / listSaved', () => {
    it('lists only the requesting user\'s progress', async () => {
      const docs = [{ contentType: 'note', slug: 'x' }]
      Progress.find.mockResolvedValue(docs)
      const res = mockRes()
      await ctrl.listProgress({ userId: 'u1' }, res, next)
      expect(Progress.find).toHaveBeenCalledWith({ userId: 'u1' })
      expect(res.json).toHaveBeenCalledWith(docs)
    })

    it('lists only the requesting user\'s saved items', async () => {
      const docs = [{ contentType: 'note', slug: 'x', title: 'X', subtitle: '' }]
      SavedItem.find.mockResolvedValue(docs)
      const res = mockRes()
      await ctrl.listSaved({ userId: 'u1' }, res, next)
      expect(SavedItem.find).toHaveBeenCalledWith({ userId: 'u1' })
      expect(res.json).toHaveBeenCalledWith(docs)
    })
  })
})
