import { describe, it, expect } from 'vitest'
import { noteCreateSchema, noteUpdateSchema } from '../noteSchema.js'
import { tipCreateSchema, tipUpdateSchema } from '../tipSchema.js'
import { projectCreateSchema, projectUpdateSchema } from '../projectSchema.js'
import { loginSchema } from '../authSchema.js'
import { askSchema } from '../askSchema.js'

describe('noteCreateSchema', () => {
  const valid = {
    title: 'Binary Search',
    subject: 'DSA',
    description: 'Covers binary search.',
    fileUrl: 'https://example.com/note.pdf',
  }

  it('accepts a minimal valid note and fills in defaults', () => {
    const result = noteCreateSchema.safeParse(valid)
    expect(result.success).toBe(true)
    expect(result.data.difficulty).toBe('beginner')
    expect(result.data.fileType).toBe('pdf')
    expect(result.data.tags).toEqual([])
  })

  it('rejects a missing title', () => {
    const { title, ...rest } = valid
    expect(noteCreateSchema.safeParse(rest).success).toBe(false)
  })

  it('rejects an empty-string title', () => {
    expect(noteCreateSchema.safeParse({ ...valid, title: '  ' }).success).toBe(false)
  })

  it('rejects a subject outside the allowed enum', () => {
    expect(noteCreateSchema.safeParse({ ...valid, subject: 'Astrology' }).success).toBe(false)
  })

  it('rejects a difficulty outside the allowed enum', () => {
    expect(noteCreateSchema.safeParse({ ...valid, difficulty: 'expert' }).success).toBe(false)
  })

  it('noteUpdateSchema accepts a single-field partial update', () => {
    const result = noteUpdateSchema.safeParse({ title: 'New Title' })
    expect(result.success).toBe(true)
  })

  it('noteUpdateSchema accepts an empty object (no-op update)', () => {
    expect(noteUpdateSchema.safeParse({}).success).toBe(true)
  })
})

describe('tipCreateSchema', () => {
  const base = { title: 'Docker Basics', category: 'Docker', summary: 'Get started with Docker.' }

  it('accepts a tip with contentMarkdown and no fileUrl', () => {
    expect(tipCreateSchema.safeParse({ ...base, contentMarkdown: '## Hello' }).success).toBe(true)
  })

  it('accepts a tip with fileUrl and no contentMarkdown', () => {
    expect(tipCreateSchema.safeParse({ ...base, fileUrl: 'https://example.com/tip.pdf' }).success).toBe(true)
  })

  it('defaults fileType to pdf when not specified, matching Note behavior', () => {
    const result = tipCreateSchema.safeParse({ ...base, fileUrl: 'https://example.com/tip.docx' })
    expect(result.success).toBe(true)
    expect(result.data.fileType).toBe('pdf')
  })

  it('accepts an explicit docx fileType', () => {
    const result = tipCreateSchema.safeParse({ ...base, fileUrl: 'https://example.com/tip.docx', fileType: 'docx' })
    expect(result.success).toBe(true)
    expect(result.data.fileType).toBe('docx')
  })

  it('rejects a tip with neither contentMarkdown nor fileUrl', () => {
    const result = tipCreateSchema.safeParse(base)
    expect(result.success).toBe(false)
  })

  it('rejects a category outside the allowed enum', () => {
    expect(tipCreateSchema.safeParse({ ...base, category: 'Astrology', contentMarkdown: 'x' }).success).toBe(false)
  })

  it('tipUpdateSchema allows updating an unrelated field without triggering the markdown/file rule', () => {
    expect(tipUpdateSchema.safeParse({ title: 'New Title' }).success).toBe(true)
  })

  it('tipUpdateSchema rejects clearing both contentMarkdown and fileUrl to empty in the same request', () => {
    const result = tipUpdateSchema.safeParse({ contentMarkdown: '', fileUrl: '' })
    expect(result.success).toBe(false)
  })
})

describe('projectCreateSchema', () => {
  const valid = {
    title: 'Resource Hub',
    description: 'A personal dev knowledge base.',
    githubUrl: 'https://github.com/me/resource-hub',
  }

  it('accepts a minimal valid project and fills in defaults', () => {
    const result = projectCreateSchema.safeParse(valid)
    expect(result.success).toBe(true)
    expect(result.data.status).toBe('active')
    expect(result.data.featured).toBe(false)
    expect(result.data.liveUrl).toBeNull()
  })

  it('rejects a missing githubUrl', () => {
    const { githubUrl, ...rest } = valid
    expect(projectCreateSchema.safeParse(rest).success).toBe(false)
  })

  it('rejects a status outside the allowed enum', () => {
    expect(projectCreateSchema.safeParse({ ...valid, status: 'on-hold' }).success).toBe(false)
  })

  it('accepts an explicit null liveUrl', () => {
    expect(projectCreateSchema.safeParse({ ...valid, liveUrl: null }).success).toBe(true)
  })
})

describe('loginSchema', () => {
  it('accepts a well-formed email and non-empty password', () => {
    expect(loginSchema.safeParse({ email: 'admin@example.com', password: 'hunter2' }).success).toBe(true)
  })

  it('rejects a malformed email', () => {
    expect(loginSchema.safeParse({ email: 'not-an-email', password: 'hunter2' }).success).toBe(false)
  })

  it('rejects an empty password', () => {
    expect(loginSchema.safeParse({ email: 'admin@example.com', password: '' }).success).toBe(false)
  })

  it('rejects a missing password field entirely', () => {
    expect(loginSchema.safeParse({ email: 'admin@example.com' }).success).toBe(false)
  })
})

describe('askSchema', () => {
  it('accepts a normal question', () => {
    expect(askSchema.safeParse({ question: 'How do I set up Docker?' }).success).toBe(true)
  })

  it('rejects an empty question', () => {
    expect(askSchema.safeParse({ question: '' }).success).toBe(false)
  })

  it('rejects a whitespace-only question', () => {
    expect(askSchema.safeParse({ question: '   ' }).success).toBe(false)
  })

  it('rejects a question over 500 characters', () => {
    expect(askSchema.safeParse({ question: 'x'.repeat(501) }).success).toBe(false)
  })

  it('accepts a question at exactly 500 characters', () => {
    expect(askSchema.safeParse({ question: 'x'.repeat(500) }).success).toBe(true)
  })
})
