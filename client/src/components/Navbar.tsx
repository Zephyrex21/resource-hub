import { NavLink } from 'react-router-dom'
import ThemeToggle from './ThemeToggle'

const links = [
  { to: '/notes', label: 'Notes' },
  { to: '/tips', label: 'Tips' },
  { to: '/projects', label: 'Projects' },
]

export default function Navbar() {
  return (
    <header className="glass-card fixed left-1/2 top-4 z-10 flex w-[min(94%,880px)] -translate-x-1/2 items-center justify-between gap-4 rounded-2xl px-5 py-3">
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

      <ThemeToggle />
    </header>
  )
}
