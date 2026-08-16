import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import * as api from '../lib/api'

type Status = 'checking' | 'authenticated' | 'guest'

interface AuthContextValue {
  status: Status
  email: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>('checking')
  const [email, setEmail] = useState<string | null>(null)

  useEffect(() => {
    api
      .getMe()
      .then((session) => {
        setEmail(session.email)
        setStatus('authenticated')
      })
      .catch(() => setStatus('guest'))
  }, [])

  async function login(emailInput: string, password: string) {
    const session = await api.login(emailInput, password)
    setEmail(session.email)
    setStatus('authenticated')
  }

  async function logout() {
    await api.logout().catch(() => undefined)
    setEmail(null)
    setStatus('guest')
  }

  return <AuthContext.Provider value={{ status, email, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
