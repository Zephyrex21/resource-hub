import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProgressCheckbox } from '../ProgressCheckbox'
import { ProgressProvider } from '../../context/ProgressContext'

const STORAGE_KEY = 'resource-hub-progress'

function renderCheckbox() {
  return render(
    <ProgressProvider>
      <ProgressCheckbox type="note" slug="binary-search" />
    </ProgressProvider>,
  )
}

describe('ProgressCheckbox', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('starts unchecked (aria-pressed=false) when nothing is stored', () => {
    renderCheckbox()
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false')
  })

  it('toggles to checked on click and persists it to localStorage', async () => {
    const user = userEvent.setup()
    renderCheckbox()

    await user.click(screen.getByRole('button'))

    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true')
    const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '[]')
    expect(stored).toContain('note:binary-search')
  })

  it('toggles back off on a second click', async () => {
    const user = userEvent.setup()
    renderCheckbox()
    const button = screen.getByRole('button')

    await user.click(button)
    await user.click(button)

    expect(button).toHaveAttribute('aria-pressed', 'false')
    const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '[]')
    expect(stored).not.toContain('note:binary-search')
  })

  it('starts checked when localStorage already has this item marked done', () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(['note:binary-search']))
    renderCheckbox()
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true')
  })

  it('does not propagate the click event (so a parent <Link> row is not also navigated)', async () => {
    const user = userEvent.setup()
    let parentClicked = false

    render(
      <ProgressProvider>
        <div onClick={() => (parentClicked = true)}>
          <ProgressCheckbox type="note" slug="binary-search" />
        </div>
      </ProgressProvider>,
    )

    await user.click(screen.getByRole('button'))
    expect(parentClicked).toBe(false)
  })
})
