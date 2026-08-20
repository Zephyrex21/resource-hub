import { Link } from 'react-router-dom'
import { useBookmarks, type BookmarkType } from '../context/BookmarksContext'
import { usePageTitle } from '../hooks/usePageTitle'
import { GlassCard } from '../components/ui/Card'
import { EmptyState } from '../components/ui/StateViews'

const typeConfig: Record<BookmarkType, { label: string; path: string; accent: string }> = {
  note: { label: 'Notes', path: '/notes', accent: 'text-accent-notes' },
  tip: { label: 'Tips & Tricks', path: '/tips', accent: 'text-accent-tips' },
  project: { label: 'Projects', path: '/projects', accent: 'text-accent-projects' },
}

export default function Bookmarks() {
  usePageTitle('Saved')
  const { bookmarks, removeBookmark } = useBookmarks()

  if (bookmarks.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="font-display text-3xl font-bold">Saved</h1>
        <EmptyState message="Nothing saved yet — look for the Save button on any note, tip, or project." />
      </div>
    )
  }

  const grouped = (Object.keys(typeConfig) as BookmarkType[])
    .map((type) => ({
      type,
      items: bookmarks.filter((b) => b.type === type).sort((a, b) => b.savedAt - a.savedAt),
    }))
    .filter((group) => group.items.length > 0)

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-3xl font-bold">Saved</h1>
        <p className="mt-1 text-sm text-muted">
          Stored in this browser only — clearing site data will clear these too.
        </p>
      </div>

      {grouped.map((group) => (
        <div key={group.type} className="flex flex-col gap-3">
          <h2 className={`font-display text-lg font-semibold ${typeConfig[group.type].accent}`}>
            {typeConfig[group.type].label}
          </h2>
          <div className="flex flex-col gap-2">
            {group.items.map((item) => (
              <GlassCard key={`${item.type}-${item.slug}`} className="flex items-center justify-between gap-3 px-4 py-3">
                <Link to={`${typeConfig[item.type].path}/${item.slug}`} className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{item.title}</p>
                  <p className="truncate text-xs text-muted">{item.subtitle}</p>
                </Link>
                <button
                  onClick={() => removeBookmark(item.type, item.slug)}
                  aria-label="Remove"
                  className="clay-btn shrink-0 rounded-full px-3 py-1 text-xs text-muted"
                >
                  Remove
                </button>
              </GlassCard>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
