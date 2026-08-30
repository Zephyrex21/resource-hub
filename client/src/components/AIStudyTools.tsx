import { useState } from 'react'
import { getQuiz, explainDifferently } from '../lib/api'
import type { AIContentType, QuizQuestion } from '../lib/api'
import { GlassCard } from './ui/Card'

interface Props {
  contentType: AIContentType
  slug: string
}

type Mode = 'closed' | 'quiz' | 'explain'

export function AIStudyTools({ contentType, slug }: Props) {
  const [mode, setMode] = useState<Mode>('closed')

  return (
    <GlassCard className="flex flex-col gap-4 px-6 py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-sm font-semibold">Study Tools</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setMode((m) => (m === 'quiz' ? 'closed' : 'quiz'))}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              mode === 'quiz' ? 'bg-accent text-white' : 'clay-btn text-text'
            }`}
          >
            🧠 Quiz Me
          </button>
          <button
            onClick={() => setMode((m) => (m === 'explain' ? 'closed' : 'explain'))}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              mode === 'explain' ? 'bg-accent text-white' : 'clay-btn text-text'
            }`}
          >
            💡 Explain Differently
          </button>
        </div>
      </div>

      {mode === 'quiz' && <QuizPanel contentType={contentType} slug={slug} />}
      {mode === 'explain' && <ExplainPanel contentType={contentType} slug={slug} />}
    </GlassCard>
  )
}

function QuizPanel({ contentType, slug }: Props) {
  const [quiz, setQuiz] = useState<QuizQuestion[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [hasLoaded, setHasLoaded] = useState(false)

  async function load(regenerate: boolean) {
    setLoading(true)
    setError(null)
    try {
      const res = await getQuiz(contentType, slug, regenerate)
      setQuiz(res.quiz)
      setAnswers({})
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load a quiz right now.')
    } finally {
      setLoading(false)
      setHasLoaded(true)
    }
  }

  if (!hasLoaded && !loading) {
    return (
      <div className="flex flex-col items-center gap-3 py-4 text-center">
        <p className="text-sm text-muted">Test your understanding with a short auto-generated quiz.</p>
        <button
          onClick={() => load(false)}
          className="rounded-full bg-accent px-4 py-2 text-sm font-medium text-white"
        >
          Generate Quiz
        </button>
      </div>
    )
  }

  if (loading) {
    return <p className="py-4 text-center text-sm text-muted">Generating your quiz…</p>
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 py-4 text-center">
        <p className="text-sm text-red-500">{error}</p>
        <button onClick={() => load(false)} className="clay-btn rounded-full px-4 py-2 text-sm font-medium text-text">
          Try Again
        </button>
      </div>
    )
  }

  if (!quiz || quiz.length === 0) return null

  const allAnswered = Object.keys(answers).length === quiz.length
  const correctCount = quiz.filter((q, i) => answers[i] === q.correctIndex).length

  return (
    <div className="flex flex-col gap-5">
      {quiz.map((q, qi) => {
        const selected = answers[qi]
        const showState = selected !== undefined
        return (
          <div key={qi} className="flex flex-col gap-2">
            <p className="text-sm font-medium">
              {qi + 1}. {q.question}
            </p>
            <div className="flex flex-col gap-1.5">
              {q.options.map((opt, oi) => {
                const isSelected = selected === oi
                const isCorrect = oi === q.correctIndex
                return (
                  <button
                    key={oi}
                    disabled={showState}
                    onClick={() => setAnswers((a) => ({ ...a, [qi]: oi }))}
                    className={`rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                      showState && isCorrect
                        ? 'border-green-500 bg-green-500/10 text-green-700 dark:text-green-400'
                        : showState && isSelected && !isCorrect
                          ? 'border-red-500 bg-red-500/10 text-red-700 dark:text-red-400'
                          : 'border-border hover:bg-border/30'
                    }`}
                  >
                    {opt}
                  </button>
                )
              })}
            </div>
            {showState && q.explanation && <p className="text-xs text-muted">{q.explanation}</p>}
          </div>
        )
      })}

      {allAnswered && (
        <div className="flex items-center justify-between border-t border-border pt-4">
          <p className="text-sm font-medium">
            You scored {correctCount}/{quiz.length}
          </p>
          <button
            onClick={() => load(true)}
            className="clay-btn rounded-full px-4 py-2 text-xs font-medium text-text"
          >
            New Quiz
          </button>
        </div>
      )}
    </div>
  )
}

function ExplainPanel({ contentType, slug }: Props) {
  const [explanation, setExplanation] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const res = await explainDifferently(contentType, slug)
      setExplanation(res.explanation)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not generate an explanation right now.')
    } finally {
      setLoading(false)
    }
  }

  if (!explanation && !loading && !error) {
    return (
      <div className="flex flex-col items-center gap-3 py-4 text-center">
        <p className="text-sm text-muted">Get a fresh take on this material — a different angle or example.</p>
        <button onClick={load} className="rounded-full bg-accent px-4 py-2 text-sm font-medium text-white">
          Explain Differently
        </button>
      </div>
    )
  }

  if (loading) {
    return <p className="py-4 text-center text-sm text-muted">Thinking of a different way to explain this…</p>
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 py-4 text-center">
        <p className="text-sm text-red-500">{error}</p>
        <button onClick={load} className="clay-btn rounded-full px-4 py-2 text-sm font-medium text-text">
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="whitespace-pre-wrap text-sm leading-relaxed">{explanation}</p>
      <button onClick={load} className="clay-btn w-fit rounded-full px-4 py-2 text-xs font-medium text-text">
        Try Another Angle
      </button>
    </div>
  )
}
