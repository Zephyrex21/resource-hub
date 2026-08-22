// Shared animation variants. Reduced-motion handling is centralized via
// <MotionConfig reducedMotion="user"> in main.tsx — individual components
// don't need to check the media query themselves.

export const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
}

export const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } },
}

// Shared spring presets so every hover/tap/press interaction across the app
// feels like it belongs to the same physical system, instead of each
// component picking its own duration/easing ad hoc.
export const springSnappy = { type: 'spring', stiffness: 420, damping: 28 } as const
export const springGentle = { type: 'spring', stiffness: 180, damping: 22 } as const
export const springBouncy = { type: 'spring', stiffness: 340, damping: 14 } as const

// Burst-particle keyframes used by BookmarkButton's "saved" micro-interaction.
export const burstVariants = {
  hidden: { opacity: 0, scale: 0 },
  show: { opacity: [0, 1, 0], scale: [0, 1, 1.4], transition: { duration: 0.5, ease: 'easeOut' } },
}
