import { describe, it, expect } from 'vitest'
import { estimateReadingTime } from '../readingTime'

describe('estimateReadingTime', () => {
  it('returns 1 minute for very short content (rounds up, never 0)', () => {
    expect(estimateReadingTime('A short tip.')).toBe(1)
  })

  it('estimates roughly words / 200 per minute, rounded up', () => {
    const words = Array(450).fill('word').join(' ') // 450 words -> 2.25 -> rounds up to 3
    expect(estimateReadingTime(words)).toBe(3)
  })

  it('excludes fenced code blocks from the word count', () => {
    const withCode = 'Intro text.\n```js\n' + 'code '.repeat(300) + '\n```\nOutro text.'
    const withoutCode = 'Intro text.\nOutro text.'
    expect(estimateReadingTime(withCode)).toBe(estimateReadingTime(withoutCode))
  })

  it('handles empty content without throwing', () => {
    expect(estimateReadingTime('')).toBe(1)
  })
})
