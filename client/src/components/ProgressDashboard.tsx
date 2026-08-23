import { useMemo } from 'react'
import type { Note } from '../lib/api'
import { useProgress } from '../context/ProgressContext'

const DIFFICULTY_META: Array<{ key: Note['difficulty']; label: string; color: string }> = [
  { key: 'beginner', label: 'Easy', color: 'text-easy' },
  { key: 'intermediate', label: 'Medium', color: 'text-medium' },
  { key: 'advanced', label: 'Hard', color: 'text-hard' },
]

interface ProgressDashboardProps {
  allNotes: Note[]
}

// Mirrors takeuforward's sheet-page header: a big overall percentage, a
// fraction, and an Easy/Medium/Hard breakdown row. Deliberately computed
// from the *unfiltered* full note list (passed in separately from whatever
// subject/difficulty filter is currently applied to the accordion below) —
// on their site this summary always reflects the whole sheet, not just the
// currently-filtered view.
export function ProgressDashboard({ allNotes }: ProgressDashboardProps) {
  const { countCompleted } = useProgress()

  const { totalDone, total, byDifficulty } = useMemo(() => {
    const allSlugs = allNotes.map((n) => n.slug)
    const done = countCompleted('note', allSlugs)

    const breakdown = DIFFICULTY_META.map(({ key, label, color }) => {
      const slugsForDifficulty = allNotes.filter((n) => n.difficulty === key).map((n) => n.slug)
      return {
        label,
        color,
        done: countCompleted('note', slugsForDifficulty),
        total: slugsForDifficulty.length,
      }
    })

    return { totalDone: done, total: allSlugs.length, byDifficulty: breakdown }
  }, [allNotes, countCompleted])

  const pct = total > 0 ? Math.round((totalDone / total) * 100) : 0

  if (total === 0) return null

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-surface px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-4 border-easy/25">
          <span className="font-display text-lg font-bold">{pct}%</span>
        </div>
        <div>
          <p className="font-display text-base font-semibold">Overall Progress</p>
          <p className="text-sm text-muted">
            {totalDone} / {total} done
          </p>
        </div>
      </div>

      <div className="flex gap-5">
        {byDifficulty.map((d) => (
          <div key={d.label} className="text-center">
            <p className={`font-display text-lg font-bold ${d.color}`}>
              {d.done}/{d.total}
            </p>
            <p className="text-xs text-muted">{d.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
