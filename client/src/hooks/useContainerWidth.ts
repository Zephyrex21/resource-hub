import { useEffect, useRef, useState } from 'react'

// Tracks an element's rendered width so children (like react-pdf's <Page>,
// which needs an explicit pixel width) can stay responsive instead of
// overflowing on narrow screens.
export function useContainerWidth<T extends HTMLElement>(maxWidth = Infinity) {
  const ref = useRef<T | null>(null)
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width ?? 0
      setWidth(Math.min(w, maxWidth))
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [maxWidth])

  return { ref, width }
}
