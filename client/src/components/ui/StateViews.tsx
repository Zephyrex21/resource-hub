export function Loading({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-muted">
      <span className="h-2 w-2 animate-pulse rounded-full bg-accent" />
      <span className="h-2 w-2 animate-pulse rounded-full bg-accent [animation-delay:150ms]" />
      <span className="h-2 w-2 animate-pulse rounded-full bg-accent [animation-delay:300ms]" />
      <span className="ml-2 text-sm">{label}</span>
    </div>
  )
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="glass-card mx-auto flex max-w-md flex-col items-center gap-3 rounded-2xl px-6 py-10 text-center">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      <p className="text-sm text-red-500">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="clay-btn rounded-full px-4 py-2 text-sm font-medium text-text">
          Try again
        </button>
      )}
    </div>
  )
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="glass-card mx-auto flex max-w-md flex-col items-center gap-3 rounded-2xl px-6 py-10 text-center">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="text-muted">
        <rect x="3" y="7" width="18" height="13" rx="2" />
        <path d="M3 7l3-4h12l3 4" />
        <line x1="9" y1="12" x2="15" y2="12" />
      </svg>
      <p className="text-sm text-muted">{message}</p>
    </div>
  )
}
