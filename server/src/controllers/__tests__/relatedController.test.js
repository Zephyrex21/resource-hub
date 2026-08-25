import { describe, it, expect } from 'vitest'
import { scoreOverlap } from '../relatedController.js'

describe('scoreOverlap', () => {
  it('scores zero when there is no tag overlap and no group match', () => {
    expect(scoreOverlap(['react', 'redux'], 'Web Dev', ['docker', 'linux'], 'DevOps')).toBe(0)
  })

  it('scores 2 points per overlapping tag', () => {
    const score = scoreOverlap(['react', 'redux', 'hooks'], 'Web Dev', ['react', 'hooks'], 'AI')
    expect(score).toBe(4) // 2 overlapping tags * 2
  })

  it('adds a 1-point bonus when the group (subject/category/status) matches', () => {
    const score = scoreOverlap(['react'], 'Web Dev', ['react'], 'Web Dev')
    expect(score).toBe(3) // 1 overlapping tag * 2, + 1 group bonus
  })

  it('adds the group bonus even with zero tag overlap', () => {
    const score = scoreOverlap(['react'], 'Web Dev', ['docker'], 'Web Dev')
    expect(score).toBe(1)
  })

  it('is case-insensitive when comparing tags', () => {
    const score = scoreOverlap(['React'], 'Web Dev', ['react'], 'AI')
    expect(score).toBe(2)
  })

  it('handles missing/undefined tags and group gracefully', () => {
    expect(scoreOverlap(undefined, undefined, undefined, undefined)).toBe(0)
    expect(scoreOverlap([], null, [], null)).toBe(0)
  })

  it('does not double-count a duplicate candidate tag beyond how many times it appears', () => {
    const score = scoreOverlap(['react'], 'Web Dev', ['react', 'react'], 'AI')
    expect(score).toBe(4) // both occurrences match the source set independently
  })
})
