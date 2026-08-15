import { useState } from 'react'
import { Link } from 'react-router-dom'
import { getTips, getMeta } from '../lib/api'
import { useAsync } from '../hooks/useAsync'
import { GlassCard } from '../components/ui/Card'
import { Tag } from '../components/ui/Tag'
import { SearchInput } from '../components/ui/SearchInput'
import { FilterChips } from '../components/ui/FilterChips'
import { Loading, ErrorState, EmptyState } from '../components/ui/StateViews'

export default function TipsHub() {
  const [category, setCategory] = useState('')
  const [search, setSearch] = useState('')

  const { data: meta } = useAsync(getMeta, [])
  const { data: tips, loading, error, refetch } = useAsync(
    () => getTips({ category: category || undefined, search: search || undefined }),
    [category, search],
  )

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Tips &amp; Tricks</h1>
        <p className="mt-1 text-sm text-muted">Practical how-tos and quick fixes.</p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <FilterChips options={meta?.tipCategories ?? []} active={category} onChange={setCategory} />
        <div className="sm:w-64">
          <SearchInput value={search} onChange={setSearch} placeholder="Search tips…" />
        </div>
      </div>

      {loading && <Loading label="Loading tips…" />}
      {error && <ErrorState message={error} onRetry={refetch} />}
      {!loading && !error && tips && tips.length === 0 && (
        <EmptyState message="No tips match that filter yet." />
      )}

      {!loading && !error && tips && tips.length > 0 && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {tips.map((tip) => (
            <Link key={tip._id} to={`/tips/${tip.slug}`}>
              <GlassCard className="flex h-full flex-col gap-3 px-5 py-6 transition-transform hover:-translate-y-1">
                <Tag variant="tips">{tip.category}</Tag>
                <h2 className="font-display text-lg font-semibold leading-snug">{tip.title}</h2>
                <p className="line-clamp-3 text-sm text-muted">{tip.summary}</p>
                <span className="mt-auto text-xs font-medium text-accent-tips">Read guide →</span>
              </GlassCard>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
