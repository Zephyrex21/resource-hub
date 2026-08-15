import ThemeToggle from './ThemeToggle'

export default function Navbar() {
  return (
    <header className="glass-card fixed left-1/2 top-4 z-10 flex w-[min(92%,720px)] -translate-x-1/2 items-center justify-between rounded-2xl px-5 py-3">
      <span className="font-display text-lg font-semibold text-text">Resource Hub</span>
      <ThemeToggle />
    </header>
  )
}
