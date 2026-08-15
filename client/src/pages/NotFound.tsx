import { Link } from 'react-router-dom'
import { GlassCard } from '../components/ui/Card'

export default function NotFound() {
  return (
    <div className="flex justify-center py-16">
      <GlassCard className="px-8 py-10 text-center">
        <h1 className="font-display text-2xl font-bold">404</h1>
        <p className="mt-2 text-sm text-muted">That page doesn't exist.</p>
        <Link to="/" className="clay-btn mt-5 inline-block rounded-full px-5 py-2 text-sm font-medium text-text">
          Back home
        </Link>
      </GlassCard>
    </div>
  )
}
