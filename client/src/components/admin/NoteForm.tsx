import { useEffect, useState, type FormEvent } from 'react'
import * as api from '../../lib/api'
import type { Note, Meta } from '../../lib/api'
import { FileOrUrlInput } from './FileOrUrlInput'

interface Props {
  meta: Meta
  editing: Note | null
  onSaved: () => void
  onCancelEdit: () => void
}

const inputClass = 'glass-card rounded-xl px-4 py-2.5 text-sm outline-none'

export function NoteForm({ meta, editing, onSaved, onCancelEdit }: Props) {
  const [title, setTitle] = useState('')
  const [subject, setSubject] = useState(meta.noteSubjects[0] ?? '')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState('')
  const [fileUrl, setFileUrl] = useState('')
  const [difficulty, setDifficulty] = useState<Note['difficulty']>('beginner')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (editing) {
      setTitle(editing.title)
      setSubject(editing.subject)
      setDescription(editing.description)
      setTags(editing.tags.join(', '))
      setFileUrl(editing.fileUrl)
      setDifficulty(editing.difficulty)
    } else {
      setTitle('')
      setSubject(meta.noteSubjects[0] ?? '')
      setDescription('')
      setTags('')
      setFileUrl('')
      setDifficulty('beginner')
    }
  }, [editing, meta])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const lowerUrl = fileUrl.toLowerCase()
    const payload = {
      title,
      subject,
      description,
      difficulty,
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      fileUrl,
      fileType: (lowerUrl.endsWith('.docx') || lowerUrl.endsWith('.doc') ? 'docx' : 'pdf') as Note['fileType'],
    }

    try {
      if (editing) await api.updateNote(editing._id, payload)
      else await api.createNote(payload)
      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className={inputClass} />

      <select value={subject} onChange={(e) => setSubject(e.target.value)} className={inputClass}>
        {meta.noteSubjects.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>

      <textarea
        required
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description"
        rows={3}
        className={inputClass}
      />

      <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Tags (comma separated)" className={inputClass} />

      <FileOrUrlInput value={fileUrl} onChange={setFileUrl} />

      <select value={difficulty} onChange={(e) => setDifficulty(e.target.value as Note['difficulty'])} className={inputClass}>
        {meta.difficulties.map((d) => (
          <option key={d} value={d}>
            {d}
          </option>
        ))}
      </select>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving || !fileUrl}
          className="rounded-full bg-accent-notes px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {saving ? 'Saving…' : editing ? 'Update note' : 'Add note'}
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
