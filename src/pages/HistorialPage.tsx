import { PageLayout } from '../components/layout/PageLayout'
import { Spinner } from '../components/ui/Spinner'
import { EmptyState } from '../components/ui/EmptyState'
import { useHistorial } from '../hooks/useHistorial'
import type { TournamentDoc, FinalStanding } from '../types/tournament'

const MEDAL: Record<number, string> = { 1: '\uD83E\uDD47', 2: '\uD83E\uDD48', 3: '\uD83E\uDD49' }

function formatDate(t: TournamentDoc): string {
  if (!t.updatedAt?.toDate) return ''
  const d = t.updatedAt.toDate()
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
}

function TournamentCard({ tournament }: { tournament: TournamentDoc }) {
  const standings = tournament.finalStandings ?? []
  const champion = standings.find((s) => s.position === 1)

  return (
    <div className="bg-surface-card rounded-xl border border-white/10 overflow-hidden">
      <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-200">{tournament.name}</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {tournament.type === 'league' ? 'Liga' : 'Copa'} &middot; {formatDate(tournament)}
          </p>
        </div>
        {champion && (
          <div className="text-sm text-yellow-400 font-medium">
            {'\uD83C\uDFC6'} {champion.displayName}
          </div>
        )}
      </div>

      {standings.length > 0 ? (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-gray-500 text-xs">
              <th className="py-2 px-3 text-left w-10">Pos</th>
              <th className="py-2 px-3 text-left">Jugador</th>
            </tr>
          </thead>
          <tbody>
            {standings
              .sort((a: FinalStanding, b: FinalStanding) => a.position - b.position)
              .map((s: FinalStanding) => {
                const medal = MEDAL[s.position]
                return (
                  <tr key={s.uid} className="border-b border-white/5 last:border-0">
                    <td className="py-2 px-3">
                      {medal ? (
                        <span className="text-base">{medal}</span>
                      ) : (
                        <span className="text-gray-500">{s.position}</span>
                      )}
                    </td>
                    <td className="py-2 px-3 text-gray-300">{s.displayName}</td>
                  </tr>
                )
              })}
          </tbody>
        </table>
      ) : (
        <p className="px-4 py-3 text-sm text-gray-500">Sin posiciones registradas</p>
      )}
    </div>
  )
}

export function HistorialPage() {
  const { tournaments, loading } = useHistorial()

  return (
    <PageLayout title="Historial">
      {loading && (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      )}

      {!loading && tournaments.length === 0 && (
        <EmptyState message="No hay torneos finalizados aun" icon="📜" />
      )}

      {tournaments.length > 0 && (
        <div className="space-y-4">
          {tournaments.map((t) => (
            <TournamentCard key={t.id} tournament={t} />
          ))}
        </div>
      )}
    </PageLayout>
  )
}
