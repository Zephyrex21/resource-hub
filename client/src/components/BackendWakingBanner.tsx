import { motion, AnimatePresence } from 'framer-motion'
import { useUIStore } from '../store/uiStore'

// Purely presentational — visibility is driven by useBackendWakeCheck
// (run once in RootLayout), which owns the actual polling/timing logic via
// the shared UI store. Full-width top bar rather than a modal/toast so it
// doesn't block interaction with the rest of the page while waiting.
export function BackendWakingBanner() {
  const visible = useUIStore((s) => s.backendWaking)

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -60, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 32 }}
          role="status"
          className="fixed inset-x-0 top-0 z-50 flex items-center justify-center gap-2.5 bg-accent px-4 py-2.5 text-center text-xs font-medium text-white sm:text-sm"
        >
          <span className="h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          Waking up the backend — it's on a free tier, so this can take up to a minute.
          This banner disappears automatically once it's ready.
        </motion.div>
      )}
    </AnimatePresence>
  )
}
