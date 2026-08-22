const LABEL: Record<string, string> = {
  beginner: 'Easy',
  intermediate: 'Medium',
  advanced: 'Hard',
}

const CLASSES: Record<string, string> = {
  beginner: 'bg-easy/10 text-easy',
  intermediate: 'bg-medium/10 text-medium',
  advanced: 'bg-hard/10 text-hard',
}

// Maps the existing beginner/intermediate/advanced difficulty field to the
// Easy/Medium/Hard green/amber/red badge that's the most recognizable single
// visual element on takeuforward's problem sheets.
export function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const label = LABEL[difficulty] ?? difficulty
  const className = CLASSES[difficulty] ?? 'bg-border text-muted'
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${className}`}>
      {label}
    </span>
  )
}
