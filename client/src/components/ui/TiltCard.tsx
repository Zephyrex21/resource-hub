import { useRef, type MouseEvent, type ReactNode } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { springGentle } from '../motionVariants'

interface TiltCardProps {
  children: ReactNode
  className?: string
}

const MAX_TILT_DEG = 6

// Wraps a card in a subtle mouse-tracking 3D tilt — the card leans toward
// the cursor and settles back with a spring on mouse-leave. Purely a hover
// affordance layered on top of whatever's inside (GlassCard/ClayCard already
// handle their own click/navigation), so this only ever touches transform.
// Disabled under prefers-reduced-motion, same as the rest of the app's
// animations (handled globally via <MotionConfig reducedMotion="user">, but
// we also skip the pointer math entirely here since it's non-trivial work
// that has no payoff for a reduced-motion user).
export function TiltCard({ children, className = '' }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const rawX = useMotionValue(0.5)
  const rawY = useMotionValue(0.5)
  const x = useSpring(rawX, springGentle)
  const y = useSpring(rawY, springGentle)
  const glowOpacity = useSpring(0, springGentle)

  const rotateX = useTransform(y, [0, 1], [MAX_TILT_DEG, -MAX_TILT_DEG])
  const rotateY = useTransform(x, [0, 1], [-MAX_TILT_DEG, MAX_TILT_DEG])
  const glowBackground = useTransform([x, y], (latest) => {
    const [gx, gy] = latest as number[]
    return `radial-gradient(circle at ${gx * 100}% ${gy * 100}%, rgba(124,92,252,0.14), transparent 60%)`
  })

  function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    rawX.set((e.clientX - rect.left) / rect.width)
    rawY.set((e.clientY - rect.top) / rect.height)
  }

  function handleMouseEnter() {
    glowOpacity.set(1)
  }

  function handleMouseLeave() {
    rawX.set(0.5)
    rawY.set(0.5)
    glowOpacity.set(0)
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformPerspective: 800 }}
      className={`relative ${className}`}
    >
      {/* Cursor-following soft highlight — reinforces the tilt with light */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-2xl"
        style={{ background: glowBackground, opacity: glowOpacity }}
      />
      {children}
    </motion.div>
  )
}
