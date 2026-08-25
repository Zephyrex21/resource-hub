import { describe, it, expect } from 'vitest'
import { buildQuery } from '../api'

describe('buildQuery', () => {
  it('returns an empty string when no params are given', () => {
    expect(buildQuery()).toBe('')
  })

  it('returns an empty string when all params are undefined', () => {
    expect(buildQuery({ subject: undefined })).toBe('')
  })

  it('returns an empty string when a param is an empty string', () => {
    expect(buildQuery({ subject: '' })).toBe('')
  })

  it('builds a query string from a single defined param', () => {
    expect(buildQuery({ subject: 'DSA' })).toBe('?subject=DSA')
  })

  it('joins multiple defined params with &, dropping undefined/empty ones', () => {
    const result = buildQuery({ subject: 'DSA', tag: undefined, search: 'binary' })
    expect(result).toBe('?subject=DSA&search=binary')
  })

  it('URL-encodes special characters in values', () => {
    expect(buildQuery({ search: 'a b&c' })).toBe('?search=a+b%26c')
  })
})
