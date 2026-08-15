// A small shared CRUD controller so Notes/Tips/Projects don't each reimplement
// the same list/get/create/update/delete logic. Resource-specific filtering
// (subject, category, status, etc.) is handled generically via query params.
export function createCrudController(Model) {
  return {
    async list(req, res, next) {
      try {
        const { search, tag, ...rest } = req.query
        const query = {}

        for (const [key, value] of Object.entries(rest)) {
          if (value !== undefined && value !== '') query[key] = value
        }

        if (tag) query.tags = tag
        if (search) query.$text = { $search: search }

        const docs = await Model.find(query).sort({ createdAt: -1 })
        res.json(docs)
      } catch (err) {
        next(err)
      }
    },

    async getBySlug(req, res, next) {
      try {
        const doc = await Model.findOne({ slug: req.params.slug })
        if (!doc) return res.status(404).json({ error: 'Not found' })
        res.json(doc)
      } catch (err) {
        next(err)
      }
    },

    async create(req, res, next) {
      try {
        const doc = await Model.create(req.body)
        res.status(201).json(doc)
      } catch (err) {
        next(err)
      }
    },

    async update(req, res, next) {
      try {
        const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
          new: true,
          runValidators: true,
        })
        if (!doc) return res.status(404).json({ error: 'Not found' })
        res.json(doc)
      } catch (err) {
        next(err)
      }
    },

    async remove(req, res, next) {
      try {
        const doc = await Model.findByIdAndDelete(req.params.id)
        if (!doc) return res.status(404).json({ error: 'Not found' })
        res.status(204).end()
      } catch (err) {
        next(err)
      }
    },
  }
}
