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
