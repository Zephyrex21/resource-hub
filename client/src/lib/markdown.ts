export interface Heading {
  level: 2 | 3
  text: string
  id: string
}

function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Pulls ## and ### headings straight from the markdown source (rather than
// the rendered DOM) so a table of contents can be built before render, and
// so the ids assigned here can be matched to the actual rendered headings
// via document order (see TipDetail's heading override components).
export function extractHeadings(markdown: string): Heading[] {
  const headings: Heading[] = []
  for (const line of markdown.split('\n')) {
    const match = line.match(/^(#{2,3})\s+(.+)$/)
    if (match) {
      const level = match[1].length as 2 | 3
      const text = match[2].trim()
      headings.push({ level, text, id: slugifyHeading(text) })
    }
  }
  return headings
}
