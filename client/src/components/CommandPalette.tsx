import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import * as api from '../lib/api'
import type { SearchResults } from '../lib/api'
import { Tag } from './ui/Tag'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function CommandPalette({ open, onOpenChange }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResults | null>(null)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 50)
      return () => clearTimeout(t)
    }
    setQuery('')
    setResults(null)
  }, [open])

  useEffect(() => {
    if (!query.trim()) {
      setResults(null)
      return
    }
    setLoading(true)
    const handle = setTimeout(() => {
      api
        .search(query)
        .then(setResults)
        .catch(() => setResults(null))
        .finally(() => setLoading(false))
    }, 250)
    return () => clearTimeout(handle)
  }, [query])

  if (!open) return null

  function goTo(path: string) {
    navigate(path)
    onOpenChange(false)
  }

  const hasResults = !!results && (results.notes.length + results.tips.length + results.projects.length > 0)

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 px-4 pt-24"
      onClick={() => onOpenChange(false)}
    >
      <div className="glass-card w-full max-w-xl rounded-2xl p-2" onClick={(e) => e.stopPropagation()}>
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search notes, tips, projects…"
          className="w-full bg-transparent px-4 py-3 text-sm outline-none placeholder:text-muted"
        />

        <div className="max-h-96 overflow-y-auto border-t border-border">
          {loading && <p className="px-4 py-4 text-sm text-muted">Searching…</p>}
          {!loading && query && !hasResults && (
            <p className="px-4 py-4 text-sm text-muted">No results.</p>
          )}

          {results && results.notes.length > 0 && (
            <div className="px-2 py-2">
              <p className="px-2 pb-1 text-xs uppercase tracking-wide text-muted">Notes</p>
              {results.notes.map((n) => (
                <button
                  key={n._id}
                  onClick={() => goTo(`/notes/${n.slug}`)}
                  className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm hover:bg-border"
                >
                  <Tag variant="notes">{n.subject}</Tag>
                  <span className="truncate">{n.title}</span>
                </button>
              ))}
            </div>
          )}

          {results && results.tips.length > 0 && (
            <div className="px-2 py-2">
              <p className="px-2 pb-1 text-xs uppercase tracking-wide text-muted">Tips</p>
              {results.tips.map((t) => (
                <button
                  key={t._id}
                  onClick={() => goTo(`/tips/${t.slug}`)}
                  className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm hover:bg-border"
                >
                  <Tag variant="tips">{t.category}</Tag>
                  <span className="truncate">{t.title}</span>
                </button>
              ))}
            </div>
          )}

          {results && results.projects.length > 0 && (
            <div className="px-2 py-2">
              <p className="px-2 pb-1 text-xs uppercase tracking-wide text-muted">Projects</p>
              {results.projects.map((p) => (
                <button
                  key={p._id}
                  onClick={() => goTo('/projects')}
                  className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm hover:bg-border"
                >
                  <Tag variant="projects">{p.status}</Tag>
                  <span className="truncate">{p.title}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-border px-3 py-2 text-[11px] text-muted">
          <span>Enter to open · Esc to close</span>
          <span>⌘K</span>
        </div>
      </div>
    </div>
  )
}
