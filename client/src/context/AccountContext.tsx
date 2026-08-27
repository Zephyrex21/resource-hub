import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import * as api from '../lib/api'
import type { Account } from '../lib/api'

type Status = 'checking' | 'signed-in' | 'signed-out'

interface AccountContextValue {
  status: Status
  user: Account | null
  error: string | null
  register: (name: string, email: string, password: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  clearError: () => void
}

const AccountContext = createContext<AccountContextValue | undefined>(undefined)

// Deliberately separate from context/AuthContext.tsx, which is the site
// admin's own login for the content-editing panel. This is for regular
// visitors creating a personal account to sync progress/bookmarks across
// devices — two different systems (different cookies, different backend
// routes, different middleware server-side), so there's no path by which
// an admin session and a visitor's account session could be confused for
// one another anywhere in the stack.
export function AccountProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>('checking')
  const [user, setUser] = useState<Account | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api
      .getAccount()
      .then((account) => {
        setUser(account)
        setStatus('signed-in')
      })
      .catch(() => setStatus('signed-out'))
  }, [])

  async function register(name: string, email: string, password: string) {
    setError(null)
    try {
      const account = await api.registerAccount(name, email, password)
      setUser(account)
      setStatus('signed-in')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong'
      setError(message)
      throw err
    }
  }

  async function signIn(email: string, password: string) {
    setError(null)
    try {
      const account = await api.loginAccount(email, password)
      setUser(account)
      setStatus('signed-in')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong'
      setError(message)
      throw err
    }
  }

  async function signOut() {
    await api.logoutAccount().catch(() => undefined)
    setUser(null)
    setStatus('signed-out')
  }

  function clearError() {
    setError(null)
  }

  return (
    <AccountContext.Provider value={{ status, user, error, register, signIn, signOut, clearError }}>
      {children}
    </AccountContext.Provider>
  )
}

export function useAccount() {
  const ctx = useContext(AccountContext)
  if (!ctx) throw new Error('useAccount must be used within an AccountProvider')
  return ctx
}
