import { useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'

// An original, hand-built illustration (no external assets/icon packs) —
// three cards representing Notes / Tips / Projects, connected like a small
// graph. Two layers of motion give it real depth instead of a static image:
//
// 1. Mouse-driven 3D parallax — the whole SVG tilts on rotateX/rotateY
//    based on cursor position, via a `perspective` set on the wrapping div.
//    Transforming the SVG root this way is reliable across browsers (it's
//    just a normal CSS box); we don't attempt 3D transforms on individual
//    SVG children, which has inconsistent cross-browser support.
// 2. Per-card idle float — each card bobs independently (different
//    duration/phase/amplitude), which is what actually sells "these are
//    three separate objects in space" rather than one flat picture, and
//    keeps the scene alive even with no mouse input (touch devices, etc).
//
// Depth is also graded directly: the Projects card (largest, drawn last)
// gets the strongest shadow and a touch more scale to read as "closest";
// Notes and Tips sit further back with softer shadows.
//
// Colors resolve via CSS custom properties, so it adapts automatically
// between light and dark mode with no JS/theme-detection needed here.
export function HeroIllustration() {
  const containerRef = useRef<HTMLDivElement>(null)
  const mvX = useMotionValue(0)
  const mvY = useMotionValue(0)
  const rotateX = useSpring(useTransform(mvY, [-0.5, 0.5], [8, -8]), { stiffness: 150, damping: 20 })
  const rotateY = useSpring(useTransform(mvX, [-0.5, 0.5], [-10, 10]), { stiffness: 150, damping: 20 })

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    mvX.set((e.clientX - rect.left) / rect.width - 0.5)
    mvY.set((e.clientY - rect.top) / rect.height - 0.5)
  }

  function handleMouseLeave() {
    mvX.set(0)
    mvY.set(0)
  }

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ perspective: 1200 }}
      className="h-full w-full"
    >
      <motion.svg
        viewBox="0 0 440 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full"
        aria-hidden="true"
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
      >
        <defs>
          <filter id="heroCardShadowSoft" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="8" stdDeviation="9" floodColor="#0f172a" floodOpacity="0.1" />
          </filter>
          <filter id="heroCardShadowStrong" x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow dx="0" dy="16" stdDeviation="16" floodColor="#0f172a" floodOpacity="0.18" />
          </filter>
          <filter id="heroGlowBlur" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="28" />
          </filter>
        </defs>

        {/* Mesh-gradient glow blobs — same three-color family as the page
            background, echoed behind the illustration and slowly pulsing
            so the scene never feels static even at rest. */}
        <g filter="url(#heroGlowBlur)">
          <motion.circle
            cx="130" cy="110" r="90" fill="rgb(var(--showcase-glow-1) / 0.28)"
            animate={{ r: [90, 100, 90], opacity: [1, 0.8, 1] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.circle
            cx="330" cy="170" r="80" fill="rgb(var(--showcase-glow-3) / 0.24)"
            animate={{ r: [80, 88, 80], opacity: [0.9, 1, 0.9] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          />
          <motion.circle
            cx="190" cy="290" r="85" fill="rgb(var(--showcase-glow-2) / 0.22)"
            animate={{ r: [85, 93, 85], opacity: [1, 0.85, 1] }}
            transition={{ duration: 6.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
          />
        </g>

        {/* connector lines */}
        <path d="M110 118 L 246 84" stroke="rgb(var(--showcase-border) / calc(var(--showcase-border-alpha) * 3.5))" strokeWidth="2" strokeDasharray="3 7" strokeLinecap="round" />
        <path d="M246 84 L 330 188" stroke="rgb(var(--showcase-border) / calc(var(--showcase-border-alpha) * 3.5))" strokeWidth="2" strokeDasharray="3 7" strokeLinecap="round" />
        <path d="M110 118 L 148 268" stroke="rgb(var(--showcase-border) / calc(var(--showcase-border-alpha) * 3.5))" strokeWidth="2" strokeDasharray="3 7" strokeLinecap="round" />
        <path d="M148 268 L 330 188" stroke="rgb(var(--showcase-border) / calc(var(--showcase-border-alpha) * 3.5))" strokeWidth="2" strokeDasharray="3 7" strokeLinecap="round" />

        {/* junction nodes */}
        <circle cx="246" cy="84" r="4.5" fill="rgb(var(--showcase-glow-1))" />
        <circle cx="330" cy="188" r="4.5" fill="rgb(var(--showcase-glow-3))" />
        <circle cx="148" cy="268" r="4.5" fill="rgb(var(--showcase-glow-2))" />

        {/* Notes card — furthest back: softer shadow, gentlest float */}
        <motion.g
          filter="url(#heroCardShadowSoft)"
          style={{ transformOrigin: '109px 119px' }}
          initial={{ rotate: -3, y: 0 }}
          animate={{ rotate: [-3, -1.5, -3], y: [0, -6, 0] }}
          transition={{ duration: 4.4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <rect
            x="34" y="66" width="150" height="106" rx="18"
            fill="rgb(var(--showcase-surface) / var(--showcase-surface-alpha))"
            stroke="rgb(var(--showcase-border) / calc(var(--showcase-border-alpha) * 2.5))"
            strokeWidth="1.5"
          />
          <rect x="54" y="90" width="14" height="14" rx="4" fill="rgb(var(--showcase-glow-1) / 0.22)" />
          <path d="M58 97 h6 M58 100.5 h6" stroke="rgb(var(--showcase-glow-1))" strokeWidth="1.6" strokeLinecap="round" />
          <rect x="76" y="93" width="60" height="7" rx="3.5" fill="rgb(var(--showcase-text))" />
          <rect x="54" y="118" width="110" height="6" rx="3" fill="rgb(var(--showcase-text-muted) / 0.35)" />
          <rect x="54" y="132" width="96" height="6" rx="3" fill="rgb(var(--showcase-text-muted) / 0.35)" />
          <rect x="54" y="146" width="70" height="6" rx="3" fill="rgb(var(--showcase-text-muted) / 0.35)" />
          <rect x="54" y="160" width="40" height="7" rx="3.5" fill="rgb(var(--showcase-glow-1) / 0.4)" />
        </motion.g>

        {/* Tips card — middle depth */}
        <motion.g
          filter="url(#heroCardShadowSoft)"
          style={{ transformOrigin: '304px 198px' }}
          initial={{ rotate: 2.5, y: 0 }}
          animate={{ rotate: [2.5, 1, 2.5], y: [0, -8, 0] }}
          transition={{ duration: 5.1, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
        >
          <rect
            x="234" y="150" width="140" height="96" rx="18"
            fill="rgb(var(--showcase-surface) / var(--showcase-surface-alpha))"
            stroke="rgb(var(--showcase-border) / calc(var(--showcase-border-alpha) * 2.5))"
            strokeWidth="1.5"
          />
          <circle cx="264" cy="184" r="15" fill="rgb(var(--showcase-glow-3) / 0.2)" />
          <path
            d="M264 176 a8 8 0 0 1 5 14.4 v2.6 h-10 v-2.6 a8 8 0 0 1 5 -14.4 z"
            stroke="rgb(var(--showcase-glow-3))"
            strokeWidth="1.8"
            strokeLinejoin="round"
            fill="none"
          />
          <path d="M260 197 h8" stroke="rgb(var(--showcase-glow-3))" strokeWidth="1.8" strokeLinecap="round" />
          <rect x="288" y="176" width="66" height="7" rx="3.5" fill="rgb(var(--showcase-text))" />
          <rect x="288" y="192" width="50" height="6" rx="3" fill="rgb(var(--showcase-text-muted) / 0.35)" />
          <rect x="254" y="216" width="100" height="6" rx="3" fill="rgb(var(--showcase-text-muted) / 0.35)" />
          <rect x="254" y="228" width="70" height="6" rx="3" fill="rgb(var(--showcase-text-muted) / 0.35)" />
        </motion.g>

        {/* Projects card — closest: strongest shadow, boldest float, gets
            a touch of extra scale to read as nearest to the viewer. */}
        <motion.g
          filter="url(#heroCardShadowStrong)"
          style={{ transformOrigin: '164px 276px' }}
          initial={{ rotate: -2, y: 0, scale: 1.03 }}
          animate={{ rotate: [-2, -0.5, -2], y: [0, -9, 0], scale: [1.03, 1.06, 1.03] }}
          transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
        >
          <rect
            x="84" y="222" width="160" height="108" rx="18"
            fill="rgb(var(--showcase-surface) / var(--showcase-surface-alpha))"
            stroke="rgb(var(--showcase-border) / calc(var(--showcase-border-alpha) * 2.5))"
            strokeWidth="1.5"
          />
          <rect x="104" y="246" width="46" height="46" rx="12" fill="rgb(var(--showcase-glow-2) / 0.18)" />
          <path d="M118 262 l-7 7 7 7 M136 262 l7 7 -7 7 M128 258 l-4 20" stroke="rgb(var(--showcase-glow-2))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <rect x="162" y="250" width="66" height="7" rx="3.5" fill="rgb(var(--showcase-text))" />
          <rect x="162" y="266" width="50" height="6" rx="3" fill="rgb(var(--showcase-text-muted) / 0.35)" />
          <rect x="104" y="302" width="34" height="14" rx="7" fill="rgb(var(--showcase-glow-2) / 0.3)" />
          <rect x="146" y="302" width="34" height="14" rx="7" fill="rgb(var(--showcase-text-muted) / 0.2)" />
        </motion.g>
      </motion.svg>
    </div>
  )
}
