import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createCrudController } from '../crudFactory.js'

function mockRes() {
  const res = {}
  res.status = vi.fn().mockReturnValue(res)
  res.json = vi.fn().mockReturnValue(res)
  res.end = vi.fn().mockReturnValue(res)
  return res
}

describe('createCrudController', () => {
  let Model
  let ctrl
  let next

  beforeEach(() => {
    Model = {
      find: vi.fn(),
      findOne: vi.fn(),
      create: vi.fn(),
      findByIdAndUpdate: vi.fn(),
      findByIdAndDelete: vi.fn(),
    }
    ctrl = createCrudController(Model)
    next = vi.fn()
  })

  describe('list', () => {
    it('builds a query from non-empty query params and always sorts newest-first', async () => {
      const docs = [{ title: 'A' }]
      const sort = vi.fn().mockResolvedValue(docs)
      Model.find.mockReturnValue({ sort })

      const res = mockRes()
      await ctrl.list({ query: { subject: 'DSA', empty: '' } }, res, next)

      expect(Model.find).toHaveBeenCalledWith({ subject: 'DSA' }) // empty-string param dropped
      expect(sort).toHaveBeenCalledWith({ createdAt: -1 })
      expect(res.json).toHaveBeenCalledWith(docs)
    })

    it('maps a tag query param to a tags field match', async () => {
      const sort = vi.fn().mockResolvedValue([])
      Model.find.mockReturnValue({ sort })
      await ctrl.list({ query: { tag: 'react' } }, mockRes(), next)
      expect(Model.find).toHaveBeenCalledWith({ tags: 'react' })
    })

    it('maps a search query param to a $text search', async () => {
      const sort = vi.fn().mockResolvedValue([])
      Model.find.mockReturnValue({ sort })
      await ctrl.list({ query: { search: 'docker' } }, mockRes(), next)
      expect(Model.find).toHaveBeenCalledWith({ $text: { $search: 'docker' } })
    })

    it('forwards errors to next() instead of throwing', async () => {
      const error = new Error('db down')
      Model.find.mockReturnValue({ sort: vi.fn().mockRejectedValue(error) })
      await ctrl.list({ query: {} }, mockRes(), next)
      expect(next).toHaveBeenCalledWith(error)
    })
  })

  describe('getBySlug', () => {
    it('returns the document when found', async () => {
      const doc = { title: 'Found' }
      Model.findOne.mockResolvedValue(doc)
      const res = mockRes()
      await ctrl.getBySlug({ params: { slug: 'found' } }, res, next)
      expect(Model.findOne).toHaveBeenCalledWith({ slug: 'found' })
      expect(res.json).toHaveBeenCalledWith(doc)
    })

    it('returns 404 when not found', async () => {
      Model.findOne.mockResolvedValue(null)
      const res = mockRes()
      await ctrl.getBySlug({ params: { slug: 'missing' } }, res, next)
      expect(res.status).toHaveBeenCalledWith(404)
    })
  })

  describe('create', () => {
    it('creates a document from req.body and responds 201', async () => {
      const created = { _id: '1', title: 'New' }
      Model.create.mockResolvedValue(created)
      const res = mockRes()
      await ctrl.create({ body: { title: 'New' } }, res, next)
      expect(Model.create).toHaveBeenCalledWith({ title: 'New' })
      expect(res.status).toHaveBeenCalledWith(201)
      expect(res.json).toHaveBeenCalledWith(created)
    })
  })

  describe('update', () => {
    it('updates and returns the new document with validators run', async () => {
      const updated = { _id: '1', title: 'Updated' }
      Model.findByIdAndUpdate.mockResolvedValue(updated)
      const res = mockRes()
      await ctrl.update({ params: { id: '1' }, body: { title: 'Updated' } }, res, next)
      expect(Model.findByIdAndUpdate).toHaveBeenCalledWith('1', { title: 'Updated' }, { new: true, runValidators: true })
      expect(res.json).toHaveBeenCalledWith(updated)
    })

    it('returns 404 when the document does not exist', async () => {
      Model.findByIdAndUpdate.mockResolvedValue(null)
      const res = mockRes()
      await ctrl.update({ params: { id: 'missing' }, body: {} }, res, next)
      expect(res.status).toHaveBeenCalledWith(404)
    })
  })

  describe('remove', () => {
    it('deletes and responds 204', async () => {
      Model.findByIdAndDelete.mockResolvedValue({ _id: '1' })
      const res = mockRes()
      await ctrl.remove({ params: { id: '1' } }, res, next)
      expect(res.status).toHaveBeenCalledWith(204)
      expect(res.end).toHaveBeenCalled()
    })

    it('returns 404 when the document does not exist', async () => {
      Model.findByIdAndDelete.mockResolvedValue(null)
      const res = mockRes()
      await ctrl.remove({ params: { id: 'missing' } }, res, next)
      expect(res.status).toHaveBeenCalledWith(404)
    })
  })
})
