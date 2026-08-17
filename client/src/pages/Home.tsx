import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ClayCard, GlassCard } from '../components/ui/Card'
import { HeroIllustration } from '../components/HeroIllustration'
import { getStats } from '../lib/api'
import { useAsync } from '../hooks/useAsync'
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

export default function Home() {
  usePageTitle('Home')
  const { data: stats } = useAsync(getStats, [])

  const statItems = [
    { label: 'Notes', value: stats?.notes },
    { label: 'Tips & Tricks', value: stats?.tips },
    { label: 'Projects', value: stats?.projects },
  ]

  return (
    <div className="flex flex-col gap-24 sm:gap-28">
      {/* Hero */}
      <section className="grid items-center gap-10 pt-6 lg:grid-cols-2 lg:gap-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="flex flex-col items-start gap-6 text-left"
        >
          <span className="glass-card rounded-full px-4 py-1.5 text-xs font-medium text-muted">
            Notes · Tips &amp; Tricks · Projects — all in one place
          </span>

          <h1 className="font-display text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl">
            Your developer
            <br />
            knowledge base,
            <br />
            <span className="text-accent">hosted &amp; readable.</span>
          </h1>

          <p className="max-w-md text-muted">
            A personal resource hub — study notes I wrote, tricks I figured out, and projects
            I've actually shipped. Read in-browser, not just linked out.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/notes"
              className="rounded-full bg-accent px-6 py-3 text-sm font-medium text-white transition-transform hover:-translate-y-0.5"
            >
              Browse Notes
            </Link>
            <Link
              to="/projects"
              className="clay-btn rounded-full px-6 py-3 text-sm font-medium text-text transition-transform hover:-translate-y-0.5"
            >
              View Projects
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
          className="mx-auto w-full max-w-md lg:max-w-none"
        >
          <HeroIllustration />
        </motion.div>
      </section>

      {/* Real stats — no vanity numbers, just what's actually here */}
      <motion.section
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.4 }}
        variants={containerVariants}
      >
        <ClayCard className="grid grid-cols-3 divide-x divide-border px-4 py-6 sm:px-8">
          {statItems.map((item) => (
            <motion.div key={item.label} variants={itemVariants} className="flex flex-col items-center gap-1 text-center">
              <span className="font-display text-2xl font-bold sm:text-3xl">
                {item.value ?? '—'}
              </span>
              <span className="text-xs text-muted sm:text-sm">{item.label}</span>
            </motion.div>
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
            <motion.div key={s.to} variants={itemVariants}>
              <Link to={s.to}>
                <GlassCard className="h-full px-6 py-8 text-left transition-transform hover:-translate-y-1">
                  <span className={`inline-block h-2.5 w-2.5 rounded-full ${s.dot}`} />
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
