const LABEL: Record<string, string> = {
  beginner: 'Easy',
  intermediate: 'Medium',
  advanced: 'Hard',
}

interface DifficultySelectProps {
  options: string[]
  value: string
  onChange: (value: string) => void
}

export function DifficultySelect({ options, value, onChange }: DifficultySelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="clay-btn rounded-full px-4 py-1.5 text-sm font-medium text-text"
    >
      <option value="">All difficulties</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {LABEL[opt] ?? opt}
        </option>
      ))}
    </select>
  )
}
