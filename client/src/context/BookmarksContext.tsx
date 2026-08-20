import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

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

export function BookmarksProvider({ children }: { children: ReactNode }) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(loadBookmarks)

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks))
  }, [bookmarks])

  function isBookmarked(type: BookmarkType, slug: string) {
    return bookmarks.some((b) => b.type === type && b.slug === slug)
  }

  function toggleBookmark(bookmark: Omit<Bookmark, 'savedAt'>) {
    setBookmarks((prev) => {
      const exists = prev.some((b) => b.type === bookmark.type && b.slug === bookmark.slug)
      if (exists) {
        return prev.filter((b) => !(b.type === bookmark.type && b.slug === bookmark.slug))
      }
      return [...prev, { ...bookmark, savedAt: Date.now() }]
    })
  }

  function removeBookmark(type: BookmarkType, slug: string) {
    setBookmarks((prev) => prev.filter((b) => !(b.type === type && b.slug === slug)))
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
