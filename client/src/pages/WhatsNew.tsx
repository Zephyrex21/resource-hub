import { Link } from 'react-router-dom'
import { getNotes, getTips, getProjects } from '../lib/api'
import type { Note, Tip, Project } from '../lib/api'
import { useAsync } from '../hooks/useAsync'
import { usePageTitle } from '../hooks/usePageTitle'
import { GlassCard } from '../components/ui/Card'
import { Tag } from '../components/ui/Tag'
import { Loading, ErrorState, EmptyState } from '../components/ui/StateViews'

type FeedItem =
  | { kind: 'note'; data: Note }
  | { kind: 'tip'; data: Tip }
  | { kind: 'project'; data: Project }

function feedLink(item: FeedItem): string {
  if (item.kind === 'note') return `/notes/${item.data.slug}`
  if (item.kind === 'tip') return `/tips/${item.data.slug}`
  return `/projects/${item.data.slug}`
}

function feedMeta(item: FeedItem): { badge: string; variant: 'notes' | 'tips' | 'projects' } {
  if (item.kind === 'note') return { badge: item.data.subject, variant: 'notes' }
  if (item.kind === 'tip') return { badge: item.data.category, variant: 'tips' }
  return { badge: item.data.status, variant: 'projects' }
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function WhatsNew() {
  usePageTitle("What's New")

  const { data: notes, loading: notesLoading, error: notesError } = useAsync(() => getNotes(), [])
  const { data: tips, loading: tipsLoading, error: tipsError } = useAsync(() => getTips(), [])
  const { data: projects, loading: projectsLoading, error: projectsError } = useAsync(() => getProjects(), [])

  const loading = notesLoading || tipsLoading || projectsLoading
  const error = notesError || tipsError || projectsError

  const items: FeedItem[] = [
    ...(notes ?? []).map((data): FeedItem => ({ kind: 'note', data })),
    ...(tips ?? []).map((data): FeedItem => ({ kind: 'tip', data })),
    ...(projects ?? []).map((data): FeedItem => ({ kind: 'project', data })),
  ].sort((a, b) => new Date(b.data.createdAt).getTime() - new Date(a.data.createdAt).getTime())

  const recent = items.slice(0, 20)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl font-bold">What's New</h1>
        <p className="mt-1 text-sm text-muted">The most recently added notes, tips, and projects.</p>
      </div>

      {loading && <Loading label="Loading…" />}
      {error && <ErrorState message={error} />}
      {!loading && !error && recent.length === 0 && <EmptyState message="Nothing here yet." />}

      {!loading && !error && recent.length > 0 && (
        <div className="flex flex-col gap-3">
          {recent.map((item) => {
            const meta = feedMeta(item)
            return (
              <Link key={`${item.kind}-${item.data._id}`} to={feedLink(item)}>
                <GlassCard className="flex flex-wrap items-center gap-3 px-5 py-4 transition-colors hover:bg-bg">
                  <Tag variant={meta.variant}>{meta.badge}</Tag>
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">{item.data.title}</span>
                  <span className="shrink-0 text-xs capitalize text-muted">{item.kind}</span>
                  <span className="shrink-0 text-xs text-muted">{formatDate(item.data.createdAt)}</span>
                </GlassCard>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
