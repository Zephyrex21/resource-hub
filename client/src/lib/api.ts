export interface HealthResponse {
  status: string
  db: string
  timestamp: string
}

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api/v1'

export async function getHealth(): Promise<HealthResponse> {
  const res = await fetch(`${API_URL}/health`)
  if (!res.ok) throw new Error(`Health check failed: ${res.status}`)
  return res.json()
}
