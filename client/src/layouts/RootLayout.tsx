import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar'
import ParticleBackground from '../components/ParticleBackground'

export default function RootLayout() {
  return (
    <div className="relative min-h-screen bg-bg font-body text-text transition-colors">
      <ParticleBackground />
      <Navbar />

      <main className="relative mx-auto max-w-5xl px-6 pb-24 pt-28">
        <Outlet />
      </main>

      <footer className="relative mx-auto max-w-5xl px-6 pb-10 text-center text-xs text-muted">
        Built with React, TypeScript, Tailwind &amp; Express — Resource Hub
      </footer>
    </div>
  )
}
