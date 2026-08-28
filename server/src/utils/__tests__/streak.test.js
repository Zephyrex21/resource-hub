import { describe, it, expect } from 'vitest'
import { computeStreaks } from '../streak.js'

describe('computeStreaks', () => {
  it('returns zero/zero for no activity at all', () => {
    expect(computeStreaks([])).toEqual({ current: 0, longest: 0 })
  })

  it('counts a single day as a streak of 1 if it was today', () => {
    expect(computeStreaks(['2026-08-27'], '2026-08-27')).toEqual({ current: 1, longest: 1 })
  })

  it('still counts yesterday as current (not yet broken)', () => {
    expect(computeStreaks(['2026-08-26'], '2026-08-27')).toEqual({ current: 1, longest: 1 })
  })

  it('breaks the current streak if the gap from today is 2+ days, but preserves longest', () => {
    expect(computeStreaks(['2026-08-20', '2026-08-21', '2026-08-22'], '2026-08-27')).toEqual({
      current: 0,
      longest: 3,
    })
  })

  it('counts a consecutive run correctly', () => {
    const dates = ['2026-08-24', '2026-08-25', '2026-08-26', '2026-08-27']
    expect(computeStreaks(dates, '2026-08-27')).toEqual({ current: 4, longest: 4 })
  })

  it('current streak only reflects the most recent unbroken run, not the whole history', () => {
    // Active 08-10/08-11 (a 2-day run, now long broken), gap, then active
    // 08-25/08-26/08-27 (today) — a fresh 3-day run.
    const dates = ['2026-08-10', '2026-08-11', '2026-08-25', '2026-08-26', '2026-08-27']
    expect(computeStreaks(dates, '2026-08-27')).toEqual({ current: 3, longest: 3 })
  })

  it('longest streak can exceed the current streak', () => {
    // A 5-day historical run, then broken, then active again today only.
    const dates = ['2026-08-01', '2026-08-02', '2026-08-03', '2026-08-04', '2026-08-05', '2026-08-27']
    expect(computeStreaks(dates, '2026-08-27')).toEqual({ current: 1, longest: 5 })
  })

  it('deduplicates repeated dates without inflating the streak', () => {
    const dates = ['2026-08-27', '2026-08-27', '2026-08-26', '2026-08-26']
    expect(computeStreaks(dates, '2026-08-27')).toEqual({ current: 2, longest: 2 })
  })

  it('is order-independent — unsorted input gives the same result as sorted', () => {
    const sorted = ['2026-08-24', '2026-08-25', '2026-08-26', '2026-08-27']
    const shuffled = ['2026-08-26', '2026-08-24', '2026-08-27', '2026-08-25']
    expect(computeStreaks(shuffled, '2026-08-27')).toEqual(computeStreaks(sorted, '2026-08-27'))
  })
})
