import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar'
import ParticleBackground from '../components/ParticleBackground'
import CommandPalette from '../components/CommandPalette'

export default function RootLayout() {
  const [searchOpen, setSearchOpen] = useState(false)

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSearchOpen((o) => !o)
      }
      if (e.key === 'Escape') setSearchOpen(false)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  return (
    <div className="relative min-h-screen bg-bg font-body text-text transition-colors">
      <ParticleBackground />
      <Navbar onSearchClick={() => setSearchOpen(true)} />
      <CommandPalette open={searchOpen} onOpenChange={setSearchOpen} />

      <main className="relative mx-auto max-w-5xl px-6 pb-24 pt-28">
        <Outlet />
      </main>

      <footer className="relative mx-auto max-w-5xl px-6 pb-10 text-center text-xs text-muted">
        Built with React, TypeScript, Tailwind &amp; Express — Resource Hub
      </footer>
    </div>
  )
}
