import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// RTL normally auto-registers a DOM cleanup via the test framework's global
// afterEach — but this project intentionally runs with `globals: false`
// (no implicit global test/expect/etc.), so that auto-registration never
// happens. Without this, every test in a file renders into the same
// document without ever unmounting the previous one, and queries like
// getByText start matching multiple leftover elements.
afterEach(() => {
  cleanup()
})
