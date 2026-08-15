import { useState } from 'react'
import { Link } from 'react-router-dom'
import { getNotes, getMeta } from '../lib/api'
import { useAsync } from '../hooks/useAsync'
import { GlassCard } from '../components/ui/Card'
import { Tag } from '../components/ui/Tag'
import { SearchInput } from '../components/ui/SearchInput'
import { FilterChips } from '../components/ui/FilterChips'
import { Loading, ErrorState, EmptyState } from '../components/ui/StateViews'

export default function NotesHub() {
  const [subject, setSubject] = useState('')
  const [search, setSearch] = useState('')

  const { data: meta } = useAsync(getMeta, [])
  const { data: notes, loading, error, refetch } = useAsync(
    () => getNotes({ subject: subject || undefined, search: search || undefined }),
    [subject, search],
  )

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Notes</h1>
        <p className="mt-1 text-sm text-muted">Study notes, organized by subject.</p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <FilterChips options={meta?.noteSubjects ?? []} active={subject} onChange={setSubject} />
        <div className="sm:w-64">
          <SearchInput value={search} onChange={setSearch} placeholder="Search notes…" />
        </div>
      </div>

      {loading && <Loading label="Loading notes…" />}
      {error && <ErrorState message={error} onRetry={refetch} />}
      {!loading && !error && notes && notes.length === 0 && (
        <EmptyState message="No notes match that filter yet." />
      )}

      {!loading && !error && notes && notes.length > 0 && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {notes.map((note) => (
            <Link key={note._id} to={`/notes/${note.slug}`}>
              <GlassCard className="flex h-full flex-col gap-3 px-5 py-6 transition-transform hover:-translate-y-1">
                <Tag variant="notes">{note.subject}</Tag>
                <h2 className="font-display text-lg font-semibold leading-snug">{note.title}</h2>
                <p className="line-clamp-3 text-sm text-muted">{note.description}</p>
                <span className="mt-auto text-xs font-medium text-accent-notes">Read note →</span>
              </GlassCard>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
