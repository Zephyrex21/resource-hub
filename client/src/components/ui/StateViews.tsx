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
    <div className="glass-card mx-auto max-w-md rounded-2xl px-6 py-10 text-center">
      <p className="text-sm text-red-500">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="clay-btn mt-4 rounded-full px-4 py-2 text-sm font-medium text-text">
          Try again
        </button>
      )}
    </div>
  )
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="glass-card mx-auto max-w-md rounded-2xl px-6 py-10 text-center text-sm text-muted">
      {message}
    </div>
  )
}
