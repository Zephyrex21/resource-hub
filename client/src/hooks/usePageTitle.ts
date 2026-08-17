import { useEffect } from 'react'

// Sets document.title for the active page, restoring the default on unmount
// so back/forward navigation doesn't leave a stale title behind.
export function usePageTitle(title: string) {
  useEffect(() => {
    const previous = document.title
    document.title = title ? `${title} · Resource Hub` : 'Resource Hub'
    return () => {
      document.title = previous
    }
  }, [title])
}
