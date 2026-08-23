import { useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { getTips, getMeta, type Tip } from '../lib/api'
import { useAsync } from '../hooks/useAsync'
import { useProgress } from '../context/ProgressContext'
import { ProgressCheckbox } from '../components/ProgressCheckbox'
import { SimpleProgressSummary } from '../components/SimpleProgressSummary'
import { estimateReadingTime } from '../lib/readingTime'
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

function TipRow({ tip }: { tip: Tip }) {
  const readingTime = tip.contentMarkdown ? estimateReadingTime(tip.contentMarkdown) : null
  return (
    <motion.div variants={itemVariants}>
      <Link
        to={`/tips/${tip.slug}`}
        className="flex items-center gap-3 border-b border-border px-3 py-3 transition-colors last:border-b-0 hover:bg-bg sm:gap-4 sm:px-4"
      >
        <ProgressCheckbox type="tip" slug={tip.slug} />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-medium text-text sm:text-[15px]">{tip.title}</h3>
          <p className="mt-0.5 line-clamp-1 text-xs text-muted">{tip.summary}</p>
        </div>
        {readingTime && (
          <span className="hidden shrink-0 text-xs text-muted sm:block">{readingTime} min</span>
        )}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="hidden shrink-0 text-muted sm:block">
          <path d="m9 18 6-6-6-6" />
        </svg>
      </Link>
    </motion.div>
  )
}

function CategoryGroup({ category, tips }: { category: string; tips: Tip[] }) {
  const [open, setOpen] = useState(true)
  const { countCompleted } = useProgress()
  const done = countCompleted(
    'tip',
    tips.map((t) => t.slug),
  )

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left"
      >
        <div className="flex items-center gap-2.5">
          <ChevronIcon open={open} />
          <h2 className="font-display text-base font-semibold">{category}</h2>
          <span className="rounded-full bg-border px-2 py-0.5 text-xs text-muted">{tips.length}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden h-1.5 w-24 overflow-hidden rounded-full bg-border sm:block">
            <div
              className="h-full rounded-full bg-easy transition-all"
              style={{ width: `${tips.length ? (done / tips.length) * 100 : 0}%` }}
            />
          </div>
          <span className="text-xs font-medium text-muted">
            {done}/{tips.length}
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
            {tips.map((tip) => (
              <TipRow key={tip._id} tip={tip} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function TipsHub() {
  usePageTitle('Tips')
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const category = searchParams.get('category') ?? ''
  const [search, setSearch] = useState('')

  function setCategory(next: string) {
    setSearchParams(next ? { category: next } : {}, { replace: true })
  }

  const { data: meta } = useAsync(getMeta, [])
  const { data: tips, loading, error, refetch } = useAsync(
    () => getTips({ category: category || undefined, search: search || undefined }),
    [category, search],
  )
  // Unfiltered — same reasoning as NotesHub: the progress summary and
  // Random Tip button always operate on the whole set, not the current filter.
  const { data: allTips } = useAsync(getTips, [])

  const groups = useMemo(() => {
    if (!tips) return []
    const order: string[] = []
    const byCategory = new Map<string, Tip[]>()
    for (const tip of tips) {
      if (!byCategory.has(tip.category)) {
        byCategory.set(tip.category, [])
        order.push(tip.category)
      }
      byCategory.get(tip.category)!.push(tip)
    }
    return order.map((c) => ({ category: c, tips: byCategory.get(c)! }))
  }, [tips])

  function goToRandomTip() {
    const pool = allTips && allTips.length > 0 ? allTips : tips
    if (!pool || pool.length === 0) return
    const pick = pool[Math.floor(Math.random() * pool.length)]
    navigate(`/tips/${pick.slug}`)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Tips</h1>
          <p className="mt-1 text-sm text-muted">Quick tips & tricks, organized by category.</p>
        </div>
        <button
          onClick={goToRandomTip}
          disabled={!allTips || allTips.length === 0}
          className="clay-btn flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-text disabled:opacity-50"
        >
          <ShuffleIcon />
          Random Tip
        </button>
      </div>

      {allTips && allTips.length > 0 && <SimpleProgressSummary allTips={allTips} />}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <FilterChips options={meta?.tipCategories ?? []} active={category} onChange={setCategory} />
        <div className="sm:w-64">
          <SearchInput value={search} onChange={setSearch} placeholder="Search tips…" />
        </div>
      </div>

      {loading && <SkeletonRows />}
      {error && <ErrorState message={error} onRetry={refetch} />}
      {!loading && !error && tips && tips.length === 0 && (
        <EmptyState message="No tips match that filter yet." />
      )}

      {!loading && !error && groups.length > 0 && (
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="flex flex-col gap-4">
          {groups.map((group) => (
            <CategoryGroup key={group.category} category={group.category} tips={group.tips} />
          ))}
        </motion.div>
      )}
    </div>
  )
}
