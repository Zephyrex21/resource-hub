import { describe, it, expect, vi } from 'vitest'
import { getSourceText } from '../getSourceText.js'

function mockModel() {
  return { updateOne: vi.fn().mockResolvedValue({}) }
}

describe('getSourceText', () => {
  it('prefers contentMarkdown when present, without calling the extractor', async () => {
    const extractFn = vi.fn()
    const Model = mockModel()
    const doc = { _id: 'n1', contentMarkdown: '## Real content', fileUrl: 'https://x/a.pdf' }

    const text = await getSourceText(doc, Model, extractFn)

    expect(text).toBe('## Real content')
    expect(extractFn).not.toHaveBeenCalled()
    expect(Model.updateOne).not.toHaveBeenCalled()
  })

  it('uses previously-cached extractedText without re-extracting', async () => {
    const extractFn = vi.fn()
    const Model = mockModel()
    const doc = { _id: 'n1', extractedText: 'cached text', fileUrl: 'https://x/a.pdf' }

    const text = await getSourceText(doc, Model, extractFn)

    expect(text).toBe('cached text')
    expect(extractFn).not.toHaveBeenCalled()
  })

  it('extracts and caches when neither markdown nor cached text exists', async () => {
    const extractFn = vi.fn().mockResolvedValue('freshly extracted text')
    const Model = mockModel()
    const doc = { _id: 'n1', slug: 'dbms-normalization', fileUrl: 'https://x/a.pdf', fileType: 'pdf' }

    const text = await getSourceText(doc, Model, extractFn)

    expect(text).toBe('freshly extracted text')
    expect(extractFn).toHaveBeenCalledWith('https://x/a.pdf', 'pdf')
    expect(Model.updateOne).toHaveBeenCalledWith({ _id: 'n1' }, { extractedText: 'freshly extracted text' })
  })

  it('returns empty string when there is no fileUrl at all', async () => {
    const extractFn = vi.fn()
    const Model = mockModel()
    const text = await getSourceText({ _id: 'n1' }, Model, extractFn)
    expect(text).toBe('')
    expect(extractFn).not.toHaveBeenCalled()
  })

  it('fails soft (returns empty string, does not throw) when extraction fails', async () => {
    const extractFn = vi.fn().mockRejectedValue(new Error('fetch failed'))
    const Model = mockModel()
    const doc = { _id: 'n1', slug: 'broken-note', fileUrl: 'https://x/missing.pdf' }

    const text = await getSourceText(doc, Model, extractFn)

    expect(text).toBe('')
    expect(Model.updateOne).not.toHaveBeenCalled()
  })
})
