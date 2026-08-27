import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAccount } from '../context/AccountContext'
import { useToast } from '../context/ToastContext'
import { usePageTitle } from '../hooks/usePageTitle'
import { ClayCard } from '../components/ui/Card'

export default function SignUp() {
  usePageTitle('Sign Up')
  const { register } = useAccount()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await register(name, email, password)
      showToast('Account created — welcome!')
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign up failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex justify-center py-10">
      <ClayCard className="w-full max-w-sm px-8 py-10">
        <h1 className="font-display text-2xl font-bold">Create Account</h1>
        <p className="mt-1 text-sm text-muted">
          Anything you've already marked done or saved in this browser carries over automatically.
        </p>
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <input
            type="text"
            required
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
            className="glass-card rounded-xl px-4 py-2.5 text-sm outline-none"
          />
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="glass-card rounded-xl px-4 py-2.5 text-sm outline-none"
          />
          <input
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password (min. 8 characters)"
            className="glass-card rounded-xl px-4 py-2.5 text-sm outline-none"
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-accent px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
          >
            {loading ? 'Creating account…' : 'Sign up'}
          </button>
        </form>
        <p className="mt-5 text-center text-sm text-muted">
          Already have an account?{' '}
          <Link to="/signin" className="font-medium text-accent">
            Sign in
          </Link>
        </p>
      </ClayCard>
    </div>
  )
}
