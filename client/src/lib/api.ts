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
  viewCount: number
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
  viewCount: number
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
  order: number
  viewCount: number
  createdAt: string
  updatedAt: string
}

export interface Meta {
  noteSubjects: string[]
  tipCategories: string[]
  projectStatuses: string[]
  difficulties: string[]
}

export interface AdminSession {
  email: string
}

export interface Account {
  id: string
  name: string
  email: string
  avatarUrl: string
}

export type ProgressContentType = 'note' | 'tip'
export type SavedContentType = 'note' | 'tip' | 'project'

export interface ProgressItem {
  _id: string
  contentType: ProgressContentType
  slug: string
  createdAt: string
}

export interface SavedItemRecord {
  _id: string
  contentType: SavedContentType
  slug: string
  title: string
  subtitle: string
  createdAt: string
}

export interface SearchResults {
  notes: Note[]
  tips: Tip[]
  projects: Project[]
}

export interface Stats {
  notes: number
  tips: number
  projects: number
}

export type RelatedContentType = 'note' | 'tip' | 'project'

export interface RelatedItem {
  type: RelatedContentType
  _id: string
  title: string
  slug: string
  description?: string
  summary?: string
  subject?: string
  category?: string
  status?: string
  tags?: string[]
  techStack?: string[]
  difficulty?: string
  featured?: boolean
}

export interface TopContent {
  notes: Pick<Note, '_id' | 'title' | 'slug' | 'subject' | 'viewCount'>[]
  tips: Pick<Tip, '_id' | 'title' | 'slug' | 'category' | 'viewCount'>[]
  projects: Pick<Project, '_id' | 'title' | 'slug' | 'status' | 'viewCount'>[]
}

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api/v1'

export function buildQuery(params?: Record<string, string | undefined>): string {
  if (!params) return ''
  const entries = Object.entries(params).filter(
    (entry): entry is [string, string] => entry[1] !== undefined && entry[1] !== '',
  )
  if (entries.length === 0) return ''
  return `?${new URLSearchParams(entries).toString()}`
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, { credentials: 'include', ...options })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}) as { error?: string })
    throw new Error(body.error || `Request failed: ${res.status}`)
  }
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

function jsonBody(data: unknown): RequestInit {
  return { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }
}

// --- Reads ---
export const getHealth = () => request<HealthResponse>('/health')
export const getMeta = () => request<Meta>('/meta')

export const getNotes = (params?: { subject?: string; difficulty?: string; tag?: string; search?: string }) =>
  request<Note[]>(`/notes${buildQuery(params)}`)
export const getNoteBySlug = (slug: string) => request<Note>(`/notes/${slug}`)

export const getTips = (params?: { category?: string; tag?: string; search?: string }) =>
  request<Tip[]>(`/tips${buildQuery(params)}`)
export const getTipBySlug = (slug: string) => request<Tip>(`/tips/${slug}`)

export const getProjects = (params?: { status?: string; featured?: string; search?: string }) =>
  request<Project[]>(`/projects${buildQuery(params)}`)
export const getProjectBySlug = (slug: string) => request<Project>(`/projects/${slug}`)

export const getRelated = (type: RelatedContentType, slug: string, limit = 4) =>
  request<RelatedItem[]>(`/related/${type}/${slug}${buildQuery({ limit: String(limit) })}`)

export interface AskSource {
  type: 'note' | 'tip' | 'project'
  title: string
  slug: string
}

export interface AskResponse {
  answer: string
  sources: AskSource[]
}

export const askQuestion = (question: string) =>
  request<AskResponse>('/ask', { method: 'POST', ...jsonBody({ question }) })

export const search = (q: string) => request<SearchResults>(`/search${buildQuery({ q })}`)
export const getStats = () => request<Stats>('/stats')
export const getTopContent = () => request<TopContent>('/stats/top')
export const incrementDownload = (slug: string) =>
  request<{ downloadCount: number }>(`/notes/${slug}/download`, { method: 'POST' })

export const incrementView = (resource: 'notes' | 'tips' | 'projects', slug: string) =>
  request<{ viewCount: number }>(`/${resource}/${slug}/view`, { method: 'POST' })

// --- Auth (admin) ---
export const login = (email: string, password: string) =>
  request<AdminSession>('/auth/login', { method: 'POST', ...jsonBody({ email, password }) })
export const logout = () => request<void>('/auth/logout', { method: 'POST' })
export const getMe = () => request<AdminSession>('/auth/me')

// --- Account (regular users — separate system from admin auth above) ---
export const registerAccount = (name: string, email: string, password: string) =>
  request<Account>('/account/register', { method: 'POST', ...jsonBody({ name, email, password }) })
export const loginAccount = (email: string, password: string) =>
  request<Account>('/account/login', { method: 'POST', ...jsonBody({ email, password }) })
export const logoutAccount = () => request<void>('/account/logout', { method: 'POST' })
export const getAccount = () => request<Account>('/account/me')

export const getProgress = () => request<ProgressItem[]>('/account/progress')
export const toggleProgress = (contentType: ProgressContentType, slug: string) =>
  request<{ completed: boolean }>('/account/progress', { method: 'POST', ...jsonBody({ contentType, slug }) })

export const getSavedItems = () => request<SavedItemRecord[]>('/account/saved')
export const toggleSavedItem = (contentType: SavedContentType, slug: string, title: string, subtitle: string) =>
  request<{ saved: boolean }>('/account/saved', {
    method: 'POST',
    ...jsonBody({ contentType, slug, title, subtitle }),
  })

// --- Writes (admin only) ---
export const createNote = (data: Partial<Note>) =>
  request<Note>('/notes', { method: 'POST', ...jsonBody(data) })
export const updateNote = (id: string, data: Partial<Note>) =>
  request<Note>(`/notes/${id}`, { method: 'PUT', ...jsonBody(data) })
export const deleteNote = (id: string) => request<void>(`/notes/${id}`, { method: 'DELETE' })

export const createTip = (data: Partial<Tip>) =>
  request<Tip>('/tips', { method: 'POST', ...jsonBody(data) })
export const updateTip = (id: string, data: Partial<Tip>) =>
  request<Tip>(`/tips/${id}`, { method: 'PUT', ...jsonBody(data) })
export const deleteTip = (id: string) => request<void>(`/tips/${id}`, { method: 'DELETE' })

export const createProject = (data: Partial<Project>) =>
  request<Project>('/projects', { method: 'POST', ...jsonBody(data) })
export const updateProject = (id: string, data: Partial<Project>) =>
  request<Project>(`/projects/${id}`, { method: 'PUT', ...jsonBody(data) })
export const deleteProject = (id: string) => request<void>(`/projects/${id}`, { method: 'DELETE' })

// File upload — multipart, so it bypasses the JSON `request` helper.
export async function uploadFile(file: File): Promise<{ url: string }> {
  const formData = new FormData()
  formData.append('file', file)
  const res = await fetch(`${API_URL}/upload`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}) as { error?: string })
    throw new Error(body.error || `Upload failed: ${res.status}`)
  }
  return res.json()
}
