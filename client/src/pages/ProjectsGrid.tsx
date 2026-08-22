import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getProjects } from '../lib/api'
import { useAsync } from '../hooks/useAsync'
import { GlassCard } from '../components/ui/Card'
import { Tag } from '../components/ui/Tag'
import { ErrorState, EmptyState } from '../components/ui/StateViews'
import { SkeletonGrid } from '../components/ui/Skeleton'
import { containerVariants, itemVariants } from '../components/motionVariants'
import { usePageTitle } from '../hooks/usePageTitle'

export default function ProjectsGrid() {
  usePageTitle('Projects')
  const navigate = useNavigate()
  const { data: projects, loading, error, refetch } = useAsync(() => getProjects(), [])

  const sorted = projects ? [...projects].sort((a, b) => a.order - b.order) : null

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Projects</h1>
        <p className="mt-1 text-sm text-muted">Real, shipped work — source and live demos.</p>
      </div>

      {loading && <SkeletonGrid />}
      {error && <ErrorState message={error} onRetry={refetch} />}
      {!loading && !error && sorted && sorted.length === 0 && (
        <EmptyState message="No projects yet." />
      )}

      {!loading && !error && sorted && sorted.length > 0 && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {sorted.map((project) => (
            <motion.div key={project._id} variants={itemVariants}>
              <GlassCard
                onClick={() => navigate(`/projects/${project.slug}`)}
                className="flex h-full cursor-pointer flex-col gap-3 px-5 py-6 transition-shadow hover:shadow-[var(--card-shadow-hover)]"
              >
                <div className="flex items-center justify-between">
                  <Tag variant="projects">{project.status}</Tag>
                  {project.featured && <Tag variant="neutral">Featured</Tag>}
                </div>

                <h2 className="font-display text-lg font-semibold leading-snug">{project.title}</h2>
                <p className="text-sm text-muted">{project.description}</p>

                <div className="flex flex-wrap gap-1.5">
                  {project.techStack.map((tech) => (
                    <span key={tech} className="rounded-full bg-border px-2.5 py-0.5 text-[11px] text-muted">
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
                    className="clay-btn flex-1 rounded-full px-4 py-2 text-center text-sm font-medium text-text"
                  >
                    GitHub
                  </a>
                  {project.liveUrl && (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 rounded-full bg-accent px-4 py-2 text-center text-sm font-medium text-white"
                    >
                      Live
                    </a>
                  )}
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  )
}
