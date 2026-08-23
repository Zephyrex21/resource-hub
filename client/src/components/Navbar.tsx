import { NavLink } from 'react-router-dom'
import ThemeToggle from './ThemeToggle'
import { useUIStore } from '../store/uiStore'

const links = [
  { to: '/notes', label: 'Notes' },
  { to: '/tips', label: 'Tips' },
  { to: '/projects', label: 'Projects' },
  { to: '/about', label: 'About', hideOnMobile: true },
]

export default function Navbar() {
  const onSearchClick = useUIStore((s) => s.openCommandPalette)
  const backendWaking = useUIStore((s) => s.backendWaking)

  return (
    <header
      className={`glass-card fixed left-1/2 z-10 flex w-[min(95%,920px)] -translate-x-1/2 items-center justify-between gap-1 rounded-2xl px-3 py-2.5 transition-[top] duration-300 sm:gap-3 sm:px-5 sm:py-3 ${
        backendWaking ? 'top-[52px] sm:top-[60px]' : 'top-3 sm:top-4'
      }`}
    >
      <NavLink to="/" className="shrink-0 font-display text-base font-semibold text-text sm:text-lg">
        Resource Hub
      </NavLink>

      <nav className="flex items-center gap-0.5 sm:gap-2">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `rounded-full px-2 py-1.5 text-xs font-medium transition-colors sm:px-3 sm:text-sm ${
                link.hideOnMobile ? 'hidden sm:inline-block' : ''
              } ${isActive ? 'text-accent' : 'text-muted hover:text-text'}`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="flex shrink-0 items-center gap-2">
        <button
          onClick={onSearchClick}
          aria-label="Open search"
          className="clay-btn hidden items-center gap-2 rounded-full px-3 py-1.5 text-xs text-muted sm:flex"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <span>Search</span>
          <kbd className="rounded bg-border px-1.5 py-0.5 text-[10px]">⌘K</kbd>
        </button>
        <button
          onClick={onSearchClick}
          aria-label="Open search"
          className="clay-btn flex h-8 w-8 items-center justify-center rounded-full text-muted sm:hidden"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </button>
        <ThemeToggle />
      </div>
    </header>
  )
}
