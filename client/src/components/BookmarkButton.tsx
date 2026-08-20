import { useBookmarks, type BookmarkType } from '../context/BookmarksContext'

interface Props {
  type: BookmarkType
  slug: string
  title: string
  subtitle: string
}

export function BookmarkButton({ type, slug, title, subtitle }: Props) {
  const { isBookmarked, toggleBookmark } = useBookmarks()
  const saved = isBookmarked(type, slug)

  return (
    <button
      onClick={() => toggleBookmark({ type, slug, title, subtitle })}
      aria-label={saved ? 'Remove bookmark' : 'Save bookmark'}
      aria-pressed={saved}
      className={`clay-btn flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium ${
        saved ? 'text-accent' : 'text-muted'
      }`}
    >
      <svg
        width="13"
        height="13"
        viewBox="0 0 24 24"
        fill={saved ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M19 21 12 16.5 5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
      </svg>
      {saved ? 'Saved' : 'Save'}
    </button>
  )
}
