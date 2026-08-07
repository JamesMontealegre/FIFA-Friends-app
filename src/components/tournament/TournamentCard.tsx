import { useNavigate } from 'react-router-dom'
import { Card } from '../ui/Card'
import { TournamentBadge, VenueBadge } from './TournamentBadge'
import type { TournamentDoc } from '../../types/tournament'

export function TournamentCard({ tournament }: { tournament: TournamentDoc }) {
  const navigate = useNavigate()

  return (
    <Card
      className="p-5"
      onClick={() => navigate(`/tournaments/${tournament.id}`)}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-100">{tournament.name}</h3>
          <p className="text-sm text-gray-500 mt-0.5">
            {tournament.type === 'league' ? 'Liguilla' : 'Copa'}
            {tournament.homeAway && ' (Ida y Vuelta)'}
            {tournament.teamMode === 'club' ? ' · Clubes' : ' · Selecciones'}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <TournamentBadge status={tournament.status} />
          <VenueBadge venue={tournament.venue ?? 'presencial'} />
        </div>
      </div>
      <div className="flex items-center gap-1">
        {tournament.players.slice(0, 5).map((p) => (
          <div
            key={p.uid}
            className="w-7 h-7 rounded-full bg-surface-dark overflow-hidden border-2 border-surface-card -ml-1 first:ml-0"
            title={p.displayName}
          >
            {p.photoURL ? (
              <img src={p.photoURL} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs font-medium text-gray-400">
                {p.displayName[0]}
              </div>
            )}
          </div>
        ))}
        {tournament.players.length > 5 && (
          <span className="text-xs text-gray-500 ml-1">
            +{tournament.players.length - 5}
          </span>
        )}
        <span className="text-xs text-gray-500 ml-auto">
          {tournament.players.length} jugadores
        </span>
      </div>
    </Card>
  )
}
