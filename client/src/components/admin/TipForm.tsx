import { useEffect, useState, type FormEvent } from 'react'
import * as api from '../../lib/api'
import type { Tip, Meta } from '../../lib/api'
import { FileOrUrlInput } from './FileOrUrlInput'

interface Props {
  meta: Meta
  editing: Tip | null
  onSaved: (mode: 'created' | 'updated') => void
  onCancelEdit: () => void
}

const inputClass = 'glass-card rounded-xl px-4 py-2.5 text-sm outline-none'

export function TipForm({ meta, editing, onSaved, onCancelEdit }: Props) {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState(meta.tipCategories[0] ?? '')
  const [summary, setSummary] = useState('')
  const [tags, setTags] = useState('')
  const [contentMarkdown, setContentMarkdown] = useState('')
  const [fileUrl, setFileUrl] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (editing) {
      setTitle(editing.title)
      setCategory(editing.category)
      setSummary(editing.summary)
      setTags(editing.tags.join(', '))
      setContentMarkdown(editing.contentMarkdown)
      setFileUrl(editing.fileUrl)
    } else {
      setTitle('')
      setCategory(meta.tipCategories[0] ?? '')
      setSummary('')
      setTags('')
      setContentMarkdown('')
      setFileUrl('')
    }
  }, [editing, meta])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (!contentMarkdown.trim() && !fileUrl.trim()) {
      setError('Add either Markdown content or a file/URL.')
      return
    }

    setSaving(true)
    const payload = {
      title,
      category,
      summary,
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      contentMarkdown,
      fileUrl,
    }

    try {
      if (editing) await api.updateTip(editing._id, payload)
      else await api.createTip(payload)
      onSaved(editing ? 'updated' : 'created')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className={inputClass} />

      <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass}>
        {meta.tipCategories.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      <textarea
        required
        value={summary}
        onChange={(e) => setSummary(e.target.value)}
        placeholder="One-line summary"
        rows={2}
        className={inputClass}
      />

      <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Tags (comma separated)" className={inputClass} />

      <textarea
        value={contentMarkdown}
        onChange={(e) => setContentMarkdown(e.target.value)}
        placeholder={'Markdown content (optional if you add a file below) — supports ## headings and ```code blocks```'}
        rows={8}
        className={`${inputClass} font-mono text-xs`}
      />

      <p className="text-xs text-muted">Optional fallback / attachment:</p>
      <FileOrUrlInput value={fileUrl} onChange={setFileUrl} />

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex gap-2">
        <button type="submit" disabled={saving} className="rounded-full bg-accent-tips px-4 py-2 text-sm font-medium text-white disabled:opacity-50">
          {saving ? 'Saving…' : editing ? 'Update tip' : 'Add tip'}
        </button>
        {editing && (
          <button type="button" onClick={onCancelEdit} className="clay-btn rounded-full px-4 py-2 text-sm">
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}
