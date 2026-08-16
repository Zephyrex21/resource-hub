import { useState } from 'react'
import { getProjects, deleteProject } from '../../lib/api'
import type { Project, Meta } from '../../lib/api'
import { useAsync } from '../../hooks/useAsync'
import { ProjectForm } from '../../components/admin/ProjectForm'
import { AdminList } from '../../components/admin/AdminList'
import { Loading, ErrorState } from '../../components/ui/StateViews'

export function ProjectsPanel({ meta }: { meta: Meta }) {
  const { data: projects, loading, error, refetch } = useAsync(() => getProjects(), [])
  const [editing, setEditing] = useState<Project | null>(null)

  async function handleDelete(id: string) {
    await deleteProject(id)
    refetch()
  }

  function handleSaved() {
    setEditing(null)
    refetch()
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
