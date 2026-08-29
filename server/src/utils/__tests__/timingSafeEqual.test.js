import { describe, it, expect } from 'vitest'
import { timingSafeStringEqual } from '../timingSafeEqual.js'

describe('timingSafeStringEqual', () => {
  it('returns true for identical strings', () => {
    expect(timingSafeStringEqual('correct-password', 'correct-password')).toBe(true)
  })

  it('returns false for different strings of the same length', () => {
    expect(timingSafeStringEqual('correct-password', 'wrong-password!!')).toBe(false)
  })

  it('returns false for different-length strings without throwing', () => {
    expect(() => timingSafeStringEqual('short', 'a-much-longer-string-here')).not.toThrow()
    expect(timingSafeStringEqual('short', 'a-much-longer-string-here')).toBe(false)
  })

  it('returns false when one side is empty', () => {
    expect(timingSafeStringEqual('', 'anything')).toBe(false)
  })

  it('handles special characters (e.g. "$") safely, unlike shell-based comparisons', () => {
    expect(timingSafeStringEqual('p$a$ss10word', 'p$a$ss10word')).toBe(true)
    expect(timingSafeStringEqual('p$a$ss10word', 'different')).toBe(false)
  })
})
