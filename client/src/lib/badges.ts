export interface LearningStats {
  totalCompleted: number
  subjectCompletion: { subject: string; done: number; total: number }[]
  longestStreak: number
}

export interface Badge {
  id: string
  label: string
  description: string
  check: (stats: LearningStats) => boolean
}

// Client-side derived achievements — deliberately no separate "earned
// badges" storage. Known simplification: if an admin later deletes a
// note/tip a user had completed, a badge that depended on that count
// could theoretically "unearn" itself on next load. Acceptable trade-off
// here; closing that gap fully would mean persisting earned badges
// server-side the moment they're first hit, which is more machinery than
// a resource hub's badge system needs.
export const BADGES: Badge[] = [
  {
    id: 'first-step',
    label: 'First Step',
    description: 'Complete your first note or tip',
    check: (s) => s.totalCompleted >= 1,
  },
  {
    id: 'getting-started',
    label: 'Getting Started',
    description: 'Complete 10 items',
    check: (s) => s.totalCompleted >= 10,
  },
  {
    id: 'half-century',
    label: 'Half Century',
    description: 'Complete 50 items',
    check: (s) => s.totalCompleted >= 50,
  },
  {
    id: 'century-club',
    label: 'Century Club',
    description: 'Complete 100 items',
    check: (s) => s.totalCompleted >= 100,
  },
  {
    id: 'subject-master',
    label: 'Subject Master',
    description: 'Finish every note in a subject',
    check: (s) => s.subjectCompletion.some((sc) => sc.total > 0 && sc.done === sc.total),
  },
  {
    id: 'streak-3',
    label: '3-Day Streak',
    description: 'Study 3 days in a row',
    check: (s) => s.longestStreak >= 3,
  },
  {
    id: 'streak-7',
    label: 'Week Warrior',
    description: 'Study 7 days in a row',
    check: (s) => s.longestStreak >= 7,
  },
  {
    id: 'streak-30',
    label: 'Monthly Master',
    description: 'Study 30 days in a row',
    check: (s) => s.longestStreak >= 30,
  },
]

export function getEarnedBadges(stats: LearningStats): Badge[] {
  return BADGES.filter((b) => b.check(stats))
}
