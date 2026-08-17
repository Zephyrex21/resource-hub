import { useState } from 'react'
import { getProjects, deleteProject } from '../../lib/api'
import type { Project, Meta } from '../../lib/api'
import { useAsync } from '../../hooks/useAsync'
import { useToast } from '../../context/ToastContext'
import { ProjectForm } from '../../components/admin/ProjectForm'
import { AdminList } from '../../components/admin/AdminList'
import { Loading, ErrorState } from '../../components/ui/StateViews'

export function ProjectsPanel({ meta }: { meta: Meta }) {
  const { data: projects, loading, error, refetch } = useAsync(() => getProjects(), [])
  const [editing, setEditing] = useState<Project | null>(null)
  const { showToast } = useToast()

  async function handleDelete(id: string) {
    try {
      await deleteProject(id)
      refetch()
      showToast('Project deleted')
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Delete failed', 'error')
    }
  }

  function handleSaved(mode: 'created' | 'updated') {
    setEditing(null)
    refetch()
    showToast(mode === 'created' ? 'Project added' : 'Project updated')
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div>
        <h2 className="mb-3 font-display text-lg font-semibold">{editing ? 'Edit project' : 'Add a project'}</h2>
        <ProjectForm meta={meta} editing={editing} onSaved={handleSaved} onCancelEdit={() => setEditing(null)} />
      </div>
      <div>
        <h2 className="mb-3 font-display text-lg font-semibold">Existing projects ({projects?.length ?? 0})</h2>
        {loading && <Loading />}
        {error && <ErrorState message={error} onRetry={refetch} />}
        {projects && <AdminList items={projects} onEdit={setEditing} onDelete={handleDelete} renderMeta={(p) => p.status} />}
      </div>
    </div>
  )
}
