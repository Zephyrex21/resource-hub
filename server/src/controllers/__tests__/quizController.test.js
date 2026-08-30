import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest'
import { createQuizController, parseQuizResponse, buildQuizPrompt } from '../quizController.js'

function mockRes() {
  const res = {}
  res.status = vi.fn().mockReturnValue(res)
  res.json = vi.fn().mockReturnValue(res)
  return res
}

const VALID_QUIZ_JSON = JSON.stringify([
  { question: 'What does 3NF eliminate?', options: ['Redundancy', 'Indexes', 'Joins', 'Views'], correctIndex: 0, explanation: 'Third normal form removes transitive dependencies.' },
])

describe('buildQuizPrompt', () => {
  it('includes the title and material text', () => {
    const prompt = buildQuizPrompt('Normalization', 'Some study material here.')
    expect(prompt).toContain('Normalization')
    expect(prompt).toContain('Some study material here.')
  })
})

describe('parseQuizResponse', () => {
  it('parses a well-formed JSON array', () => {
    const questions = parseQuizResponse(VALID_QUIZ_JSON)
    expect(questions).toHaveLength(1)
    expect(questions[0].correctIndex).toBe(0)
  })

  it('strips markdown code fences the model sometimes adds despite instructions', () => {
    const fenced = '```json\n' + VALID_QUIZ_JSON + '\n```'
    expect(parseQuizResponse(fenced)).toHaveLength(1)
  })

  it('throws on non-JSON content', () => {
    expect(() => parseQuizResponse('not json at all')).toThrow(/parse/i)
  })

  it('throws on an empty array', () => {
    expect(() => parseQuizResponse('[]')).toThrow()
  })

  it('filters out malformed questions (missing fields, out-of-range correctIndex)', () => {
    const mixed = JSON.stringify([
      { question: 'Valid?', options: ['A', 'B'], correctIndex: 0, explanation: 'ok' },
      { question: 'Bad index', options: ['A', 'B'], correctIndex: 5, explanation: 'bad' },
      { question: 'Missing options', correctIndex: 0 },
      { notEvenAQuestion: true },
    ])
    const questions = parseQuizResponse(mixed)
    expect(questions).toHaveLength(1)
    expect(questions[0].question).toBe('Valid?')
  })

  it('throws if every question is malformed', () => {
    expect(() => parseQuizResponse(JSON.stringify([{ bad: true }]))).toThrow(/valid questions/)
  })

  it('defaults a missing explanation to an empty string rather than crashing', () => {
    const noExplanation = JSON.stringify([{ question: 'Q?', options: ['A', 'B'], correctIndex: 1 }])
    expect(parseQuizResponse(noExplanation)[0].explanation).toBe('')
  })
})

