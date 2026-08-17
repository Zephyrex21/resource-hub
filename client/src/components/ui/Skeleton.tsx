// Card-shaped loading placeholders that mirror the actual card layout, so the
// page doesn't "pop" from empty to full — a more premium feel than a
// generic spinner, and it previews the eventual layout while data loads.

function Bar({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-full bg-border ${className}`} />
}

export function CardSkeleton() {
  return (
    <div className="glass-card flex h-full flex-col gap-3 px-5 py-6">
      <Bar className="h-5 w-20" />
      <Bar className="h-5 w-3/4" />
      <Bar className="h-3 w-full" />
      <Bar className="h-3 w-5/6" />
      <Bar className="mt-auto h-3 w-16" />
    </div>
  )
}

export function SkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  )
}
