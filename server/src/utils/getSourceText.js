// Returns the best available text to reason about a note/tip with.
// Priority: real markdown content (Tips) > previously-cached extracted
// text > freshly extract-and-cache from the file (Notes, and any Tip
// that's file-based rather than markdown-based) > empty string if there's
// nothing to work with at all.
//
// `extractFn` is injected as `(fileUrl, fileType) => Promise<string>`
// rather than importing extractTextFromFile directly, so this stays
// unit-testable with a fake extractor — no real network/parsing needed.
export async function getSourceText(doc, Model, extractFn) {
  if (doc.contentMarkdown) return doc.contentMarkdown
  if (doc.extractedText) return doc.extractedText
  if (!doc.fileUrl) return ''

  try {
    const text = await extractFn(doc.fileUrl, doc.fileType)
    // Cache it so every future quiz/explain request for this item skips
    // the fetch+parse round-trip entirely.
    await Model.updateOne({ _id: doc._id }, { extractedText: text })
    return text
  } catch (err) {
    // Fail soft — a broken/unreachable file shouldn't crash the AI
    // feature, it should just degrade to "not enough content yet".
    console.error(`[extract] failed for ${doc.slug ?? doc._id}:`, err.message)
    return ''
  }
}
