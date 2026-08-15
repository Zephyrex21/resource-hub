interface FilterChipsProps {
  options: string[]
  active: string
  onChange: (value: string) => void
  allLabel?: string
}

export function FilterChips({ options, active, onChange, allLabel = 'All' }: FilterChipsProps) {
  const items = [allLabel, ...options]

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => {
        const isActive = item === active || (item === allLabel && active === '')
        return (
          <button
            key={item}
            onClick={() => onChange(item === allLabel ? '' : item)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              isActive ? 'bg-accent text-white' : 'clay-btn text-muted hover:text-text'
            }`}
          >
            {item}
          </button>
        )
      })}
    </div>
  )
}
