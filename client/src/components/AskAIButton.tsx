import { motion, AnimatePresence } from 'framer-motion'
import { useUIStore } from '../store/uiStore'

function SparkleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8" />
    </svg>
  )
}

// Fixed bottom-right trigger — hidden while the panel itself is open so the
// two never overlap (the panel occupies the same corner).
export function AskAIButton() {
  const askPanelOpen = useUIStore((s) => s.askPanelOpen)
  const openAskPanel = useUIStore((s) => s.openAskPanel)

  return (
    <AnimatePresence>
      {!askPanelOpen && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={openAskPanel}
          aria-label="Ask AI"
          className="fixed bottom-5 right-5 z-30 flex items-center gap-2 rounded-full bg-accent px-4 py-3 text-sm font-medium text-white shadow-[var(--card-shadow-hover)] sm:bottom-6 sm:right-6"
        >
          <SparkleIcon />
          <span className="hidden sm:inline">Ask AI</span>
        </motion.button>
      )}
    </AnimatePresence>
  )
}
