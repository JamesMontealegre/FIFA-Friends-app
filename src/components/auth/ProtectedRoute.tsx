import { Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { Spinner } from '../ui/Spinner'
import type { ReactNode } from 'react'

interface ProtectedRouteProps {
  children: ReactNode
  adminOnly?: boolean
}

export function ProtectedRoute({ children, adminOnly }: ProtectedRouteProps) {
  const { user, isAdmin, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />
  if (adminOnly && !isAdmin) return <Navigate to="/" replace />

  return <>{children}</>
}
