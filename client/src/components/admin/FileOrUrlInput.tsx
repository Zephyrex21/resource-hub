import { useState, type ChangeEvent } from 'react'
import * as api from '../../lib/api'

interface Props {
  value: string
  onChange: (url: string) => void
}

// Lets an admin either paste a hosted file URL directly, or upload a file
// (which goes to Supabase Storage via the server). Upload mode degrades
// gracefully — if storage isn't configured server-side, the error surfaces
// here and "Paste URL" still works as a fallback.
export function FileOrUrlInput({ value, onChange }: Props) {
  const [mode, setMode] = useState<'url' | 'upload'>('url')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError(null)
    try {
      const { url } = await api.uploadFile(file)
      onChange(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2 text-xs">
        <button
          type="button"
          onClick={() => setMode('url')}
          className={`rounded-full px-3 py-1 ${mode === 'url' ? 'bg-accent text-white' : 'clay-btn text-muted'}`}
        >
          Paste URL
        </button>
        <button
          type="button"
          onClick={() => setMode('upload')}
          className={`rounded-full px-3 py-1 ${mode === 'upload' ? 'bg-accent text-white' : 'clay-btn text-muted'}`}
        >
          Upload file
        </button>
      </div>

      {mode === 'url' ? (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://…"
          className="glass-card rounded-xl px-4 py-2.5 text-sm outline-none"
        />
      ) : (
        <div>
          <input type="file" accept=".pdf,.doc,.docx" onChange={handleFile} className="text-sm" />
          {uploading && <p className="mt-1 text-xs text-muted">Uploading…</p>}
          {value && !uploading && <p className="mt-1 truncate text-xs text-accent">{value}</p>}
        </div>
      )}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
