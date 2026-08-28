const DAY_MS = 24 * 60 * 60 * 1000

function toUTCDate(dateStr) {
  return new Date(`${dateStr}T00:00:00.000Z`)
}

export function todayUTC() {
  return new Date().toISOString().slice(0, 10)
}

// dates: array of 'YYYY-MM-DD' strings, any order, duplicates tolerated
// (the ActivityLog unique index prevents real duplicates, but this stays
// correct even if a caller — like a test — passes messy input).
//
// "Current streak" only counts if the most recent activity day is today
// or yesterday — a streak that ended two or more days ago is broken (0),
// even if there's a long historical run sitting in the data. Yesterday
// still counts as "current" (not yet broken) because the visitor still
// has today left to act before it actually breaks.
export function computeStreaks(dates, todayStr = todayUTC()) {
  const uniqueSorted = [...new Set(dates)].sort() // 'YYYY-MM-DD' sorts lexicographically == chronologically
  if (uniqueSorted.length === 0) return { current: 0, longest: 0 }

  let longest = 1
  let run = 1
  for (let i = 1; i < uniqueSorted.length; i++) {
    const diffDays = (toUTCDate(uniqueSorted[i]) - toUTCDate(uniqueSorted[i - 1])) / DAY_MS
    run = diffDays === 1 ? run + 1 : 1
    longest = Math.max(longest, run)
  }

  const mostRecent = uniqueSorted[uniqueSorted.length - 1]
  const gapFromToday = (toUTCDate(todayStr) - toUTCDate(mostRecent)) / DAY_MS
  if (gapFromToday > 1) return { current: 0, longest }

  let current = 1
  for (let i = uniqueSorted.length - 1; i > 0; i--) {
    const diffDays = (toUTCDate(uniqueSorted[i]) - toUTCDate(uniqueSorted[i - 1])) / DAY_MS
    if (diffDays === 1) current++
    else break
  }

  return { current, longest }
}