describe('createQuizController', () => {
  let Note, Tip, getSourceText, fetchImpl, ctrl, next

  beforeAll(() => {
    process.env.GROQ_API_KEY = 'test-key'
  })

  beforeEach(() => {
    Note = { findOne: vi.fn(), updateOne: vi.fn().mockResolvedValue({}) }
    Tip = { findOne: vi.fn(), updateOne: vi.fn().mockResolvedValue({}) }
    getSourceText = vi.fn()
    fetchImpl = vi.fn()
    ctrl = createQuizController({ Note, Tip, getSourceText, fetchImpl })
    next = vi.fn()
  })

  function mockFindOne(Model, doc) {
    Model.findOne.mockReturnValue({ select: vi.fn().mockResolvedValue(doc) })
  }

  it('rejects an unknown contentType with 400', async () => {
    const res = mockRes()
    await ctrl.getOrGenerateQuiz({ params: { contentType: 'project', slug: 'x' }, query: {} }, res, next)
    expect(res.status).toHaveBeenCalledWith(400)
  })

  it('returns 404 when the note/tip does not exist', async () => {
    mockFindOne(Note, null)
    const res = mockRes()
    await ctrl.getOrGenerateQuiz({ params: { contentType: 'note', slug: 'missing' }, query: {} }, res, next)
    expect(res.status).toHaveBeenCalledWith(404)
  })

  it('serves a cached quiz without calling Groq or the extractor', async () => {
    const cachedQuiz = [{ question: 'Q', options: ['A', 'B'], correctIndex: 0, explanation: '' }]
    mockFindOne(Note, { _id: 'n1', slug: 'dbms-normalization', quiz: cachedQuiz })
    const res = mockRes()

    await ctrl.getOrGenerateQuiz({ params: { contentType: 'note', slug: 'dbms-normalization' }, query: {} }, res, next)

    expect(getSourceText).not.toHaveBeenCalled()
    expect(fetchImpl).not.toHaveBeenCalled()
    expect(res.json).toHaveBeenCalledWith({ quiz: cachedQuiz, cached: true })
  })

  it('regenerates even with a cache present when ?regenerate=true', async () => {
    const cachedQuiz = [{ question: 'Old', options: ['A', 'B'], correctIndex: 0, explanation: '' }]
    mockFindOne(Note, { _id: 'n1', title: 'Normalization', slug: 'dbms-normalization', quiz: cachedQuiz })
    getSourceText.mockResolvedValue('a'.repeat(300))
    fetchImpl.mockResolvedValue({
      ok: true,
      json: async () => ({ choices: [{ message: { content: VALID_QUIZ_JSON } }] }),
    })
    const res = mockRes()

    await ctrl.getOrGenerateQuiz(
      { params: { contentType: 'note', slug: 'dbms-normalization' }, query: { regenerate: 'true' } },
      res,
      next,
    )

    expect(fetchImpl).toHaveBeenCalled()
    expect(Note.updateOne).toHaveBeenCalled()
    const payload = res.json.mock.calls[0][0]
    expect(payload.cached).toBe(false)
  })

  it('returns 503 when GROQ_API_KEY is unset and there is no cache to fall back on', async () => {
    delete process.env.GROQ_API_KEY
    mockFindOne(Note, { _id: 'n1', slug: 'dbms-normalization', quiz: [] })
    const res = mockRes()

    await ctrl.getOrGenerateQuiz({ params: { contentType: 'note', slug: 'dbms-normalization' }, query: {} }, res, next)

    expect(res.status).toHaveBeenCalledWith(503)
    process.env.GROQ_API_KEY = 'test-key'
  })

  it('returns 422 when there is not enough source material yet', async () => {
    mockFindOne(Note, { _id: 'n1', slug: 'thin-note', quiz: [] })
    getSourceText.mockResolvedValue('too short')
    const res = mockRes()

    await ctrl.getOrGenerateQuiz({ params: { contentType: 'note', slug: 'thin-note' }, query: {} }, res, next)

    expect(res.status).toHaveBeenCalledWith(422)
  })

  it('returns 502 when Groq responds with an error status', async () => {
    mockFindOne(Note, { _id: 'n1', title: 'X', slug: 'x', quiz: [] })
    getSourceText.mockResolvedValue('a'.repeat(300))
    fetchImpl.mockResolvedValue({ ok: false, status: 500, text: async () => 'server error' })
    const res = mockRes()

    await ctrl.getOrGenerateQuiz({ params: { contentType: 'note', slug: 'x' }, query: {} }, res, next)

    expect(res.status).toHaveBeenCalledWith(502)
  })

  it('returns 502 when the model output cannot be parsed into a quiz', async () => {
    mockFindOne(Note, { _id: 'n1', title: 'X', slug: 'x', quiz: [] })
    getSourceText.mockResolvedValue('a'.repeat(300))
    fetchImpl.mockResolvedValue({ ok: true, json: async () => ({ choices: [{ message: { content: 'nonsense' } }] }) })
    const res = mockRes()

    await ctrl.getOrGenerateQuiz({ params: { contentType: 'note', slug: 'x' }, query: {} }, res, next)

    expect(res.status).toHaveBeenCalledWith(502)
    expect(Note.updateOne).not.toHaveBeenCalled()
  })

  it('works against the Tip model the same way as Note', async () => {
    mockFindOne(Tip, { _id: 't1', slug: 'git-rebase', quiz: [{ question: 'Q', options: ['A', 'B'], correctIndex: 0, explanation: '' }] })
    const res = mockRes()
    await ctrl.getOrGenerateQuiz({ params: { contentType: 'tip', slug: 'git-rebase' }, query: {} }, res, next)
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ cached: true }))
  })

  it('forwards unexpected errors to next()', async () => {
    const error = new Error('db exploded')
    Note.findOne.mockImplementation(() => {
      throw error
    })
    await ctrl.getOrGenerateQuiz({ params: { contentType: 'note', slug: 'x' }, query: {} }, mockRes(), next)
    expect(next).toHaveBeenCalledWith(error)
  })
})
