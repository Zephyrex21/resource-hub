import { useProgress, type ProgressType } from '../context/ProgressContext'

interface ProgressCheckboxProps {
  type: ProgressType
  slug: string
  size?: 'sm' | 'md'
}

export function ProgressCheckbox({ type, slug, size = 'sm' }: ProgressCheckboxProps) {
  const { isCompleted, toggleCompleted } = useProgress()
  const done = isCompleted(type, slug)
  const dimensions = size === 'sm' ? 'h-5 w-5' : 'h-6 w-6'

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        toggleCompleted(type, slug)
      }}
      aria-label={done ? 'Mark as not done' : 'Mark as done'}
      aria-pressed={done}
      className={`flex shrink-0 items-center justify-center rounded-md border-2 transition-colors ${dimensions} ${
        done ? 'border-easy bg-easy text-white' : 'border-border text-transparent hover:border-easy'
      }`}
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 6 9 17l-5-5" />
      </svg>
    </button>
  )
}
