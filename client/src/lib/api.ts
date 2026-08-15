export interface HealthResponse {
  status: string
  db: string
  timestamp: string
}

export interface Note {
  _id: string
  title: string
  slug: string
  subject: string
  tags: string[]
  description: string
  fileUrl: string
  fileType: 'pdf' | 'docx'
  coverImageUrl: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  downloadCount: number
  createdAt: string
  updatedAt: string
}

export interface Tip {
  _id: string
  title: string
  slug: string
  category: string
  tags: string[]
  summary: string
  contentMarkdown: string
  fileUrl: string
  coverImageUrl: string
  createdAt: string
  updatedAt: string
}

export interface Project {
  _id: string
  title: string
  slug: string
  description: string
  techStack: string[]
  githubUrl: string
  liveUrl: string | null
  coverImageUrl: string
  status: 'active' | 'completed' | 'archived'
  featured: boolean
  createdAt: string
  updatedAt: string
}

export interface Meta {
  noteSubjects: string[]
  tipCategories: string[]
  projectStatuses: string[]
  difficulties: string[]
}

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api/v1'

function buildQuery(params?: Record<string, string | undefined>): string {
  if (!params) return ''
  const entries = Object.entries(params).filter(
    (entry): entry is [string, string] => entry[1] !== undefined && entry[1] !== '',
  )
  if (entries.length === 0) return ''
  return `?${new URLSearchParams(entries).toString()}`
}

async function request<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`)
  if (!res.ok) {
    const body = await res.json().catch(() => ({}) as { error?: string })
    throw new Error(body.error || `Request failed: ${res.status}`)
  }
  return res.json() as Promise<T>
}

export const getHealth = () => request<HealthResponse>('/health')
export const getMeta = () => request<Meta>('/meta')

export const getNotes = (params?: { subject?: string; tag?: string; search?: string }) =>
  request<Note[]>(`/notes${buildQuery(params)}`)
export const getNoteBySlug = (slug: string) => request<Note>(`/notes/${slug}`)

export const getTips = (params?: { category?: string; tag?: string; search?: string }) =>
  request<Tip[]>(`/tips${buildQuery(params)}`)
export const getTipBySlug = (slug: string) => request<Tip>(`/tips/${slug}`)

export const getProjects = (params?: { status?: string; featured?: string; search?: string }) =>
  request<Project[]>(`/projects${buildQuery(params)}`)
export const getProjectBySlug = (slug: string) => request<Project>(`/projects/${slug}`)
