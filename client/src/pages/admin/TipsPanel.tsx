import { useState } from 'react'
import { getTips, deleteTip } from '../../lib/api'
import type { Tip, Meta } from '../../lib/api'
import { useAsync } from '../../hooks/useAsync'
import { TipForm } from '../../components/admin/TipForm'
import { AdminList } from '../../components/admin/AdminList'
import { Loading, ErrorState } from '../../components/ui/StateViews'

export function TipsPanel({ meta }: { meta: Meta }) {
  const { data: tips, loading, error, refetch } = useAsync(() => getTips(), [])
  const [editing, setEditing] = useState<Tip | null>(null)

  async function handleDelete(id: string) {
    await deleteTip(id)
    refetch()
  }

  function handleSaved() {
    setEditing(null)
    refetch()
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
