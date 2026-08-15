import { useEffect, useState } from 'react'
import Navbar from './components/Navbar'
import ParticleBackground from './components/ParticleBackground'
import { getHealth } from './lib/api'

type Status = 'loading' | 'online' | 'offline'

export default function App() {
  const [status, setStatus] = useState<Status>('loading')
  const [dbState, setDbState] = useState<string>('unknown')

  useEffect(() => {
    getHealth()
      .then((data) => {
        setStatus('online')
        setDbState(data.db)
      })
      .catch(() => setStatus('offline'))
  }, [])

  return (
    <div className="relative min-h-screen bg-bg font-body text-text transition-colors">
      <ParticleBackground />
      <Navbar />

      <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-6 pt-24 text-center">
        <div className="clay-card w-full rounded-3xl px-8 py-12">
          <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
            Phase 0 — Foundation
          </h1>
          <p className="mt-4 text-muted">
            Theme system, canvas particle background, and a working client &harr; server &harr;
            database connection. Notes, Tips, and Projects come next.
          </p>

          <div className="glass-card mx-auto mt-8 inline-flex items-center gap-3 rounded-full px-5 py-2.5 text-sm">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                status === 'online'
                  ? 'bg-emerald-500'
                  : status === 'offline'
                    ? 'bg-red-500'
                    : 'bg-amber-400'
              }`}
            />
            <span>
              {status === 'loading' && 'Checking backend…'}
              {status === 'online' && `Backend connected · DB: ${dbState}`}
              {status === 'offline' && 'Backend offline — start the server'}
            </span>
          </div>
        </div>
      </main>
    </div>
  )
}
