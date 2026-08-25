import Note from '../models/Note.js'
import Tip from '../models/Tip.js'
import Project from '../models/Project.js'

const MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile'

// Reuses the same $text indexes that power the ⌘K command palette
// (see search.routes.js) as retrieval for the AI's context — no separate
// vector store needed for a hub this size.
async function gatherContext(question) {
  const [notes, tips, projects] = await Promise.all([
    Note.find({ $text: { $search: question } })
      .select('title slug subject description tags difficulty')
      .limit(4)
      .lean(),
    Tip.find({ $text: { $search: question } })
      .select('title slug category summary contentMarkdown tags')
      .limit(4)
      .lean(),
    Project.find({ $text: { $search: question } })
      .select('title slug description techStack status')
      .limit(3)
      .lean(),
  ])
  return { notes, tips, projects }
}

// Notes are file-based (PDF/DOCX) — their actual body text isn't indexed
// here, so the AI only ever sees title/description/tags/difficulty for
// them. It can point someone to the right note but can't reason about a
// PDF's contents. Tips have real markdown bodies, so those get truncated
// content included too.
// Exported for unit testing — pure function, no DB/network involved.
export function buildContextBlock({ notes, tips, projects }) {
  const blocks = [
    ...notes.map(
      (n) =>
        `[Note] "${n.title}" — subject: ${n.subject}, difficulty: ${n.difficulty}\n${n.description}\nTags: ${(n.tags || []).join(', ')}`,
    ),
    ...tips.map(
      (t) =>
        `[Tip] "${t.title}" — category: ${t.category}\n${t.summary}\n${(t.contentMarkdown || '').slice(0, 1500)}`,
    ),
    ...projects.map(
      (p) => `[Project] "${p.title}" — status: ${p.status}\n${p.description}\nTech: ${(p.techStack || []).join(', ')}`,
    ),
  ]
  return blocks.join('\n\n---\n\n')
}

// Exported for unit testing — pure function, no DB/network involved.
export function collectSources({ notes, tips, projects }) {
  return [
    ...notes.map((n) => ({ type: 'note', title: n.title, slug: n.slug })),
    ...tips.map((t) => ({ type: 'tip', title: t.title, slug: t.slug })),
    ...projects.map((p) => ({ type: 'project', title: p.title, slug: p.slug })),
  ]
}

export async function askQuestion(req, res, next) {
  try {
    // Shape/length validation (non-empty, ≤500 chars) already happened in
    // the askSchema zod middleware — req.body.question is guaranteed to be
    // a trimmed, valid string by the time it gets here.
    const { question } = req.body

    if (!process.env.GROQ_API_KEY) {
      return res.status(503).json({
        error: "Ask AI isn't configured yet — set GROQ_API_KEY in the server's .env to enable it.",
      })
    }

    // Request-volume rate limiting (per-IP, cost/abuse protection) is
    // handled by the askLimiter middleware in ask.routes.js, not here.

    const context = await gatherContext(question)
    const sources = collectSources(context)

    // Nothing relevant found — answer honestly without spending an API call.
    if (sources.length === 0) {
      return res.json({
        answer:
          "I couldn't find anything in the hub related to that. Try browsing Notes or Tips directly, or rephrase the question.",
        sources: [],
      })
    }

    const systemPrompt = [
      'You are a helpful assistant answering questions about a personal developer resource hub',
      '(study notes, tips & tricks, and projects). Answer ONLY using the context blocks below —',
      'each is prefixed with its type in brackets. If the context does not actually answer the',
      'question, say so honestly rather than guessing, and suggest what to browse instead. Keep',
      'answers concise (a few sentences to a short paragraph). Synthesize the context in your own',
      'words rather than repeating it verbatim.',
      '',
      'Context:',
      buildContextBlock(context),
    ].join('\n')

    // Groq's API is OpenAI-compatible (chat completions), not the
    // Anthropic Messages API shape — different endpoint, auth header, and
    // request/response format.
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 500,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: question },
        ],
      }),
    })

    if (!response.ok) {
      const errBody = await response.text().catch(() => '')
      console.error('[ask] Groq API error', response.status, errBody)
      return res.status(502).json({ error: 'Ask AI is temporarily unavailable — try again shortly.' })
    }

    const data = await response.json()
    const answer = data.choices?.[0]?.message?.content?.trim()

    res.json({ answer: answer || "Sorry, I couldn't generate an answer for that.", sources })
  } catch (err) {
    next(err)
  }
}
