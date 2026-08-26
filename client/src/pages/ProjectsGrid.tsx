import { useSearchParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getProjects, getMeta } from '../lib/api'
import { useAsync } from '../hooks/useAsync'
import { GlassCard } from '../components/ui/Card'
import { Tag } from '../components/ui/Tag'
import { FilterChips } from '../components/ui/FilterChips'
import { ErrorState, EmptyState } from '../components/ui/StateViews'
import { SkeletonGrid } from '../components/ui/Skeleton'
import { containerVariants, itemVariants } from '../components/motionVariants'
import { usePageTitle } from '../hooks/usePageTitle'
import { showcaseAccentText, showcaseAccentBg } from '../lib/showcaseAccents'

export default function ProjectsGrid() {
  usePageTitle('Projects')
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const status = searchParams.get('status') ?? ''

  function setStatus(next: string) {
    setSearchParams(next ? { status: next } : {}, { replace: true })
  }

  const { data: meta } = useAsync(getMeta, [])
  const { data: projects, loading, error, refetch } = useAsync(
    () => getProjects({ status: status || undefined }),
    [status],
  )

  const sorted = projects ? [...projects].sort((a, b) => a.order - b.order) : null

  return (
    <div className="showcase flex flex-col gap-6">
      <div className="showcase-bg" aria-hidden="true" />

      <div>
        <h1 className="font-display text-3xl font-bold">Projects</h1>
        <p className="showcase-muted mt-1 text-sm">Real, shipped work — source and live demos.</p>
      </div>

      <FilterChips options={meta?.projectStatuses ?? []} active={status} onChange={setStatus} />

      {loading && <SkeletonGrid />}
      {error && <ErrorState message={error} onRetry={refetch} />}
      {!loading && !error && sorted && sorted.length === 0 && (
        <EmptyState message="No projects match that filter yet." />
      )}

      {!loading && !error && sorted && sorted.length > 0 && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {sorted.map((project, i) => {
            // Cycle each card through the three showcase glow families —
            // variety per card without breaking the shared card structure.
            const accentBg = showcaseAccentBg[i % 3]
            const accentText = showcaseAccentText[i % 3]
            // Cards fan out on hover only — a full-time tilt across a grid
            // of many cards reads chaotic; DesignCode itself only fans
            // depth where there are 2-3 items (hero, pricing), not a grid.
            const hoverRotate = i % 2 === 0 ? -1.5 : 1.5

            return (
              <motion.div key={project._id} variants={itemVariants} whileHover={{ y: -5, rotate: hoverRotate }}>
                <GlassCard
                  variant="showcase"
                  onClick={() => navigate(`/projects/${project.slug}`)}
                  className="flex h-full cursor-pointer flex-col gap-3 overflow-hidden px-5 py-6"
                >
                  <div className={`-mx-5 -mt-6 h-1.5 ${accentBg}`} />

                  <div className="flex items-center justify-between">
                    <Tag variant="projects">{project.status}</Tag>
                    {project.featured && <Tag variant="neutral">Featured</Tag>}
                  </div>

                  <h2 className="font-display text-lg font-semibold leading-snug">{project.title}</h2>
                  <p className="showcase-muted text-sm">{project.description}</p>

                  <div className="flex flex-wrap gap-1.5">
                    {project.techStack.map((tech) => (
                      <span key={tech} className={`rounded-full px-2.5 py-0.5 text-[11px] ${accentBg} ${accentText}`}>
                        {tech}
                      </span>
                    ))}
                  </div>

                  {/* stopPropagation so these external links don't also trigger the card's own navigate() */}
                  <div className="mt-auto flex gap-3 pt-2" onClick={(e) => e.stopPropagation()}>
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="showcase-cta-outline flex-1 rounded-full px-4 py-2 text-center text-sm font-medium"
                    >
                      GitHub
                    </a>
                    {project.liveUrl && (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="showcase-cta flex-1 rounded-full px-4 py-2 text-center text-sm font-medium"
                      >
                        Live
                      </a>
                    )}
                  </div>
                </GlassCard>
              </motion.div>
            )
          })}
        </motion.div>
      )}
    </div>
  )
}
