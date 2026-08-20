import { useReadingProgress } from '../hooks/useReadingProgress'

export function ReadingProgressBar() {
  const progress = useReadingProgress()

  return (
    <div className="fixed left-0 top-0 z-20 h-1 w-full" aria-hidden="true">
      <div className="h-full bg-accent transition-[width] duration-150" style={{ width: `${progress}%` }} />
    </div>
  )
}
