import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import * as api from '../lib/api'
import { useAccount } from './AccountContext'

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

// Per-browser "mark as done" tracking for Notes/Tips, now with two modes:
//  - Signed out: localStorage only — identical to the original behavior,
//    so anonymous visitors see zero change.
//  - Signed in: synced to the account via the server. On the transition to
//    signed-in, anything completed locally-only (from browsing before
//    creating an account) gets pushed up once rather than discarded, then
//    local state becomes the union of local + server. Every toggle after
//    that fires the server call in the background.
//
// The public hook shape (isCompleted/toggleCompleted/countCompleted) is
// unchanged either way, so ProgressCheckbox/ProgressDashboard/
// SimpleProgressSummary needed zero changes to pick this up.
//
// Known simplification: a toggle that races with the one-time sign-in
// merge could theoretically disagree with the server until the next merge
// or reload. Not worth the added complexity to close for a resource hub —
// worth knowing about if this pattern gets reused somewhere higher-stakes.
export function ProgressProvider({ children }: { children: ReactNode }) {
  const { status } = useAccount()
  const [completed, setCompleted] = useState<Set<string>>(loadProgress)
  const hasSyncedRef = useRef(false)

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(completed)))
  }, [completed])

  useEffect(() => {
    if (status !== 'signed-in' || hasSyncedRef.current) return
    hasSyncedRef.current = true

    api
      .getProgress()
      .then(async (serverItems) => {
        const serverKeys = new Set(serverItems.map((i) => key(i.contentType, i.slug)))
        const localOnly = Array.from(completed).filter((k) => !serverKeys.has(k))

        await Promise.all(
          localOnly.map((k) => {
            const [type, slug] = k.split(':') as [ProgressType, string]
            return api.toggleProgress(type, slug).catch(() => undefined)
          }),
        )

        setCompleted((prev) => new Set([...prev, ...serverKeys]))
      })
      .catch(() => undefined)
    // Deliberately runs only off `status` — `completed` is read once at
    // merge time via the ref guard, not on every change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  useEffect(() => {
    if (status === 'signed-out') hasSyncedRef.current = false
  }, [status])

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

    if (status === 'signed-in') {
      api.toggleProgress(type, slug).catch(() => undefined)
    }
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
