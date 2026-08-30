const MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile'
const QUIZ_SIZE = 5

export function buildQuizPrompt(title, text) {
  return [
    `Generate exactly ${QUIZ_SIZE} multiple-choice questions testing real understanding of the material below —`,
    'not just recall of exact wording. Return ONLY a JSON array (no markdown fences, no prose before or after) where',
    'each item has this exact shape:',
    '{ "question": string, "options": [string, string, string, string], "correctIndex": 0-3, "explanation": string }',
    'Keep each explanation to one concise sentence.',
    '',
    `Title: ${title}`,
    '',
    'Material:',
    text,
  ].join('\n')
}

// Exported for unit testing — pure parsing/validation, no network involved.
export function parseQuizResponse(raw) {
  let parsed
  try {
    // Models sometimes wrap JSON in ```json fences despite instructions —
    // strip those defensively rather than failing on a technicality.
    const cleaned = raw
      .trim()
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/```\s*$/, '')
    parsed = JSON.parse(cleaned)
  } catch {
    throw new Error('Could not parse quiz response as JSON')
  }

  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error('Quiz response was not a non-empty array')
  }

  const questions = parsed
    .filter(
      (q) =>
        q &&
        typeof q.question === 'string' &&
        Array.isArray(q.options) &&
        q.options.length >= 2 &&
        Number.isInteger(q.correctIndex) &&
        q.correctIndex >= 0 &&
        q.correctIndex < q.options.length,
    )
    .map((q) => ({
      question: q.question,
      options: q.options,
      correctIndex: q.correctIndex,
      explanation: typeof q.explanation === 'string' ? q.explanation : '',
    }))

  if (questions.length === 0) {
    throw new Error('No valid questions survived validation')
  }

  return questions
}

// Models and the extraction function are all injected — same
// dependency-injection approach as controllers/accountController.js —
// so this is fully unit-testable with mock models and a fake extractor,
// no real database or Groq call needed.
export function createQuizController({ Note, Tip, getSourceText, fetchImpl = fetch }) {
  const modelsByType = { note: Note, tip: Tip }

  return {
    async getOrGenerateQuiz(req, res, next) {
      try {
        const { contentType, slug } = req.params
        const Model = modelsByType[contentType]
        if (!Model) {
          return res.status(400).json({ error: 'contentType must be "note" or "tip"' })
        }

        const doc = await Model.findOne({ slug }).select('+extractedText +quiz +quizGeneratedAt')
        if (!doc) return res.status(404).json({ error: 'Not found' })

        const forceRegenerate = req.query.regenerate === 'true'
        // Cache lives until explicitly regenerated — no automatic
        // time/edit-based invalidation. That's deliberate: comparing
        // against Mongoose's auto-managed `updatedAt` invited a real race
        // (the cache-write for extractedText and the cache-write for the
        // quiz itself both bump `updatedAt`, which could land a few
        // milliseconds after `quizGeneratedAt` and self-invalidate the
        // quiz the instant it was created). An explicit "regenerate"
        // action is simpler, avoids that race entirely, and arguably
        // matches user intent better anyway — a trivial edit to fix a
        // typo shouldn't silently throw away a good quiz.
        if (doc.quiz?.length > 0 && !forceRegenerate) {
          return res.json({ quiz: doc.quiz, cached: true })
        }

        if (!process.env.GROQ_API_KEY) {
          return res
            .status(503)
            .json({ error: "Quiz generation isn't configured yet — set GROQ_API_KEY in the server's .env." })
        }

        const text = await getSourceText(doc, Model)
        if (!text || text.length < 200) {
          return res.status(422).json({ error: 'Not enough content available to generate a quiz from yet.' })
        }

        const response = await fetchImpl('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
          body: JSON.stringify({
            model: MODEL,
            max_tokens: 1200,
            messages: [{ role: 'user', content: buildQuizPrompt(doc.title, text) }],
          }),
        })

        if (!response.ok) {
          const detail = await response.text().catch(() => '')
          console.error('[quiz] Groq API error', response.status, detail)
          return res.status(502).json({ error: 'Quiz generation is temporarily unavailable — try again shortly.' })
        }

        const data = await response.json()
        const raw = data.choices?.[0]?.message?.content ?? ''

        let quiz
        try {
          quiz = parseQuizResponse(raw)
        } catch (err) {
          console.error('[quiz] failed to parse model output:', err.message)
          return res.status(502).json({ error: 'Quiz generation produced an unexpected response — try again.' })
        }

        await Model.updateOne({ _id: doc._id }, { quiz, quizGeneratedAt: new Date() })
        res.json({ quiz, cached: false })
      } catch (err) {
        next(err)
      }
    },
  }
}
