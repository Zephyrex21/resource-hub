import { Link } from 'react-router-dom'
import { getTopContent } from '../../lib/api'
import { useAsync } from '../../hooks/useAsync'
import { GlassCard } from '../../components/ui/Card'
import { Loading, ErrorState, EmptyState } from '../../components/ui/StateViews'

const sections = [
  { key: 'notes', label: 'Top Notes', path: '/notes', metaKey: 'subject' as const },
  { key: 'tips', label: 'Top Tips', path: '/tips', metaKey: 'category' as const },
  { key: 'projects', label: 'Top Projects', path: '/projects', metaKey: 'status' as const },
]

export function AnalyticsPanel() {
  const { data: top, loading, error, refetch } = useAsync(getTopContent, [])

  if (loading) return <Loading label="Loading analytics…" />
  if (error || !top) return <ErrorState message={error ?? 'Failed to load'} onRetry={refetch} />

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {sections.map((section) => {
        const items = top[section.key as keyof typeof top]
        return (
          <div key={section.key}>
            <h2 className="mb-3 font-display text-lg font-semibold">{section.label}</h2>
            {items.length === 0 ? (
              <EmptyState message="No views yet." />
            ) : (
              <div className="flex flex-col gap-2">
                {items.map((item) => (
                  <Link key={item._id} to={`${section.path}/${item.slug}`}>
                    <GlassCard className="flex items-center justify-between gap-3 px-4 py-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{item.title}</p>
                        <p className="truncate text-xs text-muted">
                          {(item as { subject?: string; category?: string; status?: string })[section.metaKey]}
                        </p>
                      </div>
                      <span className="shrink-0 text-xs font-medium text-accent">
                        {item.viewCount} view{item.viewCount === 1 ? '' : 's'}
                      </span>
                    </GlassCard>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
