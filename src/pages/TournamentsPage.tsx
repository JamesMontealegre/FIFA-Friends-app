import { Link } from 'react-router-dom'
import { PageLayout } from '../components/layout/PageLayout'
import { TournamentCard } from '../components/tournament/TournamentCard'
import { Spinner } from '../components/ui/Spinner'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { useTournaments } from '../hooks/useTournaments'
import { useAdmin } from '../hooks/useAdmin'

export function TournamentsPage() {
  const { data: tournaments, isLoading } = useTournaments()
  const isAdmin = useAdmin()

  return (
    <PageLayout
      title="Torneos"
      actions={
        isAdmin ? (
          <Link to="/tournaments/new">
            <Button>+ Nuevo Torneo</Button>
          </Link>
        ) : undefined
      }
    >
      {isLoading && (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      )}

      {tournaments && tournaments.length === 0 && (
        <EmptyState message="No hay torneos creados" icon="🏆" />
      )}

      {tournaments && tournaments.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tournaments.map((t) => (
            <TournamentCard key={t.id} tournament={t} />
          ))}
        </div>
      )}
    </PageLayout>
  )
}
