import { motion, AnimatePresence } from 'framer-motion'
import { useBookmarks, type BookmarkType } from '../context/BookmarksContext'
import { springBouncy, burstVariants } from './motionVariants'

interface Props {
  type: BookmarkType
  slug: string
  title: string
  subtitle: string
}

// Burst particles fired outward from the icon on save — purely decorative,
// aria-hidden, and gone after ~0.5s so they never persist as inert DOM.
const BURST_ANGLES = [0, 60, 120, 180, 240, 300]

export function BookmarkButton({ type, slug, title, subtitle }: Props) {
  const { isBookmarked, toggleBookmark } = useBookmarks()
  const saved = isBookmarked(type, slug)

  function handleClick() {
    toggleBookmark({ type, slug, title, subtitle })
  }

  return (
    <button
      onClick={handleClick}
      aria-label={saved ? 'Remove bookmark' : 'Save bookmark'}
      aria-pressed={saved}
      className={`clay-btn relative flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium ${
        saved ? 'text-accent' : 'text-muted'
      }`}
    >
      <span className="relative inline-flex h-[13px] w-[13px] items-center justify-center">
        <motion.svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill={saved ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          animate={saved ? { scale: [1, 1.3, 1] } : { scale: 1 }}
          transition={springBouncy}
        >
          <path d="M19 21 12 16.5 5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
        </motion.svg>

        <AnimatePresence>
          {saved && (
            <span aria-hidden="true" className="pointer-events-none absolute inset-0">
              {BURST_ANGLES.map((angle) => (
                <motion.span
                  key={angle}
                  variants={burstVariants}
                  initial="hidden"
                  animate="show"
                  exit="hidden"
                  className="absolute left-1/2 top-1/2 h-1 w-1 rounded-full bg-accent"
                  style={{
                    transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-10px)`,
                  }}
                />
              ))}
            </span>
          )}
        </AnimatePresence>
      </span>
      {saved ? 'Saved' : 'Save'}
    </button>
  )
}
