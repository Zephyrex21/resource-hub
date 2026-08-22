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

function RowSkeleton() {
  return (
    <div className="flex items-center gap-4 border-b border-border px-4 py-3 last:border-b-0">
      <Bar className="h-5 w-5 shrink-0 rounded-md" />
      <div className="flex flex-1 flex-col gap-2">
        <Bar className="h-4 w-1/2" />
        <Bar className="h-3 w-3/4" />
      </div>
      <Bar className="h-5 w-14 shrink-0 rounded-md" />
    </div>
  )
}

export function SkeletonRows({ groups = 2, rowsPerGroup = 4 }: { groups?: number; rowsPerGroup?: number }) {
  return (
    <div className="flex flex-col gap-4" aria-hidden="true">
      {Array.from({ length: groups }, (_, g) => (
        <div key={g} className="overflow-hidden rounded-2xl border border-border bg-surface">
          <div className="px-4 py-3.5">
            <Bar className="h-4 w-32" />
          </div>
          <div className="border-t border-border">
            {Array.from({ length: rowsPerGroup }, (_, r) => (
              <RowSkeleton key={r} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
