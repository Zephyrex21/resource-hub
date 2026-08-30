import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest'
import { createExplainController, buildExplainPrompt } from '../explainController.js'

function mockRes() {
  const res = {}
  res.status = vi.fn().mockReturnValue(res)
  res.json = vi.fn().mockReturnValue(res)
  return res
}

describe('buildExplainPrompt', () => {
  it('includes the title and the original material', () => {
    const prompt = buildExplainPrompt('Git Rebase', 'Rebase rewrites commit history.')
    expect(prompt).toContain('Git Rebase')
    expect(prompt).toContain('Rebase rewrites commit history.')
  })
})

describe('createExplainController', () => {
  let Note, Tip, getSourceText, fetchImpl, ctrl, next

  beforeAll(() => {
    process.env.GROQ_API_KEY = 'test-key'
  })

  beforeEach(() => {
    Note = { findOne: vi.fn() }
    Tip = { findOne: vi.fn() }
    getSourceText = vi.fn()
    fetchImpl = vi.fn()
    ctrl = createExplainController({ Note, Tip, getSourceText, fetchImpl })
    next = vi.fn()
  })

  function mockFindOne(Model, doc) {
    Model.findOne.mockReturnValue({ select: vi.fn().mockResolvedValue(doc) })
  }

  it('rejects an unknown contentType with 400', async () => {
    const res = mockRes()
    await ctrl.explainDifferently({ params: { contentType: 'project', slug: 'x' } }, res, next)
    expect(res.status).toHaveBeenCalledWith(400)
  })

  it('returns 404 when the note/tip does not exist', async () => {
    mockFindOne(Note, null)
    const res = mockRes()
    await ctrl.explainDifferently({ params: { contentType: 'note', slug: 'missing' } }, res, next)
    expect(res.status).toHaveBeenCalledWith(404)
  })

  it('returns 503 when GROQ_API_KEY is unset', async () => {
    delete process.env.GROQ_API_KEY
    mockFindOne(Note, { _id: 'n1', slug: 'x' })
    const res = mockRes()
    await ctrl.explainDifferently({ params: { contentType: 'note', slug: 'x' } }, res, next)
    expect(res.status).toHaveBeenCalledWith(503)
    process.env.GROQ_API_KEY = 'test-key'
  })

  it('returns 422 when there is not enough source material', async () => {
    mockFindOne(Note, { _id: 'n1', slug: 'thin' })
    getSourceText.mockResolvedValue('too short')
    const res = mockRes()
    await ctrl.explainDifferently({ params: { contentType: 'note', slug: 'thin' } }, res, next)
    expect(res.status).toHaveBeenCalledWith(422)
  })

  it('returns the explanation on success, and never caches (no updateOne call exists to make)', async () => {
    mockFindOne(Note, { _id: 'n1', title: 'Normalization', slug: 'dbms-normalization' })
    getSourceText.mockResolvedValue('a'.repeat(300))
    fetchImpl.mockResolvedValue({
      ok: true,
      json: async () => ({ choices: [{ message: { content: 'Think of it like sorting a messy drawer.' } }] }),
    })
    const res = mockRes()

    await ctrl.explainDifferently({ params: { contentType: 'note', slug: 'dbms-normalization' } }, res, next)

    expect(res.json).toHaveBeenCalledWith({ explanation: 'Think of it like sorting a messy drawer.' })
  })

  it('returns 502 when Groq responds with an error status', async () => {
    mockFindOne(Note, { _id: 'n1', title: 'X', slug: 'x' })
    getSourceText.mockResolvedValue('a'.repeat(300))
    fetchImpl.mockResolvedValue({ ok: false, status: 500, text: async () => 'server error' })
    const res = mockRes()
    await ctrl.explainDifferently({ params: { contentType: 'note', slug: 'x' } }, res, next)
    expect(res.status).toHaveBeenCalledWith(502)
  })

  it('returns 502 when the model returns an empty explanation', async () => {
    mockFindOne(Note, { _id: 'n1', title: 'X', slug: 'x' })
    getSourceText.mockResolvedValue('a'.repeat(300))
    fetchImpl.mockResolvedValue({ ok: true, json: async () => ({ choices: [{ message: { content: '   ' } }] }) })
    const res = mockRes()
    await ctrl.explainDifferently({ params: { contentType: 'note', slug: 'x' } }, res, next)
    expect(res.status).toHaveBeenCalledWith(502)
  })

  it('works against the Tip model the same way as Note', async () => {
    mockFindOne(Tip, { _id: 't1', title: 'Git Rebase', slug: 'git-rebase', contentMarkdown: 'a'.repeat(300) })
    getSourceText.mockResolvedValue('a'.repeat(300))
    fetchImpl.mockResolvedValue({ ok: true, json: async () => ({ choices: [{ message: { content: 'Alt explanation.' } }] }) })
    const res = mockRes()
    await ctrl.explainDifferently({ params: { contentType: 'tip', slug: 'git-rebase' } }, res, next)
    expect(res.json).toHaveBeenCalledWith({ explanation: 'Alt explanation.' })
  })

  it('forwards unexpected errors to next()', async () => {
    const error = new Error('db exploded')
    Note.findOne.mockImplementation(() => {
      throw error
    })
    await ctrl.explainDifferently({ params: { contentType: 'note', slug: 'x' } }, mockRes(), next)
    expect(next).toHaveBeenCalledWith(error)
  })
})
