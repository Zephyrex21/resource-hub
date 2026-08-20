import { useEffect, useRef } from 'react'
import { incrementView } from '../lib/api'

// Fires one view-increment call per mount, once the slug is known. Guards
// against double-firing in React StrictMode's intentional double-invoke
// (dev only) and against re-firing if the slug prop identity changes
// without the value actually changing.
export function useViewTracking(resource: 'notes' | 'tips' | 'projects', slug: string | undefined) {
  const firedFor = useRef<string | null>(null)

  useEffect(() => {
    if (!slug || firedFor.current === slug) return
    firedFor.current = slug
    incrementView(resource, slug).catch(() => undefined) // fire-and-forget
  }, [resource, slug])
}
