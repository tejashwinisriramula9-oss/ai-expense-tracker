import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function ProtectedRoute() {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-8 shadow-panel">
          <p className="animate-pulse text-xl">Loading dashboard…</p>
        </div>
      </div>
    )
  }
  return user ? <Outlet /> : <Navigate to="/login" replace />
}
