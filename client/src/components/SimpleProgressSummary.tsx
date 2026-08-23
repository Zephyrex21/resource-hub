import { useMemo } from 'react'
import type { Tip } from '../lib/api'
import { useProgress } from '../context/ProgressContext'

interface SimpleProgressSummaryProps {
  allTips: Tip[]
}

// Same visual language as ProgressDashboard (used on Notes), scaled down for
// Tips, which has no difficulty field to break down — just the ring + count.
export function SimpleProgressSummary({ allTips }: SimpleProgressSummaryProps) {
  const { countCompleted } = useProgress()

  const { totalDone, total } = useMemo(() => {
    const slugs = allTips.map((t) => t.slug)
    return { totalDone: countCompleted('tip', slugs), total: slugs.length }
  }, [allTips, countCompleted])

  if (total === 0) return null

  const pct = Math.round((totalDone / total) * 100)

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-border bg-surface px-5 py-5 sm:px-6">
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
  )
}
