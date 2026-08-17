import { useState } from 'react'
import { getTips, deleteTip } from '../../lib/api'
import type { Tip, Meta } from '../../lib/api'
import { useAsync } from '../../hooks/useAsync'
import { useToast } from '../../context/ToastContext'
import { TipForm } from '../../components/admin/TipForm'
import { AdminList } from '../../components/admin/AdminList'
import { Loading, ErrorState } from '../../components/ui/StateViews'

export function TipsPanel({ meta }: { meta: Meta }) {
  const { data: tips, loading, error, refetch } = useAsync(() => getTips(), [])
  const [editing, setEditing] = useState<Tip | null>(null)
  const { showToast } = useToast()

  async function handleDelete(id: string) {
    try {
      await deleteTip(id)
      refetch()
      showToast('Tip deleted')
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Delete failed', 'error')
    }
  }

  function handleSaved(mode: 'created' | 'updated') {
    setEditing(null)
    refetch()
    showToast(mode === 'created' ? 'Tip added' : 'Tip updated')
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div>
        <h2 className="mb-3 font-display text-lg font-semibold">{editing ? 'Edit tip' : 'Add a tip'}</h2>
        <TipForm meta={meta} editing={editing} onSaved={handleSaved} onCancelEdit={() => setEditing(null)} />
      </div>
      <div>
        <h2 className="mb-3 font-display text-lg font-semibold">Existing tips ({tips?.length ?? 0})</h2>
        {loading && <Loading />}
        {error && <ErrorState message={error} onRetry={refetch} />}
        {tips && <AdminList items={tips} onEdit={setEditing} onDelete={handleDelete} renderMeta={(t) => t.category} />}
      </div>
    </div>
  )
}
