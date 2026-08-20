import type { MouseEvent } from 'react'
import type { Heading } from '../lib/markdown'
import { GlassCard } from './ui/Card'

export function TableOfContents({ headings }: { headings: Heading[] }) {
  if (headings.length < 2) return null

  function handleClick(e: MouseEvent, id: string) {
    e.preventDefault()
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <GlassCard className="px-5 py-4">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">On this page</p>
      <nav className="flex flex-col gap-1.5">
        {headings.map((h) => (
          <a
            key={h.id}
            href={`#${h.id}`}
            onClick={(e) => handleClick(e, h.id)}
            className={`text-sm text-muted hover:text-text ${h.level === 3 ? 'pl-4' : ''}`}
          >
            {h.text}
          </a>
        ))}
      </nav>
    </GlassCard>
  )
}
