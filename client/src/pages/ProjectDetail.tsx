import { useParams, Link } from 'react-router-dom'
import { getProjectBySlug } from '../lib/api'
import { useAsync } from '../hooks/useAsync'
import { usePageTitle } from '../hooks/usePageTitle'
import { useViewTracking } from '../hooks/useViewTracking'
import { ClayCard } from '../components/ui/Card'
import { Tag } from '../components/ui/Tag'
import { ShareButton } from '../components/ShareButton'
import { BookmarkButton } from '../components/BookmarkButton'
import { Loading, ErrorState } from '../components/ui/StateViews'

export default function ProjectDetail() {
  const { slug } = useParams<{ slug: string }>()
  const { data: project, loading, error, refetch } = useAsync(() => getProjectBySlug(slug!), [slug])
  usePageTitle(project?.title ?? 'Projects')
  useViewTracking('projects', slug)

  if (loading) return <Loading label="Loading project…" />
  if (error) return <ErrorState message={error} onRetry={refetch} />
  if (!project) return null

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <Link to="/projects" className="w-fit text-sm text-muted hover:text-text">
          ← Back to Projects
        </Link>
        <div className="flex gap-2">
          <BookmarkButton
            type="project"
            slug={project.slug}
            title={project.title}
            subtitle={project.techStack.slice(0, 3).join(', ')}
          />
          <ShareButton />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Tag variant="projects">{project.status}</Tag>
          {project.featured && <Tag variant="neutral">Featured</Tag>}
        </div>
        <h1 className="font-display text-3xl font-bold">{project.title}</h1>
        <p className="text-muted">{project.description}</p>

        <div className="flex flex-wrap gap-1.5">
          {project.techStack.map((tech) => (
            <span key={tech} className="rounded-full bg-border px-2.5 py-0.5 text-xs text-muted">
              {tech}
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <a
          href={project.githubUrl}
          target="_blank"
          rel="noreferrer"
          className="clay-btn rounded-full px-5 py-2.5 text-sm font-medium text-text"
        >
          View on GitHub
        </a>
        {project.liveUrl && (
          <a
            href={project.liveUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-full bg-accent-projects px-5 py-2.5 text-sm font-medium text-white"
          >
            Open Live Demo
          </a>
        )}
        <span className="text-xs text-muted">
          {project.viewCount} view{project.viewCount === 1 ? '' : 's'}
        </span>
      </div>

      {project.coverImageUrl && (
        <ClayCard className="overflow-hidden p-0">
          <img src={project.coverImageUrl} alt={`${project.title} screenshot`} className="w-full" />
        </ClayCard>
      )}
    </div>
  )
}
