const MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile'

export function buildExplainPrompt(title, text) {
  return [
    "Explain the material below in a different, simpler way than it's currently written — as if teaching someone",
    'who found the original phrasing confusing. Take a genuinely different angle: a concrete example, a step-by-step',
    'breakdown, or an analogy — not just a light rewording of the same sentences. Keep it focused and no longer than',
    'the original material.',
    '',
    `Title: ${title}`,
    '',
    'Original material:',
    text,
  ].join('\n')
}

// Deliberately NOT cached, unlike quiz generation — "explain differently"
// is usually clicked because the first explanation didn't land, so
// serving back the same cached text on a second click would defeat the
// point. Same DI shape as quizController.js for the same testability
// reasons.
export function createExplainController({ Note, Tip, getSourceText, fetchImpl = fetch }) {
  const modelsByType = { note: Note, tip: Tip }

  return {
    async explainDifferently(req, res, next) {
      try {
        const { contentType, slug } = req.params
        const Model = modelsByType[contentType]
        if (!Model) {
          return res.status(400).json({ error: 'contentType must be "note" or "tip"' })
        }

        const doc = await Model.findOne({ slug }).select('+extractedText')
        if (!doc) return res.status(404).json({ error: 'Not found' })

        if (!process.env.GROQ_API_KEY) {
          return res
            .status(503)
            .json({ error: "This feature isn't configured yet — set GROQ_API_KEY in the server's .env." })
        }

        const text = await getSourceText(doc, Model)
        if (!text || text.length < 200) {
          return res.status(422).json({ error: 'Not enough content available to re-explain yet.' })
        }

        const response = await fetchImpl('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
          body: JSON.stringify({
            model: MODEL,
            max_tokens: 700,
            messages: [{ role: 'user', content: buildExplainPrompt(doc.title, text) }],
          }),
        })

        if (!response.ok) {
          const detail = await response.text().catch(() => '')
          console.error('[explain] Groq API error', response.status, detail)
          return res.status(502).json({ error: 'This feature is temporarily unavailable — try again shortly.' })
        }

        const data = await response.json()
        const explanation = data.choices?.[0]?.message?.content?.trim()

        if (!explanation) {
          return res.status(502).json({ error: 'This feature is temporarily unavailable — try again shortly.' })
        }

        res.json({ explanation })
      } catch (err) {
        next(err)
      }
    },
  }
}
