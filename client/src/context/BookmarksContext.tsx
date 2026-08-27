import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import * as api from '../lib/api'
import { useAccount } from './AccountContext'

export type BookmarkType = 'note' | 'tip' | 'project'

export interface Bookmark {
  type: BookmarkType
  slug: string
  title: string
  subtitle: string
  savedAt: number
}

interface BookmarksContextValue {
  bookmarks: Bookmark[]
  isBookmarked: (type: BookmarkType, slug: string) => boolean
  toggleBookmark: (bookmark: Omit<Bookmark, 'savedAt'>) => void
  removeBookmark: (type: BookmarkType, slug: string) => void
}

const STORAGE_KEY = 'resource-hub-bookmarks'

const BookmarksContext = createContext<BookmarksContextValue | undefined>(undefined)

function loadBookmarks(): Bookmark[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function sameItem(a: { type: BookmarkType; slug: string }, b: { type: BookmarkType; slug: string }) {
  return a.type === b.type && a.slug === b.slug
}

// Same signed-out/signed-in split as ProgressContext (see the comment
// there for the full rationale) — localStorage-only when signed out,
// account-synced when signed in, with a one-time push-local-then-merge on
// the transition to signed-in. Public hook shape (isBookmarked/
// toggleBookmark/removeBookmark/bookmarks) is unchanged, so BookmarkButton
// and the Bookmarks page needed zero changes.
export function BookmarksProvider({ children }: { children: ReactNode }) {
  const { status } = useAccount()
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(loadBookmarks)
  const hasSyncedRef = useRef(false)

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks))
  }, [bookmarks])

  useEffect(() => {
    if (status !== 'signed-in' || hasSyncedRef.current) return
    hasSyncedRef.current = true

    api
      .getSavedItems()
      .then(async (serverItems) => {
        const serverBookmarks: Bookmark[] = serverItems.map((i) => ({
          type: i.contentType,
          slug: i.slug,
          title: i.title,
          subtitle: i.subtitle,
          savedAt: new Date(i.createdAt).getTime(),
        }))

        const localOnly = bookmarks.filter((b) => !serverBookmarks.some((s) => sameItem(s, b)))

        await Promise.all(
          localOnly.map((b) => api.toggleSavedItem(b.type, b.slug, b.title, b.subtitle).catch(() => undefined)),
        )

        setBookmarks((prev) => {
          const merged = [...prev]
          for (const s of serverBookmarks) {
            if (!merged.some((b) => sameItem(b, s))) merged.push(s)
          }
          return merged
        })
      })
      .catch(() => undefined)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  useEffect(() => {
    if (status === 'signed-out') hasSyncedRef.current = false
  }, [status])

  function isBookmarked(type: BookmarkType, slug: string) {
    return bookmarks.some((b) => b.type === type && b.slug === slug)
  }

  function toggleBookmark(bookmark: Omit<Bookmark, 'savedAt'>) {
    setBookmarks((prev) => {
      const exists = prev.some((b) => sameItem(b, bookmark))
      if (exists) return prev.filter((b) => !sameItem(b, bookmark))
      return [...prev, { ...bookmark, savedAt: Date.now() }]
    })

    if (status === 'signed-in') {
      api.toggleSavedItem(bookmark.type, bookmark.slug, bookmark.title, bookmark.subtitle).catch(() => undefined)
    }
  }

  function removeBookmark(type: BookmarkType, slug: string) {
    const existing = bookmarks.find((b) => b.type === type && b.slug === slug)
    setBookmarks((prev) => prev.filter((b) => !(b.type === type && b.slug === slug)))

    if (status === 'signed-in' && existing) {
      api.toggleSavedItem(type, slug, existing.title, existing.subtitle).catch(() => undefined)
    }
  }

  return (
    <BookmarksContext.Provider value={{ bookmarks, isBookmarked, toggleBookmark, removeBookmark }}>
      {children}
    </BookmarksContext.Provider>
  )
}

export function useBookmarks() {
  const ctx = useContext(BookmarksContext)
  if (!ctx) throw new Error('useBookmarks must be used within a BookmarksProvider')
  return ctx
}
