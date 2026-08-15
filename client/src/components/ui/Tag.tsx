import type { ReactNode } from 'react'

export type TagVariant = 'notes' | 'tips' | 'projects' | 'neutral'

const variantClasses: Record<TagVariant, string> = {
  notes: 'bg-accent-notes/15 text-accent-notes',
  tips: 'bg-accent-tips/15 text-accent-tips',
  projects: 'bg-accent-projects/15 text-accent-projects',
  neutral: 'bg-border text-muted',
}

export function Tag({ children, variant = 'neutral' }: { children: ReactNode; variant?: TagVariant }) {
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${variantClasses[variant]}`}>
      {children}
    </span>
  )
}
