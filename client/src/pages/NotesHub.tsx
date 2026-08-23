import { useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { getNotes, getMeta, type Note } from '../lib/api'
import { useAsync } from '../hooks/useAsync'
import { useProgress } from '../context/ProgressContext'
import { DifficultyBadge } from '../components/ui/DifficultyBadge'
import { DifficultySelect } from '../components/ui/DifficultySelect'
import { ProgressCheckbox } from '../components/ProgressCheckbox'
import { ProgressDashboard } from '../components/ProgressDashboard'
import { SearchInput } from '../components/ui/SearchInput'
import { FilterChips } from '../components/ui/FilterChips'
import { ErrorState, EmptyState } from '../components/ui/StateViews'
import { SkeletonRows } from '../components/ui/Skeleton'
import { containerVariants, itemVariants } from '../components/motionVariants'
import { usePageTitle } from '../hooks/usePageTitle'

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <motion.svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      animate={{ rotate: open ? 90 : 0 }}
      transition={{ duration: 0.15 }}
    >
      <path d="m9 18 6-6-6-6" />
    </motion.svg>
  )
}

function ShuffleIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m18 4 3 3-3 3M18 20l3-3-3-3M2 7h3a5 5 0 0 1 4.5 2.79M2 17h3a5 5 0 0 0 4.5-2.79M21 7h-4.5a5 5 0 0 0-4.24 2.34M21 17h-4.5a5 5 0 0 1-4.24-2.34" />
    </svg>
  )
}

function NoteRow({ note }: { note: Note }) {
  return (
    <motion.div variants={itemVariants}>
      <Link
        to={`/notes/${note.slug}`}
        className="flex items-center gap-3 border-b border-border px-3 py-3 transition-colors last:border-b-0 hover:bg-bg sm:gap-4 sm:px-4"
      >
        <ProgressCheckbox type="note" slug={note.slug} />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-medium text-text sm:text-[15px]">{note.title}</h3>
          <p className="mt-0.5 line-clamp-1 text-xs text-muted">{note.description}</p>
        </div>
        <DifficultyBadge difficulty={note.difficulty} />
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="hidden shrink-0 text-muted sm:block">
          <path d="m9 18 6-6-6-6" />
        </svg>
      </Link>
    </motion.div>
  )
}

function SubjectGroup({ subject, notes }: { subject: string; notes: Note[] }) {
  const [open, setOpen] = useState(true)
  const { countCompleted } = useProgress()
  const done = countCompleted(
    'note',
    notes.map((n) => n.slug),
  )

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left"
      >
        <div className="flex items-center gap-2.5">
          <ChevronIcon open={open} />
          <h2 className="font-display text-base font-semibold">{subject}</h2>
          <span className="rounded-full bg-border px-2 py-0.5 text-xs text-muted">{notes.length}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden h-1.5 w-24 overflow-hidden rounded-full bg-border sm:block">
            <div
              className="h-full rounded-full bg-easy transition-all"
              style={{ width: `${notes.length ? (done / notes.length) * 100 : 0}%` }}
            />
          </div>
          <span className="text-xs font-medium text-muted">
            {done}/{notes.length}
          </span>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden border-t border-border"
          >
            {notes.map((note) => (
              <NoteRow key={note._id} note={note} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function NotesHub() {
  usePageTitle('Notes')
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const subject = searchParams.get('subject') ?? ''
  const difficulty = searchParams.get('difficulty') ?? ''
  const [search, setSearch] = useState('')

  function setSubject(next: string) {
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev)
      next ? params.set('subject', next) : params.delete('subject')
      return params
    }, { replace: true })
  }

  function setDifficulty(next: string) {
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev)
      next ? params.set('difficulty', next) : params.delete('difficulty')
      return params
    }, { replace: true })
  }

  const { data: meta } = useAsync(getMeta, [])
  const { data: notes, loading, error, refetch } = useAsync(
    () => getNotes({ subject: subject || undefined, difficulty: difficulty || undefined, search: search || undefined }),
    [subject, difficulty, search],
  )
  // Unfiltered — the "Overall Progress" dashboard and the Random Note button
  // always operate on the whole sheet, independent of whatever subject/
  // difficulty filter is currently narrowing the list below (same behavior
  // as takeuforward's sheet-level progress summary).
  const { data: allNotes } = useAsync(getNotes, [])

  // Grouped by subject so the page reads like a sheet of topics rather than
  // a flat card wall — the group order follows first-appearance in the
  // (already subject-relevant) results rather than re-sorting alphabetically.
  const groups = useMemo(() => {
    if (!notes) return []
    const order: string[] = []
    const bySubject = new Map<string, Note[]>()
    for (const note of notes) {
      if (!bySubject.has(note.subject)) {
        bySubject.set(note.subject, [])
        order.push(note.subject)
      }
      bySubject.get(note.subject)!.push(note)
    }
    return order.map((s) => ({ subject: s, notes: bySubject.get(s)! }))
  }, [notes])

  function goToRandomNote() {
    const pool = allNotes && allNotes.length > 0 ? allNotes : notes
    if (!pool || pool.length === 0) return
    const pick = pool[Math.floor(Math.random() * pool.length)]
    navigate(`/notes/${pick.slug}`)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Notes</h1>
          <p className="mt-1 text-sm text-muted">Study notes, organized by subject.</p>
        </div>
        <button
          onClick={goToRandomNote}
          disabled={!allNotes || allNotes.length === 0}
          className="clay-btn flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-text disabled:opacity-50"
        >
          <ShuffleIcon />
          Random Note
        </button>
      </div>

      {allNotes && allNotes.length > 0 && <ProgressDashboard allNotes={allNotes} />}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <FilterChips options={meta?.noteSubjects ?? []} active={subject} onChange={setSubject} />
          <DifficultySelect options={meta?.difficulties ?? []} value={difficulty} onChange={setDifficulty} />
        </div>
        <div className="sm:w-64">
          <SearchInput value={search} onChange={setSearch} placeholder="Search notes…" />
        </div>
      </div>

      {loading && <SkeletonRows />}
      {error && <ErrorState message={error} onRetry={refetch} />}
      {!loading && !error && notes && notes.length === 0 && (
        <EmptyState message="No notes match that filter yet." />
      )}

      {!loading && !error && groups.length > 0 && (
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="flex flex-col gap-4">
          {groups.map((group) => (
            <SubjectGroup key={group.subject} subject={group.subject} notes={group.notes} />
          ))}
        </motion.div>
      )}
    </div>
  )
}
