const MAX_EXTRACTED_CHARS = 20000

// Bounds worst-case document size (a huge PDF shouldn't balloon the Mongo
// doc or blow up prompt token cost) — 20k chars is generous headroom for
// genuinely useful quiz/explain material while keeping a hard ceiling.
export function truncateExtracted(text) {
  const trimmed = text.trim()
  return trimmed.length > MAX_EXTRACTED_CHARS ? trimmed.slice(0, MAX_EXTRACTED_CHARS) : trimmed
}

// `pdfParse`, `mammothExtract`, and `fetchImpl` are injectable rather than
// imported directly, so this is unit-testable with fake implementations —
// no real network call or real PDF/DOCX parsing needed in tests. Same
// dependency-injection approach used throughout this codebase (see
// controllers/crudFactory.js, controllers/accountController.js) rather
// than mocking third-party module internals.
export async function extractTextFromFile(fileUrl, fileType, { pdfParse, mammothExtract, fetchImpl = fetch } = {}) {
  const response = await fetchImpl(fileUrl)
  if (!response.ok) {
    throw new Error(`Failed to fetch file (status ${response.status})`)
  }

  const buffer = Buffer.from(await response.arrayBuffer())

  if (fileType === 'docx') {
    const { value } = await mammothExtract({ buffer })
    return truncateExtracted(value)
  }

  // Default to PDF for any other/unset fileType — this app only ever
  // stores PDF or DOCX study material.
  const { text } = await pdfParse(buffer)
  return truncateExtracted(text)
}
