import Note from '../models/Note.js'
import Tip from '../models/Tip.js'
import Project from '../models/Project.js'

const MAX_QUESTION_LENGTH = 500
const MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-5'

// Very small in-memory per-IP rate limiter. This endpoint calls a paid API
// and has no auth in front of it, so it needs *some* guard rail even for a
// personal project. Resets on server restart and doesn't share state across
// multiple instances — fine for a single-instance Render deploy, not a
// substitute for real rate limiting if this ever needs to scale out.
const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000
const RATE_LIMIT_MAX = 10
const requestLog = new Map()

function isRateLimited(ip) {
  const now = Date.now()
  const recent = (requestLog.get(ip) || []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS)
  recent.push(now)
  requestLog.set(ip, recent)
  return recent.length > RATE_LIMIT_MAX
}

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
function buildContextBlock({ notes, tips, projects }) {
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

function collectSources({ notes, tips, projects }) {
  return [
    ...notes.map((n) => ({ type: 'note', title: n.title, slug: n.slug })),
    ...tips.map((t) => ({ type: 'tip', title: t.title, slug: t.slug })),
    ...projects.map((p) => ({ type: 'project', title: p.title, slug: p.slug })),
  ]
}

export async function askQuestion(req, res, next) {
  try {
    const question = (req.body?.question ?? '').trim()
    if (!question) return res.status(400).json({ error: 'Question is required' })
    if (question.length > MAX_QUESTION_LENGTH) {
      return res.status(400).json({ error: `Keep questions under ${MAX_QUESTION_LENGTH} characters` })
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(503).json({
        error: "Ask AI isn't configured yet — set ANTHROPIC_API_KEY in the server's .env to enable it.",
      })
    }

    if (isRateLimited(req.ip)) {
      return res.status(429).json({ error: 'Too many questions in a short time — try again in a few minutes.' })
    }

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

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 500,
        system: systemPrompt,
        messages: [{ role: 'user', content: question }],
      }),
    })

    if (!response.ok) {
      const errBody = await response.text().catch(() => '')
      console.error('[ask] Anthropic API error', response.status, errBody)
      return res.status(502).json({ error: 'Ask AI is temporarily unavailable — try again shortly.' })
    }

    const data = await response.json()
    const answer = data.content?.find((block) => block.type === 'text')?.text?.trim()

    res.json({ answer: answer || "Sorry, I couldn't generate an answer for that.", sources })
  } catch (err) {
    next(err)
  }
}
