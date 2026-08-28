import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { getNotes, getTips, getStreak } from '../lib/api'
import { useAsync } from '../hooks/useAsync'
import { useAccount } from '../context/AccountContext'
import { useLearningStats } from '../hooks/useLearningStats'
import { getEarnedBadges, BADGES } from '../lib/badges'
import { GlassCard } from '../components/ui/Card'
import { Loading, ErrorState } from '../components/ui/StateViews'
import { usePageTitle } from '../hooks/usePageTitle'

const HEATMAP_WEEKS = 18

// GitHub-style contribution grid: HEATMAP_WEEKS columns x 7 rows, most
// recent day bottom-right, oldest top-left, built from the account's raw
// activeDates rather than a canned "last N days" range — so it lines up
// on real calendar weeks (Sunday-start columns) instead of an arbitrary
// rolling window.
function ActivityHeatmap({ activeDates }: { activeDates: string[] }) {
  const activeSet = useMemo(() => new Set(activeDates), [activeDates])

  const days = useMemo(() => {
    const today = new Date()
    today.setUTCHours(0, 0, 0, 0)
    // Walk back to the most recent Sunday so columns align to real weeks.
    const end = new Date(today)
    end.setUTCDate(end.getUTCDate() - end.getUTCDay())
    const totalDays = HEATMAP_WEEKS * 7
    const start = new Date(end)
    start.setUTCDate(start.getUTCDate() - (totalDays - 7))

    const list: { date: string; active: boolean; isFuture: boolean }[] = []
    for (let i = 0; i < totalDays; i++) {
      const d = new Date(start)
      d.setUTCDate(start.getUTCDate() + i)
      const iso = d.toISOString().slice(0, 10)
      list.push({ date: iso, active: activeSet.has(iso), isFuture: d > today })
    }
    return list
  }, [activeSet])

  // Group into columns of 7 (Sun-Sat) for the CSS grid.
  const columns: typeof days[] = []
  for (let i = 0; i < days.length; i += 7) columns.push(days.slice(i, i + 7))

  return (
    <div className="flex gap-1 overflow-x-auto pb-1">
      {columns.map((col, ci) => (
        <div key={ci} className="flex flex-col gap-1">
          {col.map((day) => (
            <div
              key={day.date}
              title={day.isFuture ? undefined : day.date}
              className={`h-3 w-3 rounded-[2px] ${
                day.isFuture
                  ? 'bg-transparent'
                  : day.active
                    ? 'bg-accent'
                    : 'bg-gray-200 dark:bg-gray-700'
              }`}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

function StatCard({ label, value, sublabel }: { label: string; value: string | number; sublabel?: string }) {
  return (
    <GlassCard className="flex flex-col gap-1 px-5 py-4">
      <span className="text-xs uppercase tracking-wide text-muted">{label}</span>
      <span className="font-display text-3xl font-bold">{value}</span>
      {sublabel && <span className="text-xs text-muted">{sublabel}</span>}
    </GlassCard>
  )
}

export default function Achievements() {
  usePageTitle('Achievements')
  const { status, user } = useAccount()

  const { data: notes, loading: notesLoading, error: notesError, refetch: refetchNotes } = useAsync(getNotes, [])
  const { data: tips, loading: tipsLoading, error: tipsError, refetch: refetchTips } = useAsync(getTips, [])
  const { data: streak, loading: streakLoading, error: streakError, refetch: refetchStreak } = useAsync(
    getStreak,
    [status],
  )

  const stats = useLearningStats(notes ?? [], tips ?? [])

  if (status === 'checking') return <Loading label="Checking session…" />

  if (status === 'signed-out') {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <h1 className="font-display text-2xl font-bold">Achievements</h1>
        <p className="max-w-sm text-sm text-muted">
          Sign in to track your streak, XP, and badges — none of this exists for anonymous browsing since there's
          nowhere to persist it across visits.
        </p>
        <Link to="/signin" className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white">
          Sign in
        </Link>
      </div>
    )
  }

  const loading = notesLoading || tipsLoading || streakLoading
  const error = notesError || tipsError || streakError

  if (loading) return <Loading label="Loading your progress…" />
  if (error) {
    return (
      <ErrorState
        message={error}
        onRetry={() => {
          refetchNotes()
          refetchTips()
          refetchStreak()
        }}
      />
    )
  }

  const earnedIds = new Set(getEarnedBadges({ ...stats, longestStreak: streak?.longest ?? 0 }).map((b) => b.id))

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-3xl font-bold">Achievements</h1>
        <p className="mt-1 text-sm text-muted">{user?.name}'s learning activity, all in one place.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Current Streak" value={streak?.current ?? 0} sublabel="days in a row" />
        <StatCard label="Longest Streak" value={streak?.longest ?? 0} sublabel="personal best" />
        <StatCard label="Total XP" value={stats.xp} sublabel={`${stats.totalCompleted} items completed`} />
      </div>

      <GlassCard className="flex flex-col gap-3 px-5 py-5">
        <h2 className="font-display text-sm font-semibold">Activity</h2>
        <ActivityHeatmap activeDates={streak?.activeDates ?? []} />
        <p className="text-xs text-muted">Each square is a day you marked something complete.</p>
      </GlassCard>

      {stats.subjectCompletion.length > 0 && (
        <GlassCard className="flex flex-col gap-4 px-5 py-5">
          <h2 className="font-display text-sm font-semibold">Subject Progress</h2>
          <div className="flex flex-col gap-3">
            {stats.subjectCompletion.map((sc) => {
              const pct = sc.total > 0 ? Math.round((sc.done / sc.total) * 100) : 0
              return (
                <div key={sc.subject} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium">{sc.subject}</span>
                    <span className="text-muted">
                      {sc.done}/{sc.total}
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-border/60">
                    <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </GlassCard>
      )}

      <div>
        <h2 className="font-display text-lg font-semibold">Badges</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {BADGES.map((badge) => {
            const earned = earnedIds.has(badge.id)
            return (
              <GlassCard
                key={badge.id}
                className={`flex flex-col gap-1 px-4 py-4 ${earned ? '' : 'opacity-40 grayscale'}`}
              >
                <span className="text-2xl">{earned ? '🏆' : '🔒'}</span>
                <span className="font-display text-sm font-semibold">{badge.label}</span>
                <span className="text-xs text-muted">{badge.description}</span>
              </GlassCard>
            )
          })}
        </div>
      </div>
    </div>
  )
}
