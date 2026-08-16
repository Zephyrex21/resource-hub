import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ClayCard, GlassCard } from '../components/ui/Card'
import { containerVariants, itemVariants } from '../components/motionVariants'

const sections = [
  {
    to: '/notes',
    title: 'Notes',
    description: 'DBMS, OS, DSA, LLMs & RAG, and more — first-party study notes, read in-browser.',
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
  return (
    <div className="flex flex-col items-center gap-10 text-center">
      <ClayCard className="w-full px-8 py-14 sm:py-16">
        <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">Resource Hub</h1>
        <p className="mx-auto mt-4 max-w-xl text-muted">
          A personal developer knowledge base — notes I wrote, tricks I figured out, and
          projects I shipped. Hosted, not just linked.
        </p>
      </ClayCard>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid w-full gap-5 sm:grid-cols-3"
      >
        {sections.map((s) => (
          <motion.div key={s.to} variants={itemVariants}>
            <Link to={s.to}>
              <GlassCard className="h-full px-6 py-8 text-left transition-transform hover:-translate-y-1">
                <span className={`inline-block h-2.5 w-2.5 rounded-full ${s.dot}`} />
                <h2 className={`mt-3 font-display text-xl font-semibold ${s.accent}`}>{s.title}</h2>
                <p className="mt-2 text-sm text-muted">{s.description}</p>
              </GlassCard>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}
