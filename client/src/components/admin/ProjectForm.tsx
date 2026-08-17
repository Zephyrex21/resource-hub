import { useEffect, useState, type FormEvent } from 'react'
import * as api from '../../lib/api'
import type { Project, Meta } from '../../lib/api'

interface Props {
  meta: Meta
  editing: Project | null
  onSaved: (mode: 'created' | 'updated') => void
  onCancelEdit: () => void
}

const inputClass = 'glass-card rounded-xl px-4 py-2.5 text-sm outline-none'

export function ProjectForm({ meta, editing, onSaved, onCancelEdit }: Props) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [techStack, setTechStack] = useState('')
  const [githubUrl, setGithubUrl] = useState('')
  const [liveUrl, setLiveUrl] = useState('')
  const [status, setStatus] = useState<Project['status']>('active')
  const [featured, setFeatured] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (editing) {
      setTitle(editing.title)
      setDescription(editing.description)
      setTechStack(editing.techStack.join(', '))
      setGithubUrl(editing.githubUrl)
      setLiveUrl(editing.liveUrl ?? '')
      setStatus(editing.status)
      setFeatured(editing.featured)
    } else {
      setTitle('')
      setDescription('')
      setTechStack('')
      setGithubUrl('')
      setLiveUrl('')
      setStatus('active')
      setFeatured(false)
    }
  }, [editing])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const payload = {
      title,
      description,
      techStack: techStack.split(',').map((t) => t.trim()).filter(Boolean),
      githubUrl,
      liveUrl: liveUrl.trim() || null,
      status,
      featured,
    }

    try {
      if (editing) await api.updateProject(editing._id, payload)
      else await api.createProject(payload)
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

      <textarea
        required
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description"
        rows={3}
        className={inputClass}
      />

      <input
        value={techStack}
        onChange={(e) => setTechStack(e.target.value)}
        placeholder="Tech stack (comma separated)"
        className={inputClass}
      />

      <input
        required
        value={githubUrl}
        onChange={(e) => setGithubUrl(e.target.value)}
        placeholder="GitHub URL"
        className={inputClass}
      />

      <input
        value={liveUrl}
        onChange={(e) => setLiveUrl(e.target.value)}
        placeholder="Live URL (optional)"
        className={inputClass}
      />

      <select value={status} onChange={(e) => setStatus(e.target.value as Project['status'])} className={inputClass}>
        {meta.projectStatuses.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>

      <label className="flex items-center gap-2 text-sm text-muted">
        <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
        Featured
      </label>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-accent-projects px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {saving ? 'Saving…' : editing ? 'Update project' : 'Add project'}
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
