import { NavLink, useNavigate } from 'react-router-dom'
import ThemeToggle from './ThemeToggle'
import { useUIStore } from '../store/uiStore'
import { useAccount } from '../context/AccountContext'
import { useToast } from '../context/ToastContext'

const links = [
  { to: '/notes', label: 'Notes' },
  { to: '/tips', label: 'Tips' },
  { to: '/projects', label: 'Projects' },
  { to: '/about', label: 'About', hideOnMobile: true },
]

// Frosted glass nav that respects the app's light/dark toggle, same as
// everything else. (An earlier version hardcoded this to always-dark on
// the theory it needed one look spanning a dark showcase zone and a light
// flat zone — but light/dark is a single global toggle here, not
// per-section, so that reasoning didn't hold. See index.css .nav-glass.)
export default function Navbar() {
  const onSearchClick = useUIStore((s) => s.openCommandPalette)
  const backendWaking = useUIStore((s) => s.backendWaking)
  const { status, user, signOut } = useAccount()
  const { showToast } = useToast()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    showToast('Signed out')
    navigate('/')
  }

  return (
    <header
      className={`nav-glass fixed left-1/2 z-10 flex w-[min(95%,920px)] -translate-x-1/2 items-center justify-between gap-1 rounded-2xl px-3 py-2.5 transition-[top] duration-300 sm:gap-3 sm:px-5 sm:py-3 ${
        backendWaking ? 'top-[52px] sm:top-[60px]' : 'top-3 sm:top-4'
      }`}
    >
      <NavLink to="/" className="nav-text shrink-0 font-display text-base font-semibold sm:text-lg">
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
              } ${isActive ? 'text-[rgb(var(--showcase-glow-2))]' : 'nav-text-muted hover:text-[rgb(var(--nav-text))]'}`
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
          className="nav-glass-btn nav-text-muted hidden items-center gap-2 rounded-full px-3 py-1.5 text-xs sm:flex"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <span>Search</span>
          <kbd className="nav-glass-btn nav-text-muted rounded px-1.5 py-0.5 text-[10px]">⌘K</kbd>
        </button>
        <button
          onClick={onSearchClick}
          aria-label="Open search"
          className="nav-glass-btn nav-text-muted flex h-8 w-8 items-center justify-center rounded-full sm:hidden"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </button>
        {status === 'signed-in' && user ? (
          <>
            <div className="hidden items-center gap-2 sm:flex">
              <span className="nav-text-muted text-xs">Hi, {user.name.split(' ')[0]}</span>
              <button onClick={handleSignOut} className="nav-glass-btn nav-text-muted rounded-full px-3 py-1.5 text-xs">
                Sign out
              </button>
            </div>
            <button
              onClick={handleSignOut}
              aria-label="Sign out"
              className="nav-glass-btn nav-text-muted flex h-8 w-8 items-center justify-center rounded-full sm:hidden"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <path d="m16 17 5-5-5-5" />
                <path d="M21 12H9" />
              </svg>
            </button>
          </>
        ) : status === 'signed-out' ? (
          <>
            <NavLink
              to="/signin"
              className="nav-glass-btn nav-text-muted hidden rounded-full px-3 py-1.5 text-xs sm:inline-block"
            >
              Sign in
            </NavLink>
            <NavLink
              to="/signin"
              aria-label="Sign in"
              className="nav-glass-btn nav-text-muted flex h-8 w-8 items-center justify-center rounded-full sm:hidden"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                <path d="M10 17l5-5-5-5" />
                <path d="M15 12H3" />
              </svg>
            </NavLink>
          </>
        ) : null}
        <ThemeToggle />
      </div>
    </header>
  )
}
