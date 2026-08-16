import { NavLink } from 'react-router-dom'
import ThemeToggle from './ThemeToggle'

const links = [
  { to: '/notes', label: 'Notes' },
  { to: '/tips', label: 'Tips' },
  { to: '/projects', label: 'Projects' },
]

interface NavbarProps {
  onSearchClick: () => void
}

export default function Navbar({ onSearchClick }: NavbarProps) {
  return (
    <header className="glass-card fixed left-1/2 top-4 z-10 flex w-[min(94%,920px)] -translate-x-1/2 items-center justify-between gap-3 rounded-2xl px-5 py-3">
      <NavLink to="/" className="font-display text-lg font-semibold text-text">
        Resource Hub
      </NavLink>

      <nav className="flex items-center gap-1 sm:gap-2">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                isActive ? 'text-accent' : 'text-muted hover:text-text'
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="flex items-center gap-2">
        <button
          onClick={onSearchClick}
          className="clay-btn hidden items-center gap-2 rounded-full px-3 py-1.5 text-xs text-muted sm:flex"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <span>Search</span>
          <kbd className="rounded bg-border px-1.5 py-0.5 text-[10px]">⌘K</kbd>
        </button>
        <ThemeToggle />
      </div>
    </header>
  )
}
