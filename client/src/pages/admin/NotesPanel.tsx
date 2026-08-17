import { useState } from 'react'
import { getNotes, deleteNote } from '../../lib/api'
import type { Note, Meta } from '../../lib/api'
import { useAsync } from '../../hooks/useAsync'
import { useToast } from '../../context/ToastContext'
import { NoteForm } from '../../components/admin/NoteForm'
import { AdminList } from '../../components/admin/AdminList'
import { Loading, ErrorState } from '../../components/ui/StateViews'

export function NotesPanel({ meta }: { meta: Meta }) {
  const { data: notes, loading, error, refetch } = useAsync(() => getNotes(), [])
  const [editing, setEditing] = useState<Note | null>(null)
  const { showToast } = useToast()

  async function handleDelete(id: string) {
    try {
      await deleteNote(id)
      refetch()
      showToast('Note deleted')
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Delete failed', 'error')
    }
  }

  function handleSaved(mode: 'created' | 'updated') {
    setEditing(null)
    refetch()
    showToast(mode === 'created' ? 'Note added' : 'Note updated')
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div>
        <h2 className="mb-3 font-display text-lg font-semibold">{editing ? 'Edit note' : 'Add a note'}</h2>
        <NoteForm meta={meta} editing={editing} onSaved={handleSaved} onCancelEdit={() => setEditing(null)} />
      </div>
      <div>
        <h2 className="mb-3 font-display text-lg font-semibold">Existing notes ({notes?.length ?? 0})</h2>
        {loading && <Loading />}
        {error && <ErrorState message={error} onRetry={refetch} />}
        {notes && <AdminList items={notes} onEdit={setEditing} onDelete={handleDelete} renderMeta={(n) => n.subject} />}
      </div>
    </div>
  )
}
