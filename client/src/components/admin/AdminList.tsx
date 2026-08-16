import type { ReactNode } from 'react'

interface AdminListItem {
  _id: string
  title: string
}

interface Props<T extends AdminListItem> {
  items: T[]
  onEdit: (item: T) => void
  onDelete: (id: string) => void
  renderMeta?: (item: T) => ReactNode
}

export function AdminList<T extends AdminListItem>({ items, onEdit, onDelete, renderMeta }: Props<T>) {
  if (items.length === 0) {
    return <p className="text-sm text-muted">Nothing here yet.</p>
  }

  return (
    <div className="flex flex-col gap-2">
      {items.map((item) => (
        <div key={item._id} className="glass-card flex items-center justify-between gap-3 rounded-xl px-4 py-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{item.title}</p>
            {renderMeta && <p className="truncate text-xs text-muted">{renderMeta(item)}</p>}
          </div>
          <div className="flex shrink-0 gap-2">
            <button onClick={() => onEdit(item)} className="clay-btn rounded-full px-3 py-1 text-xs">
              Edit
            </button>
            <button
              onClick={() => {
                if (confirm('Delete this item? This cannot be undone.')) onDelete(item._id)
              }}
              className="rounded-full bg-red-500/10 px-3 py-1 text-xs text-red-500"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
