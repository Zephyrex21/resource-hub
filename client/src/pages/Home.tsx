import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ClayCard, GlassCard } from '../components/ui/Card'
import { HeroIllustration } from '../components/HeroIllustration'
import { TypewriterHeading } from '../components/TypewriterHeading'
import { getStats } from '../lib/api'
import { useAsync } from '../hooks/useAsync'
import { useCountUp } from '../hooks/useCountUp'
import { containerVariants, itemVariants } from '../components/motionVariants'
import { usePageTitle } from '../hooks/usePageTitle'

const sections = [
  {
    to: '/notes',
    title: 'Notes',
    description: 'DBMS, OS, DSA, LLMs, and more — first-party study notes, read in-browser.',
    accent: 'text-accent-notes',
    dot: 'bg-accent-notes',
  },
  {
    to: '/tips',
    title: 'Tips & Tricks',
    description: 'Practical how-tos — Docker setup, Git fixes, deployment gotchas.',
    accent: 'text-accent-tips',
    dot: 'bg-accent-tips',
  },
  {
    to: '/projects',
    title: 'Projects',
    description: 'Real, shipped projects — GitHub source and live demos.',
    accent: 'text-accent-projects',
    dot: 'bg-accent-projects',
  },
]

const headingLines = [
  { text: 'Your developer' },
  { text: 'knowledge base,' },
  { text: 'hosted & readable.', accent: true },
]

function StatCounter({ label, value, active }: { label: string; value: number | undefined; active: boolean }) {
  const count = useCountUp(value, active)
  return (
    <motion.div variants={itemVariants} className="flex flex-col items-center gap-1 text-center">
      <span className="font-display text-2xl font-bold sm:text-3xl">{value === undefined ? '—' : count}</span>
      <span className="text-xs text-muted sm:text-sm">{label}</span>
    </motion.div>
  )
}

export default function Home() {
  usePageTitle('Home')
  const { data: stats } = useAsync(getStats, [])
  const [statsInView, setStatsInView] = useState(false)

  // Scroll-driven parallax: the hero illustration drifts up and fades
  // slightly faster than the page scrolls, and the text column drifts the
  // opposite direction a touch — a subtle depth cue as the user scrolls
  // past the hero, rather than the whole section moving as one flat block.
  const heroRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const illustrationY = useTransform(scrollYProgress, [0, 1], [0, -60])
  const illustrationOpacity = useTransform(scrollYProgress, [0, 1], [1, 0.4])
  const textY = useTransform(scrollYProgress, [0, 1], [0, 24])

  const statItems = [
    { label: 'Notes', value: stats?.notes },
    { label: 'Tips & Tricks', value: stats?.tips },
    { label: 'Projects', value: stats?.projects },
  ]

  return (
    <div className="flex flex-col gap-24 sm:gap-28">
      {/* Hero */}
      <motion.section ref={heroRef} className="grid items-center gap-10 pt-6 lg:grid-cols-2 lg:gap-6">
        <motion.div style={{ y: textY }} className="flex flex-col items-start gap-6 text-left">
          <motion.span
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="glass-card rounded-full px-4 py-1.5 text-xs font-medium text-muted"
          >
            Notes · Tips &amp; Tricks · Projects — all in one place
          </motion.span>

          <TypewriterHeading
            lines={headingLines}
            className="font-display text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl"
          />

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 1.5 }}
            className="max-w-md text-muted"
          >
            A personal resource hub — study notes I wrote, tricks I figured out, and projects
            I've actually shipped. Read in-browser, not just linked out.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 1.7 }}
            className="flex flex-wrap gap-3"
          >
            <motion.div whileHover={{ y: -3, scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link
                to="/notes"
                className="block rounded-full bg-accent px-6 py-3 text-sm font-medium text-white"
              >
                Browse Notes
              </Link>
            </motion.div>
            <motion.div whileHover={{ y: -3, scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link to="/projects" className="clay-btn block rounded-full px-6 py-3 text-sm font-medium text-text">
                View Projects
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut', delay: 0.3 }}
          style={{ y: illustrationY, opacity: illustrationOpacity }}
          className="mx-auto w-full max-w-md lg:max-w-none"
        >
          <HeroIllustration />
        </motion.div>
      </motion.section>

      {/* Real stats — no vanity numbers, just what's actually here — count up into view */}
      <motion.section
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.4 }}
        onViewportEnter={() => setStatsInView(true)}
        variants={containerVariants}
      >
        <ClayCard className="grid grid-cols-3 divide-x divide-border px-4 py-6 sm:px-8">
          {statItems.map((item) => (
            <StatCounter key={item.label} label={item.label} value={item.value} active={statsInView} />
          ))}
        </ClayCard>
      </motion.section>

      {/* Explore */}
      <motion.section
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
        variants={containerVariants}
        className="flex flex-col gap-6"
      >
        <div className="text-center">
          <h2 className="font-display text-2xl font-bold sm:text-3xl">Explore the hub</h2>
          <p className="mt-2 text-sm text-muted">Three pillars, one knowledge base.</p>
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          {sections.map((s) => (
            <motion.div key={s.to} variants={itemVariants} whileHover={{ y: -4 }}>
              <Link to={s.to}>
                <GlassCard className="h-full px-6 py-8 text-left">
                  <motion.span
                    className={`inline-block h-2.5 w-2.5 rounded-full ${s.dot}`}
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  />
                  <h3 className={`mt-3 font-display text-xl font-semibold ${s.accent}`}>{s.title}</h3>
                  <p className="mt-2 text-sm text-muted">{s.description}</p>
                </GlassCard>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.section>
    </div>
  )
}
