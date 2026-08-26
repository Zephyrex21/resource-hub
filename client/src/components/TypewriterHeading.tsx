import { motion } from 'framer-motion'

interface Line {
  text: string
  accent?: boolean
}

interface Props {
  lines: Line[]
  className?: string
  charDelay?: number
  startDelay?: number
  /** Class applied to lines marked `accent: true`. Defaults to the app's
   *  flat accent color; pass 'showcase-gradient-text' for the DesignCode-
   *  inspired hero treatment instead. */
  accentClassName?: string
  /** background-clip: text (used by the gradient accent) doesn't inherit
   *  to child elements, so splitting the accent line into per-character
   *  spans would clip the gradient separately per letter instead of
   *  flowing smoothly across the whole line. When true, the accent line
   *  skips the char-split and fades in as one block once the preceding
   *  lines finish typing. Only meaningful when accentClassName is a
   *  gradient-text class. */
  accentAsBlock?: boolean
}

const charVariants = {
  hidden: { opacity: 0, y: 6 },
  show: { opacity: 1, y: 0, transition: { duration: 0.12 } },
}

// Reveals text character-by-character on mount, like it's being typed —
// rather than fading/sliding in as one static block. Uses Framer Motion's
// staggerChildren (position-based, not manual indexing) so it works
// cleanly across multiple lines and a colored final line.
export function TypewriterHeading({
  lines,
  className,
  charDelay = 0.022,
  startDelay = 0.15,
  accentClassName = 'text-accent',
  accentAsBlock = false,
}: Props) {
  let charsSoFar = 0

  return (
    <motion.h1
      initial="hidden"
      animate="show"
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: charDelay, delayChildren: startDelay } },
      }}
      className={className}
      aria-label={lines.map((l) => l.text).join(' ')}
    >
      {lines.map((line, li) => {
        const useBlock = line.accent && accentAsBlock
        // Timed to land just after the preceding lines finish their own
        // per-character stagger, so it still reads as "typed up to here,
        // then the accent line arrives" rather than popping in early.
        const blockDelay = startDelay + charsSoFar * charDelay
        if (!useBlock) charsSoFar += line.text.length

        return (
          <span key={li} className={line.accent ? accentClassName : undefined} aria-hidden="true">
            {useBlock ? (
              <motion.span
                className="inline-block"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: blockDelay }}
              >
                {line.text}
              </motion.span>
            ) : (
              line.text.split('').map((ch, ci) => (
                <motion.span key={`${li}-${ci}`} variants={charVariants} className="inline-block">
                  {ch === ' ' ? '\u00A0' : ch}
                </motion.span>
              ))
            )}
            {li < lines.length - 1 && <br />}
          </span>
        )
      })}
    </motion.h1>
  )
}
