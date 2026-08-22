import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

export type ProgressType = 'note' | 'tip'

interface ProgressContextValue {
  completed: Set<string>
  isCompleted: (type: ProgressType, slug: string) => boolean
  toggleCompleted: (type: ProgressType, slug: string) => void
  countCompleted: (type: ProgressType, slugs: string[]) => number
}

const STORAGE_KEY = 'resource-hub-progress'

function key(type: ProgressType, slug: string) {
  return `${type}:${slug}`
}

const ProgressContext = createContext<ProgressContextValue | undefined>(undefined)

function loadProgress(): Set<string> {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return new Set()
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? new Set(parsed) : new Set()
  } catch {
    return new Set()
  }
}

// Per-browser "mark as done" tracking for Notes/Tips — the checkbox +
// completion-% pattern that's core to the takeuforward look. Deliberately
// localStorage-only rather than account-backed: same trade-off the existing
// Bookmarks feature already makes (progress doesn't follow you across
// devices, but there's no auth/backend to build or maintain for it).
export function ProgressProvider({ children }: { children: ReactNode }) {
  const [completed, setCompleted] = useState<Set<string>>(loadProgress)

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(completed)))
  }, [completed])

  function isCompleted(type: ProgressType, slug: string) {
    return completed.has(key(type, slug))
  }

  function toggleCompleted(type: ProgressType, slug: string) {
    setCompleted((prev) => {
      const next = new Set(prev)
      const k = key(type, slug)
      if (next.has(k)) next.delete(k)
      else next.add(k)
      return next
    })
  }

  function countCompleted(type: ProgressType, slugs: string[]) {
    return slugs.filter((slug) => completed.has(key(type, slug))).length
  }

  return (
    <ProgressContext.Provider value={{ completed, isCompleted, toggleCompleted, countCompleted }}>
      {children}
    </ProgressContext.Provider>
  )
}

export function useProgress() {
  const ctx = useContext(ProgressContext)
  if (!ctx) throw new Error('useProgress must be used within a ProgressProvider')
  return ctx
}
