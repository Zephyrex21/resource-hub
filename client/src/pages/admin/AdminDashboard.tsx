import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useAsync } from '../../hooks/useAsync'
import { usePageTitle } from '../../hooks/usePageTitle'
import { getMeta } from '../../lib/api'
import { NotesPanel } from './NotesPanel'
import { TipsPanel } from './TipsPanel'
import { ProjectsPanel } from './ProjectsPanel'
import { Loading, ErrorState } from '../../components/ui/StateViews'

const tabs = ['notes', 'tips', 'projects'] as const
type Tab = (typeof tabs)[number]

export default function AdminDashboard() {
  usePageTitle('Admin')
  const { email, logout } = useAuth()
  const [tab, setTab] = useState<Tab>('notes')
  const { data: meta, loading, error, refetch } = useAsync(getMeta, [])

  if (loading) return <Loading label="Loading admin…" />
  if (error || !meta) return <ErrorState message={error ?? 'Failed to load'} onRetry={refetch} />

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Admin</h1>
          <p className="text-sm text-muted">Signed in as {email}</p>
        </div>
        <button onClick={logout} className="clay-btn rounded-full px-4 py-2 text-sm">
          Log out
        </button>
      </div>

      <div className="flex gap-2">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium capitalize transition-colors ${
              tab === t ? 'bg-accent text-white' : 'clay-btn text-muted'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'notes' && <NotesPanel meta={meta} />}
      {tab === 'tips' && <TipsPanel meta={meta} />}
      {tab === 'projects' && <ProjectsPanel meta={meta} />}
    </div>
  )
}
