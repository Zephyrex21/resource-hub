import { useMemo } from 'react'
import type { Note, Tip } from '../lib/api'
import { useProgress } from '../context/ProgressContext'

// Difficulty-weighted so a hard note is worth more than an easy one —
// otherwise XP would just be a restatement of the completion count.
const DIFFICULTY_XP: Record<Note['difficulty'], number> = {
  beginner: 10,
  intermediate: 20,
  advanced: 30,
}
const TIP_XP = 10

export interface SubjectCompletion {
  subject: string
  done: number
  total: number
}

export interface LearningStats {
  totalCompleted: number
  xp: number
  subjectCompletion: SubjectCompletion[]
}

// Entirely derived from data the app already fetches elsewhere (full
// notes/tips lists + the completed-items set) — no dedicated backend
// endpoint needed for XP or per-subject breakdown, unlike streaks, which
// need a real historical log the client can't reconstruct on its own.
export function useLearningStats(allNotes: Note[], allTips: Tip[]): LearningStats {
  const { isCompleted } = useProgress()

  return useMemo(() => {
    let xp = 0
    let totalCompleted = 0
    const bySubject = new Map<string, { done: number; total: number }>()

    for (const note of allNotes) {
      const entry = bySubject.get(note.subject) ?? { done: 0, total: 0 }
      entry.total += 1
      if (isCompleted('note', note.slug)) {
        entry.done += 1
        totalCompleted += 1
        xp += DIFFICULTY_XP[note.difficulty] ?? 10
      }
      bySubject.set(note.subject, entry)
    }

    for (const tip of allTips) {
      if (isCompleted('tip', tip.slug)) {
        totalCompleted += 1
        xp += TIP_XP
      }
    }

    const subjectCompletion: SubjectCompletion[] = Array.from(bySubject.entries()).map(([subject, v]) => ({
      subject,
      ...v,
    }))

    return { totalCompleted, xp, subjectCompletion }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allNotes, allTips, isCompleted])
}
