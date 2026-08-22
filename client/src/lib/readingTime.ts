const WORDS_PER_MINUTE = 200

// Rough reading-time estimate from raw markdown — strips code fences (people
// don't "read" code at prose speed) before counting words, then rounds up
// so short docs still show "1 min read" rather than "0 min read".
export function estimateReadingTime(markdown: string): number {
  const withoutCode = markdown.replace(/```[\s\S]*?```/g, '')
  const wordCount = withoutCode.trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE))
}
