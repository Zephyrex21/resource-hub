import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { askQuestion, type AskSource } from '../lib/api'
import { useUIStore } from '../store/uiStore'

interface QAEntry {
  id: string
  question: string
  answer?: string
  sources?: AskSource[]
  error?: string
  loading: boolean
}

const TYPE_ROUTE: Record<AskSource['type'], string> = {
  note: '/notes',
  tip: '/tips',
  project: '/projects',
}

function SparkleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8" />
    </svg>
  )
}

function SourcePill({ source }: { source: AskSource }) {
  const closeAskPanel = useUIStore((s) => s.closeAskPanel)
  return (
    <Link
      to={`${TYPE_ROUTE[source.type]}/${source.slug}`}
      onClick={closeAskPanel}
      className="clay-btn inline-flex items-center rounded-full px-3 py-1 text-xs font-medium text-text"
    >
      {source.title}
    </Link>
  )
}

// Session-only Q&A over the hub's own content (Notes/Tips/Projects), backed
// by the /api/v1/ask endpoint — retrieval via the same text index that
// powers ⌘K search, generation via Claude. Nothing here is persisted; the
// conversation resets on page reload, same trade-off the rest of the app's
// client-only state makes (Bookmarks/Progress use localStorage instead
// because those are worth keeping — a Q&A transcript isn't).
export function AskAIPanel() {
  const askPanelOpen = useUIStore((s) => s.askPanelOpen)
  const closeAskPanel = useUIStore((s) => s.closeAskPanel)
  const [input, setInput] = useState('')
  const [entries, setEntries] = useState<QAEntry[]>([])
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (askPanelOpen) setTimeout(() => inputRef.current?.focus(), 150)
  }, [askPanelOpen])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [entries])

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') closeAskPanel()
    }
    if (askPanelOpen) window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [askPanelOpen, closeAskPanel])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const question = input.trim()
    if (!question) return

    const id = crypto.randomUUID()
    setEntries((prev) => [...prev, { id, question, loading: true }])
    setInput('')

    try {
      const result = await askQuestion(question)
      setEntries((prev) =>
        prev.map((entry) => (entry.id === id ? { ...entry, loading: false, answer: result.answer, sources: result.sources } : entry)),
      )
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong.'
      setEntries((prev) => prev.map((entry) => (entry.id === id ? { ...entry, loading: false, error: message } : entry)))
    }
  }

  return (
    <AnimatePresence>
      {askPanelOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeAskPanel}
            className="fixed inset-0 z-40 bg-black/30"
          />
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            className="fixed inset-x-4 bottom-4 z-50 mx-auto flex max-h-[70vh] max-w-lg flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-[var(--card-shadow-hover)] sm:inset-x-auto sm:right-6 sm:bottom-6 sm:w-[420px]"
          >
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/10 text-accent">
                  <SparkleIcon />
                </span>
                <p className="font-display text-sm font-semibold">Ask AI</p>
              </div>
              <button onClick={closeAskPanel} aria-label="Close" className="text-muted hover:text-text">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
              {entries.length === 0 && (
                <p className="text-sm text-muted">
                  Ask something about the notes, tips, or projects in this hub — answers are grounded only in what's
                  actually here.
                </p>
              )}

              <div className="flex flex-col gap-4">
                {entries.map((entry) => (
                  <div key={entry.id} className="flex flex-col gap-2">
                    <p className="ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-accent px-3.5 py-2 text-sm text-white">
                      {entry.question}
                    </p>

                    {entry.loading && (
                      <div className="flex items-center gap-1.5 text-xs text-muted">
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted [animation-delay:-0.2s]" />
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted" />
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted [animation-delay:0.2s]" />
                      </div>
                    )}

                    {entry.error && (
                      <p className="max-w-[90%] rounded-2xl rounded-bl-sm bg-hard/10 px-3.5 py-2 text-sm text-hard">
                        {entry.error}
                      </p>
                    )}

                    {entry.answer && (
                      <div className="flex flex-col gap-2">
                        <p className="max-w-[90%] rounded-2xl rounded-bl-sm border border-border bg-bg px-3.5 py-2 text-sm text-text">
                          {entry.answer}
                        </p>
                        {entry.sources && entry.sources.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {entry.sources.map((s) => (
                              <SourcePill key={`${s.type}-${s.slug}`} source={s} />
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-border p-3">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about a note, tip, or project…"
                className="flex-1 rounded-full border border-border bg-bg px-4 py-2 text-sm outline-none focus:border-accent"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="rounded-full bg-accent px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
              >
                Ask
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
