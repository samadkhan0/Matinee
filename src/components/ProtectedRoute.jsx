import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()
  if (loading) return <FullScreenLoader />
  if (!user) return <Navigate to="/auth" state={{ from: location.pathname }} replace />
  return children
}

export function FullScreenLoader({ label = 'Threading the projector' }) {
  return (
    <div className="grid min-h-dvh place-items-center">
      <p className="eyebrow animate-pulse">{label}…</p>
    </div>
  )
}
