import { useRef, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ClayCard, GlassCard } from '../components/ui/Card'
import { HeroIllustration } from '../components/HeroIllustration'
import { TypewriterHeading } from '../components/TypewriterHeading'
import { DifficultyBadge } from '../components/ui/DifficultyBadge'
import { getStats, getMeta, getTopContent, getNotes, getTips, getProjects } from '../lib/api'
import type { Note, Tip, Project } from '../lib/api'
import { useAsync } from '../hooks/useAsync'
import { useCountUp } from '../hooks/useCountUp'
import { containerVariants, itemVariants } from '../components/motionVariants'
import { usePageTitle } from '../hooks/usePageTitle'
import { showcaseAccentText, showcaseAccentBg } from '../lib/showcaseAccents'

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

const features = [
  {
    title: 'Read in-browser',
    description: 'PDFs and DOCX render right on the page — no download-then-open detour.',
    icon: (
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20 M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
    ),
  },
  {
    title: 'Track your progress',
    description: 'Mark notes and tips as done, and watch a real completion bar fill in per topic.',
    icon: <path d="m9 12 2 2 4-4 M21 12a9 9 0 1 1-9-9 9 9 0 0 1 9 9Z" />,
  },
  {
    title: 'Smart related content',
    description: 'Every page links to genuinely related notes, tips, and projects — not just same-category filler.',
    icon: (
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71 M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    ),
  },
  {
    title: 'Works offline',
    description: 'Installable as an app — previously visited pages stay readable without a connection.',
    icon: <path d="M5 12.55a11 11 0 0 1 14.08 0 M1.42 9a16 16 0 0 1 21.16 0 M8.53 16.11a6 6 0 0 1 6.95 0 M12 20h.01" />,
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

function FeatureIcon({ children }: { children: ReactNode }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  )
}

function TrendingRow({ title, meta, viewCount, to }: { title: string; meta: string; viewCount: number; to: string }) {
  return (
    <Link to={to} className="flex items-center gap-3 border-b border-border px-4 py-3 transition-colors last:border-b-0 hover:bg-bg">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-text">{title}</p>
        <p className="mt-0.5 truncate text-xs text-muted">{meta}</p>
      </div>
      <span className="shrink-0 text-xs text-muted">{viewCount} views</span>
    </Link>
  )
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export default function Home() {
  usePageTitle('Home')
  const { data: stats } = useAsync(getStats, [])
  const { data: meta } = useAsync(getMeta, [])
  const { data: top } = useAsync(getTopContent, [])
  const { data: notes } = useAsync(() => getNotes(), [])
  const { data: tips } = useAsync(() => getTips(), [])
  const { data: projects } = useAsync(() => getProjects(), [])
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

  const latest: Array<{ kind: 'note' | 'tip' | 'project'; data: Note | Tip | Project }> = [
    ...(notes ?? []).map((data) => ({ kind: 'note' as const, data })),
    ...(tips ?? []).map((data) => ({ kind: 'tip' as const, data })),
    ...(projects ?? []).map((data) => ({ kind: 'project' as const, data })),
  ]
    .sort((a, b) => new Date(b.data.createdAt).getTime() - new Date(a.data.createdAt).getTime())
    .slice(0, 4)

  const featuredProjects = (projects ?? [])
    .filter((p) => p.featured)
    .sort((a, b) => a.order - b.order)
    .slice(0, 3)

  return (
    <div className="showcase flex flex-col gap-20 sm:gap-24">
      <div className="showcase-bg" aria-hidden="true" />

      {/* Hero */}
      <motion.section ref={heroRef} className="grid items-center gap-10 pt-6 lg:grid-cols-2 lg:gap-6">
        <motion.div style={{ y: textY }} className="flex flex-col items-start gap-6 text-left">
          <motion.span
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="showcase-pill rounded-full px-4 py-1.5 text-xs font-medium"
          >
            Notes · Tips &amp; Tricks · Projects — all in one place
          </motion.span>

          <TypewriterHeading
            lines={headingLines}
            className="font-display text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl"
            accentClassName="showcase-gradient-text"
            accentAsBlock
          />

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 1.5 }}
            className="showcase-muted max-w-md"
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
                className="showcase-cta block rounded-full px-6 py-3 text-sm font-medium"
              >
                Browse Notes
              </Link>
            </motion.div>
            <motion.div whileHover={{ y: -3, scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link to="/projects" className="showcase-cta-outline block rounded-full px-6 py-3 text-sm font-medium">
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
          {sections.map((s, i) => {
            const accentBg = showcaseAccentBg[i % 3]
            const accentText = showcaseAccentText[i % 3]
            return (
              <motion.div key={s.to} variants={itemVariants} whileHover={{ y: -4 }}>
                <Link to={s.to}>
                  <GlassCard variant="showcase" className="h-full px-6 py-8 text-left">
                    <span className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${accentBg}`}>
                      <span className={`h-2.5 w-2.5 rounded-full ${accentText}`} style={{ background: 'currentColor' }} />
                    </span>
                    <h3 className={`mt-3 font-display text-xl font-semibold ${accentText}`}>{s.title}</h3>
                    <p className="showcase-muted mt-2 text-sm">{s.description}</p>
                  </GlassCard>
                </Link>
              </motion.div>
            )
          })}
        </div>
      </motion.section>

      {/* Browse by subject — deep-links straight into a filtered Notes list */}
      {meta && meta.noteSubjects.length > 0 && (
        <motion.section
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={containerVariants}
          className="flex flex-col gap-6"
        >
          <div className="flex items-end justify-between">
            <div>
              <h2 className="font-display text-2xl font-bold sm:text-3xl">Browse by subject</h2>
              <p className="mt-2 text-sm text-muted">Jump straight to the topic you're studying.</p>
            </div>
            <Link to="/notes" className="hidden shrink-0 text-sm font-medium text-accent hover:underline sm:block">
              View all →
            </Link>
          </div>

          <motion.div variants={itemVariants} className="flex flex-wrap gap-2.5">
            {meta.noteSubjects.map((subject) => (
              <Link
                key={subject}
                to={`/notes?subject=${encodeURIComponent(subject)}`}
                className="clay-btn rounded-full px-4 py-2 text-sm font-medium text-text transition-colors hover:text-accent"
              >
                {subject}
              </Link>
            ))}
          </motion.div>
        </motion.section>
      )}

      {/* Trending — real viewCount ranking, not curated */}
      {top && (top.notes.length > 0 || top.tips.length > 0) && (
        <motion.section
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={containerVariants}
          className="flex flex-col gap-6"
        >
          <div className="text-center">
            <h2 className="font-display text-2xl font-bold sm:text-3xl">Trending right now</h2>
            <p className="mt-2 text-sm text-muted">Ranked by actual view count.</p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {top.notes.length > 0 && (
              <motion.div variants={itemVariants} className="overflow-hidden rounded-2xl border border-border bg-surface">
                <p className="border-b border-border px-4 py-3 font-display text-sm font-semibold">Top Notes</p>
                {top.notes.map((n) => (
                  <TrendingRow key={n._id} title={n.title} meta={n.subject} viewCount={n.viewCount} to={`/notes/${n.slug}`} />
                ))}
              </motion.div>
            )}
            {top.tips.length > 0 && (
              <motion.div variants={itemVariants} className="overflow-hidden rounded-2xl border border-border bg-surface">
                <p className="border-b border-border px-4 py-3 font-display text-sm font-semibold">Top Tips</p>
                {top.tips.map((t) => (
                  <TrendingRow key={t._id} title={t.title} meta={t.category} viewCount={t.viewCount} to={`/tips/${t.slug}`} />
                ))}
              </motion.div>
            )}
          </div>
        </motion.section>
      )}

      {/* Featured projects */}
      {featuredProjects.length > 0 && (
        <motion.section
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={containerVariants}
          className="flex flex-col gap-6"
        >
          <div className="flex items-end justify-between">
            <div>
              <h2 className="font-display text-2xl font-bold sm:text-3xl">Featured projects</h2>
              <p className="mt-2 text-sm text-muted">Shipped work — source and live demos.</p>
            </div>
            <Link to="/projects" className="hidden shrink-0 text-sm font-medium text-accent hover:underline sm:block">
              View all →
            </Link>
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            {featuredProjects.map((project, i) => {
              const accentText = showcaseAccentText[i % 3]
              return (
                <motion.div key={project._id} variants={itemVariants} whileHover={{ y: -4, rotate: i % 2 === 0 ? -1 : 1 }}>
                  <Link to={`/projects/${project.slug}`}>
                    <GlassCard variant="showcase" className="flex h-full flex-col gap-2 px-5 py-6">
                      <span className={`h-1.5 w-8 rounded-full ${accentText}`} style={{ background: 'currentColor' }} />
                      <h3 className="mt-1 font-display text-base font-semibold leading-snug">{project.title}</h3>
                      <p className="showcase-muted line-clamp-2 text-sm">{project.description}</p>
                      <div className="mt-auto flex flex-wrap gap-1.5 pt-2">
                        {project.techStack.slice(0, 3).map((tech) => (
                          <span key={tech} className="showcase-pill rounded-full px-2 py-0.5 text-[11px]">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </GlassCard>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        </motion.section>
      )}

      {/* Latest additions — teaser feed, full list lives on What's New */}
      {latest.length > 0 && (
        <motion.section
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={containerVariants}
          className="flex flex-col gap-6"
        >
          <div className="flex items-end justify-between">
            <div>
              <h2 className="font-display text-2xl font-bold sm:text-3xl">Latest additions</h2>
              <p className="mt-2 text-sm text-muted">Freshly added notes, tips, and projects.</p>
            </div>
            <Link to="/whats-new" className="hidden shrink-0 text-sm font-medium text-accent hover:underline sm:block">
              View all →
            </Link>
          </div>

          <motion.div variants={itemVariants} className="overflow-hidden rounded-2xl border border-border bg-surface">
            {latest.map((item) => {
              const to =
                item.kind === 'note' ? `/notes/${item.data.slug}` : item.kind === 'tip' ? `/tips/${item.data.slug}` : `/projects/${item.data.slug}`
              return (
                <Link
                  key={`${item.kind}-${item.data._id}`}
                  to={to}
                  className="flex items-center gap-3 border-b border-border px-4 py-3 transition-colors last:border-b-0 hover:bg-bg"
                >
                  <span className="shrink-0 rounded-md bg-border px-2 py-0.5 text-[11px] capitalize text-muted">{item.kind}</span>
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">{item.data.title}</span>
                  <span className="shrink-0 text-xs text-muted">{formatDate(item.data.createdAt)}</span>
                </Link>
              )
            })}
          </motion.div>
        </motion.section>
      )}

      {/* Why this hub */}
      <motion.section
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
        variants={containerVariants}
        className="flex flex-col gap-6"
      >
        <div className="text-center">
          <h2 className="font-display text-2xl font-bold sm:text-3xl">Why this hub</h2>
          <p className="mt-2 text-sm text-muted">Built to actually be used, not just linked to.</p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => {
            const accentBg = showcaseAccentBg[i % 3]
            const accentText = showcaseAccentText[i % 3]
            return (
              <motion.div key={f.title} variants={itemVariants}>
                <GlassCard variant="showcase" className="flex h-full flex-col gap-3 px-5 py-6">
                  <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${accentBg} ${accentText}`}>
                    <FeatureIcon>{f.icon}</FeatureIcon>
                  </span>
                  <h3 className="font-display text-sm font-semibold">{f.title}</h3>
                  <p className="showcase-muted text-xs">{f.description}</p>
                </GlassCard>
              </motion.div>
            )
          })}
        </div>
      </motion.section>

      {/* Closing CTA */}
      <motion.section
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.4 }}
        variants={itemVariants}
      >
        <GlassCard variant="showcase" className="flex flex-col items-center gap-4 px-8 py-12 text-center sm:py-14">
          <h2 className="font-display text-2xl font-bold sm:text-3xl">Ready to dive in?</h2>
          <p className="showcase-muted max-w-md text-sm">
            Pick up where a subject left off, or browse everything from scratch.
          </p>
          <Link to="/notes" className="showcase-cta rounded-full px-6 py-3 text-sm font-medium">
            Browse Notes
          </Link>
        </GlassCard>
      </motion.section>
    </div>
  )
}
