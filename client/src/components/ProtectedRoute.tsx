import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Loading } from './ui/StateViews'

export default function ProtectedRoute() {
  const { status } = useAuth()

  if (status === 'checking') return <Loading label="Checking session…" />
  if (status === 'guest') return <Navigate to="/admin/login" replace />

  return <Outlet />
}
