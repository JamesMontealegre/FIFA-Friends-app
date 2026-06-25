import { Link } from 'react-router-dom'
import { PageLayout } from '../components/layout/PageLayout'
import { Card } from '../components/ui/Card'
import { TournamentCard } from '../components/tournament/TournamentCard'
import { Spinner } from '../components/ui/Spinner'
import { Button } from '../components/ui/Button'
import { useAuth } from '../hooks/useAuth'
import { useTournaments } from '../hooks/useTournaments'

export function DashboardPage() {
  const { userDoc, isAdmin } = useAuth()
  const { data: tournaments, isLoading } = useTournaments()

  const active = tournaments?.filter((t) => t.status !== 'completed') ?? []
  const recent = tournaments?.filter((t) => t.status === 'completed').slice(0, 3) ?? []

  return (
    <PageLayout>
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-100">
          Hola, {userDoc?.displayName?.split(' ')[0] ?? 'Jugador'}
        </h1>
        <p className="text-gray-500 mt-1">Gestion de torneos FIFA entre amigos</p>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
        <Link to="/teams">
          <Card className="p-4 text-center">
            <span className="text-2xl">&#127758;</span>
            <p className="text-sm font-medium mt-2 text-gray-300">Selecciones</p>
          </Card>
        </Link>
        <Link to="/tournaments">
          <Card className="p-4 text-center">
            <span className="text-2xl">&#9917;</span>
            <p className="text-sm font-medium mt-2 text-gray-300">Torneos</p>
          </Card>
        </Link>
        <Link to="/join">
          <Card className="p-4 text-center">
            <span className="text-2xl">&#128279;</span>
            <p className="text-sm font-medium mt-2 text-gray-300">Unirse</p>
          </Card>
        </Link>
        <Link to="/palmares">
          <Card className="p-4 text-center">
            <span className="text-2xl">&#127942;</span>
            <p className="text-sm font-medium mt-2 text-gray-300">Palmares</p>
          </Card>
        </Link>
        {userDoc && (
          <Link to={`/history/${userDoc.uid}`}>
            <Card className="p-4 text-center">
              <span className="text-2xl">&#128202;</span>
              <p className="text-sm font-medium mt-2 text-gray-300">Mi Historial</p>
            </Card>
          </Link>
        )}
      </div>

      {isLoading && (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      )}

      {/* Active tournaments */}
      {active.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-200">Torneos Activos</h2>
            <Link to="/tournaments" className="text-sm text-neon hover:underline">
              Ver todos
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {active.map((t) => (
              <TournamentCard key={t.id} tournament={t} />
            ))}
          </div>
        </div>
      )}

      {/* Recent completed */}
      {recent.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-200 mb-4">Torneos Recientes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recent.map((t) => (
              <TournamentCard key={t.id} tournament={t} />
            ))}
          </div>
        </div>
      )}

      {/* Admin CTA */}
      {isAdmin && tournaments && tournaments.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No hay torneos creados aun</p>
          <Link to="/tournaments/new">
            <Button>Crear Primer Torneo</Button>
          </Link>
        </div>
      )}
    </PageLayout>
  )
}
