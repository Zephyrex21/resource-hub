import Note from '../models/Note.js'
import Tip from '../models/Tip.js'
import Project from '../models/Project.js'

const MODELS = {
  note: { model: Note, tagField: 'tags', groupField: 'subject' },
  tip: { model: Tip, tagField: 'tags', groupField: 'category' },
  project: { model: Project, tagField: 'techStack', groupField: 'status' },
}

// Slim projections per type — only what a related-content card needs, so we
// don't leak fields like contentMarkdown/fileUrl into a lightweight list.
const PROJECTIONS = {
  note: 'title slug subject description tags difficulty',
  tip: 'title slug category summary tags',
  project: 'title slug description techStack status featured',
}

// Exported for unit testing — pure function, no DB involved.
export function scoreOverlap(sourceTags, sourceGroup, candidateTags, candidateGroup) {
  const sourceSet = new Set((sourceTags || []).map((t) => t.toLowerCase()))
  const overlap = (candidateTags || []).filter((t) => sourceSet.has(t.toLowerCase())).length
  const groupBonus = sourceGroup && candidateGroup && sourceGroup === candidateGroup ? 1 : 0
  return overlap * 2 + groupBonus
}

// Cross-content-type related items: given one Note/Tip/Project, scores every
// other item (across all three collections) by tag/techStack overlap plus a
// same-subject/category/status bonus, and returns the top N. This replaces
// the old "just fetch same-subject notes" approach with something that also
// surfaces a relevant Tip or Project alongside a Note, etc.
export async function getRelated(req, res, next) {
  try {
    const { type, slug } = req.params
    const limit = Math.min(Number(req.query.limit) || 4, 8)
    const source = MODELS[type]
    if (!source) return res.status(400).json({ error: `Unknown content type "${type}"` })

    const sourceDoc = await source.model.findOne({ slug })
    if (!sourceDoc) return res.status(404).json({ error: 'Not found' })

    const sourceTags = sourceDoc[source.tagField] || []
    const sourceGroup = sourceDoc[source.groupField]

    const candidateLists = await Promise.all(
      Object.entries(MODELS).map(async ([candidateType, cfg]) => {
        const isSameType = candidateType === type
        const docs = await cfg.model
          .find(isSameType ? { slug: { $ne: slug } } : {})
          .select(PROJECTIONS[candidateType])
          .lean()

        return docs
          .map((doc) => ({
            type: candidateType,
            score: scoreOverlap(sourceTags, sourceGroup, doc[cfg.tagField], doc[cfg.groupField]),
            item: doc,
          }))
          .filter((entry) => entry.score > 0)
      }),
    )

    const ranked = candidateLists
      .flat()
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(({ type: candidateType, item }) => ({ type: candidateType, ...item }))

    res.json(ranked)
  } catch (err) {
    next(err)
  }
}
