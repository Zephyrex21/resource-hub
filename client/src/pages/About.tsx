import { motion } from 'framer-motion'
import { ClayCard, GlassCard } from '../components/ui/Card'
import { usePageTitle } from '../hooks/usePageTitle'
import { containerVariants, itemVariants } from '../components/motionVariants'

const techStack = [
  'React',
  'TypeScript',
  'Vite',
  'Tailwind CSS',
  'Node.js',
  'Express',
  'MongoDB',
  'Supabase Storage',
  'Framer Motion',
]

const builtWith = [
  {
    title: 'MERN, end to end',
    body: 'React + Vite on the frontend, Express + MongoDB Atlas on the backend — the same stack across every project in the Projects section.',
  },
  {
    title: 'Files live outside git',
    body: "Notes and tips are hosted on Supabase Storage, not committed to the repo — keeps the codebase small no matter how much content gets added.",
  },
  {
    title: 'Deployed on free tiers',
    body: 'Vercel for the client, Render for the API, MongoDB Atlas for the database, Supabase for file storage — zero hosting cost.',
  },
]

export default function About() {
  usePageTitle('About')

  return (
    <div className="flex flex-col gap-14">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <ClayCard className="px-8 py-12 text-center sm:py-14">
          <h1 className="font-display text-3xl font-bold sm:text-4xl">About this hub</h1>
          <p className="mx-auto mt-4 max-w-xl text-muted">
            I'm Saurabh — a CSE (Data Science) student at NSUT Delhi, building full-stack MERN
            apps and AI/ML tools. This site is where I keep the study notes I write, the tricks
            I figure out along the way, and the projects I actually ship — in one place, hosted
            properly instead of scattered across bookmarks and screenshots.
          </p>
        </ClayCard>
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
        variants={containerVariants}
        className="flex flex-col gap-5"
      >
        <h2 className="text-center font-display text-xl font-semibold">Built with</h2>
        <motion.div variants={itemVariants} className="flex flex-wrap justify-center gap-2">
          {techStack.map((tech) => (
            <span key={tech} className="clay-btn rounded-full px-4 py-2 text-sm text-text">
              {tech}
            </span>
          ))}
        </motion.div>
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
        variants={containerVariants}
        className="flex flex-col gap-5"
      >
        <h2 className="text-center font-display text-xl font-semibold">How it's put together</h2>
        <div className="grid gap-5 sm:grid-cols-3">
          {builtWith.map((item) => (
            <motion.div key={item.title} variants={itemVariants}>
              <GlassCard className="h-full px-6 py-6">
                <h3 className="font-display text-base font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-muted">{item.body}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
