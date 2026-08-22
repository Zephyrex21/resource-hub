import { useEffect, useState } from 'react'

// Animates from 0 to `target` once `active` becomes true (e.g. triggered by
// a scroll-into-view callback). Plain requestAnimationFrame rather than a
// motion-value dependency, since this drives a rounded integer of text
// content rather than a CSS property.
export function useCountUp(target: number | undefined, active: boolean, duration = 1000) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!active || target === undefined) return
    const finalValue = target

    let frame: number
    let start: number | null = null

    function step(timestamp: number) {
      if (start === null) start = timestamp
      const progress = Math.min((timestamp - start) / duration, 1)
      setValue(Math.round(progress * finalValue))
      if (progress < 1) frame = requestAnimationFrame(step)
    }

    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [target, active, duration])

  return value
}
