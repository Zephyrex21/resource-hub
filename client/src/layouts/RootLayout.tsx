import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Navbar from '../components/Navbar'
import ParticleBackground from '../components/ParticleBackground'
import CommandPalette from '../components/CommandPalette'
import { PageTransition } from '../components/PageTransition'

export default function RootLayout() {
  const [searchOpen, setSearchOpen] = useState(false)
  const location = useLocation()

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

      <main className="relative mx-auto max-w-5xl px-4 pb-24 pt-28 sm:px-6">
        <AnimatePresence mode="wait">
          <PageTransition key={location.pathname}>
            <Outlet />
          </PageTransition>
        </AnimatePresence>
      </main>

      <footer className="relative mx-auto max-w-5xl px-6 pb-10 text-center text-xs text-muted">
        Built with React, TypeScript, Tailwind &amp; Express — Resource Hub
      </footer>
    </div>
  )
}
