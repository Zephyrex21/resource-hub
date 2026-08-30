import { describe, it, expect, vi } from 'vitest'
import { extractTextFromFile, truncateExtracted } from '../extractText.js'

function fakeFetch(ok, body) {
  return vi.fn().mockResolvedValue({
    ok,
    status: ok ? 200 : 404,
    arrayBuffer: async () => new TextEncoder().encode(body ?? '').buffer,
  })
}

describe('truncateExtracted', () => {
  it('trims surrounding whitespace', () => {
    expect(truncateExtracted('  hello world  ')).toBe('hello world')
  })

  it('leaves short text untouched', () => {
    expect(truncateExtracted('short')).toBe('short')
  })

  it('caps very long text at 20000 characters', () => {
    const long = 'a'.repeat(25000)
    const result = truncateExtracted(long)
    expect(result.length).toBe(20000)
  })
})

describe('extractTextFromFile', () => {
  it('extracts text from a PDF via the injected pdfParse', async () => {
    const pdfParse = vi.fn().mockResolvedValue({ text: 'Normalization reduces data redundancy.' })
    const result = await extractTextFromFile('https://files.example.com/a.pdf', 'pdf', {
      pdfParse,
      fetchImpl: fakeFetch(true, 'fake-pdf-bytes'),
    })
    expect(pdfParse).toHaveBeenCalled()
    expect(result).toBe('Normalization reduces data redundancy.')
  })

  it('extracts text from a DOCX via the injected mammothExtract', async () => {
    const mammothExtract = vi.fn().mockResolvedValue({ value: 'Docker Compose runs multi-container apps.' })
    const result = await extractTextFromFile('https://files.example.com/a.docx', 'docx', {
      mammothExtract,
      fetchImpl: fakeFetch(true, 'fake-docx-bytes'),
    })
    expect(mammothExtract).toHaveBeenCalled()
    expect(result).toBe('Docker Compose runs multi-container apps.')
  })

  it('defaults to PDF parsing for an unset/unknown fileType', async () => {
    const pdfParse = vi.fn().mockResolvedValue({ text: 'fallback content' })
    const result = await extractTextFromFile('https://files.example.com/a', undefined, {
      pdfParse,
      fetchImpl: fakeFetch(true, 'bytes'),
    })
    expect(pdfParse).toHaveBeenCalled()
    expect(result).toBe('fallback content')
  })

  it('throws a clear error when the file fetch fails', async () => {
    await expect(
      extractTextFromFile('https://files.example.com/missing.pdf', 'pdf', {
        pdfParse: vi.fn(),
        fetchImpl: fakeFetch(false),
      }),
    ).rejects.toThrow(/Failed to fetch file/)
  })

  it('truncates extracted text over the size cap', async () => {
    const pdfParse = vi.fn().mockResolvedValue({ text: 'x'.repeat(30000) })
    const result = await extractTextFromFile('https://files.example.com/big.pdf', 'pdf', {
      pdfParse,
      fetchImpl: fakeFetch(true, 'bytes'),
    })
    expect(result.length).toBe(20000)
  })
})
