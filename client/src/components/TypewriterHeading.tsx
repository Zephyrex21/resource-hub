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
}

const charVariants = {
  hidden: { opacity: 0, y: 6 },
  show: { opacity: 1, y: 0, transition: { duration: 0.12 } },
}

// Reveals text character-by-character on mount, like it's being typed —
// rather than fading/sliding in as one static block. Uses Framer Motion's
// staggerChildren (position-based, not manual indexing) so it works
// cleanly across multiple lines and a colored final line.
export function TypewriterHeading({ lines, className, charDelay = 0.022, startDelay = 0.15 }: Props) {
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
      {lines.map((line, li) => (
        <span key={li} className={line.accent ? 'text-accent' : undefined} aria-hidden="true">
          {line.text.split('').map((ch, ci) => (
            <motion.span key={`${li}-${ci}`} variants={charVariants} className="inline-block">
              {ch === ' ' ? '\u00A0' : ch}
            </motion.span>
          ))}
          {li < lines.length - 1 && <br />}
        </span>
      ))}
    </motion.h1>
  )
}
