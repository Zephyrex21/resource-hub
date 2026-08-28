import { describe, it, expect } from 'vitest'
import { getEarnedBadges, BADGES } from '../badges'
import type { LearningStats } from '../badges'

function stats(overrides: Partial<LearningStats> = {}): LearningStats {
  return {
    totalCompleted: 0,
    subjectCompletion: [],
    longestStreak: 0,
    ...overrides,
  }
}

describe('getEarnedBadges', () => {
  it('earns nothing with zero activity', () => {
    expect(getEarnedBadges(stats())).toEqual([])
  })

  it('earns "First Step" at exactly 1 completion', () => {
    const earned = getEarnedBadges(stats({ totalCompleted: 1 }))
    expect(earned.map((b) => b.id)).toContain('first-step')
    expect(earned.map((b) => b.id)).not.toContain('getting-started')
  })

  it('earns cumulative completion badges as the count rises', () => {
    const ids = getEarnedBadges(stats({ totalCompleted: 50 })).map((b) => b.id)
    expect(ids).toEqual(expect.arrayContaining(['first-step', 'getting-started', 'half-century']))
    expect(ids).not.toContain('century-club')
  })

  it('earns "Subject Master" only when a subject with notes is fully complete', () => {
    const notMastered = stats({ subjectCompletion: [{ subject: 'DBMS', done: 5, total: 10 }] })
    expect(getEarnedBadges(notMastered).map((b) => b.id)).not.toContain('subject-master')

    const mastered = stats({ subjectCompletion: [{ subject: 'DBMS', done: 10, total: 10 }] })
    expect(getEarnedBadges(mastered).map((b) => b.id)).toContain('subject-master')
  })

  it('does not award "Subject Master" for a subject with zero notes (0/0)', () => {
    const empty = stats({ subjectCompletion: [{ subject: 'Empty', done: 0, total: 0 }] })
    expect(getEarnedBadges(empty).map((b) => b.id)).not.toContain('subject-master')
  })

  it('earns streak badges based on the longest streak, not the current one', () => {
    const ids = getEarnedBadges(stats({ longestStreak: 7 })).map((b) => b.id)
    expect(ids).toEqual(expect.arrayContaining(['streak-3', 'streak-7']))
    expect(ids).not.toContain('streak-30')
  })

  it('every badge in BADGES has a unique id', () => {
    const ids = BADGES.map((b) => b.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})
