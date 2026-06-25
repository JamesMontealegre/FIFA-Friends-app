import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { LoginButton } from '../components/auth/LoginButton'
import { Spinner } from '../components/ui/Spinner'

export function LoginPage() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-surface">
        <Spinner size="lg" />
      </div>
    )
  }

  if (user) return <Navigate to="/" replace />

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4">
      <div className="bg-surface-light rounded-2xl shadow-2xl shadow-black/50 border border-neon/20 p-8 w-full max-w-sm text-center">
        <div className="text-5xl mb-4">&#9917;</div>
        <h1 className="text-2xl font-bold text-neon neon-text mb-2">FIFA Friends</h1>
        <p className="text-gray-500 mb-8">Gestion de torneos entre amigos</p>
        <LoginButton />
      </div>
    </div>
  )
}
