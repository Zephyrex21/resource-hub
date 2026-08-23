import { useEffect, useRef } from 'react'
import { getHealth } from '../lib/api'
import { useUIStore } from '../store/uiStore'

// How long to wait before assuming a slow response means the free-tier
// backend is cold-starting, not just a normal network delay. A warm
// backend answers in well under a second, so this rarely fires on a warm
// visit — it's specifically for the ~30-60s Render free-tier wake-up.
const SHOW_DELAY_MS = 1500
// If the health check itself errors (not just slow — an actual failure,
// which can happen mid-wake-up on Render), retry on a short interval
// rather than giving up after one failed attempt.
const RETRY_INTERVAL_MS = 4000
const MAX_RETRIES = 20 // ~80s ceiling, comfortably past a typical cold start

// Run once, at the root of the app. Pings /api/v1/health; if it hasn't
// resolved within SHOW_DELAY_MS, flips backendWaking on in the shared UI
// store (read by BackendWakingBanner, and by Navbar/RootLayout to shift
// their own layout down out of the banner's way). Flips off the instant a
// health check succeeds, and never re-triggers afterward — a later
// mid-session network hiccup on an already-warm backend isn't the same
// problem this is meant to explain, so it only ever runs the one check.
export function useBackendWakeCheck() {
  const setBackendWaking = useUIStore((s) => s.setBackendWaking)
  const settledRef = useRef(false)

  useEffect(() => {
    let cancelled = false
    let showTimer: ReturnType<typeof setTimeout>

    async function check(attempt: number) {
      if (cancelled || settledRef.current) return
      try {
        await getHealth()
        if (cancelled) return
        settledRef.current = true
        clearTimeout(showTimer)
        setBackendWaking(false)
      } catch {
        if (cancelled || attempt >= MAX_RETRIES) return
        setTimeout(() => check(attempt + 1), RETRY_INTERVAL_MS)
      }
    }

    showTimer = setTimeout(() => {
      if (!settledRef.current && !cancelled) setBackendWaking(true)
    }, SHOW_DELAY_MS)

    check(0)

    return () => {
      cancelled = true
      clearTimeout(showTimer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
