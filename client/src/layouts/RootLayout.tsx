import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import CommandPalette from '../components/CommandPalette'
import { AskAIButton } from '../components/AskAIButton'
import { AskAIPanel } from '../components/AskAIPanel'
import { BackendWakingBanner } from '../components/BackendWakingBanner'
import { PageTransition } from '../components/PageTransition'
import { useUIStore } from '../store/uiStore'
import { useBackendWakeCheck } from '../hooks/useBackendWakeCheck'

export default function RootLayout() {
  const commandPaletteOpen = useUIStore((s) => s.commandPaletteOpen)
  const toggleCommandPalette = useUIStore((s) => s.toggleCommandPalette)
  const closeCommandPalette = useUIStore((s) => s.closeCommandPalette)
  const backendWaking = useUIStore((s) => s.backendWaking)
  const location = useLocation()

  useBackendWakeCheck()

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        toggleCommandPalette()
      }
      if (e.key === 'Escape') closeCommandPalette()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [toggleCommandPalette, closeCommandPalette])

  return (
    <div className="relative flex min-h-screen flex-col bg-bg font-body text-text transition-colors">
      <BackendWakingBanner />
      <Navbar />
      <CommandPalette
        open={commandPaletteOpen}
        onOpenChange={(open) => (open ? useUIStore.getState().openCommandPalette() : closeCommandPalette())}
      />

      <main
        className={`relative mx-auto w-full max-w-5xl flex-1 px-4 pb-20 transition-[padding-top] duration-300 sm:px-6 ${
          backendWaking ? 'pt-[156px]' : 'pt-28'
        }`}
      >
        <AnimatePresence mode="wait">
          <PageTransition key={location.pathname}>
            <Outlet />
          </PageTransition>
        </AnimatePresence>
      </main>

      <Footer />
      <AskAIButton />
      <AskAIPanel />
    </div>
  )
}
