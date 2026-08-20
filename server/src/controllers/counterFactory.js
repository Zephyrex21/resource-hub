// Small shared helper for "increment a counter field by slug" endpoints —
// used for both view counts (Notes/Tips/Projects) and Notes' download count.
// Public, unauthenticated on purpose: these are just counters, not writes
// worth protecting, and gating them behind admin auth would mean visitors
// (the only people actually generating views/downloads) could never
// trigger them.
export function createCounterIncrementer(Model, field) {
  return async function increment(req, res, next) {
    try {
      const doc = await Model.findOneAndUpdate(
        { slug: req.params.slug },
        { $inc: { [field]: 1 } },
        { new: true },
      )
      if (!doc) return res.status(404).json({ error: 'Not found' })
      res.json({ [field]: doc[field] })
    } catch (err) {
      next(err)
    }
  }
}
