import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DifficultyBadge } from '../DifficultyBadge'

describe('DifficultyBadge', () => {
  it('renders "Easy" for beginner difficulty', () => {
    render(<DifficultyBadge difficulty="beginner" />)
    expect(screen.getByText('Easy')).toBeInTheDocument()
  })

  it('renders "Medium" for intermediate difficulty', () => {
    render(<DifficultyBadge difficulty="intermediate" />)
    expect(screen.getByText('Medium')).toBeInTheDocument()
  })

  it('renders "Hard" for advanced difficulty', () => {
    render(<DifficultyBadge difficulty="advanced" />)
    expect(screen.getByText('Hard')).toBeInTheDocument()
  })

  it('falls back to the raw value for an unrecognized difficulty', () => {
    render(<DifficultyBadge difficulty="expert" />)
    expect(screen.getByText('expert')).toBeInTheDocument()
  })

  it('applies the easy color class for beginner', () => {
    render(<DifficultyBadge difficulty="beginner" />)
    expect(screen.getByText('Easy').className).toContain('text-easy')
  })
})
