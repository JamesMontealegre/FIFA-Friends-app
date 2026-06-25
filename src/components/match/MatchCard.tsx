import clsx from 'clsx'
import type { MatchDoc } from '../../types/tournament'

interface MatchCardProps {
  match: MatchDoc
  onClick?: () => void
}

export function MatchCard({ match, onClick }: MatchCardProps) {
  const isCompleted = match.status === 'completed'
  const hasTeams = match.homeTeam && match.awayTeam

  return (
    <div
      onClick={onClick}
      className={clsx(
        'flex items-center gap-3 px-4 py-3 rounded-lg border transition-colors',
        onClick && 'cursor-pointer hover:bg-white/5',
        isCompleted ? 'border-neon/20 bg-neon/5' : 'border-white/10 bg-surface-card',
      )}
    >
      {/* Home */}
      <div className="flex-1 text-right">
        <p className="text-sm font-medium text-gray-200 truncate">{match.homePlayer.displayName}</p>
        {match.homeTeam && (
          <p className="text-xs text-gray-500">
            {match.homeTeam.flag} {match.homeTeam.team}
          </p>
        )}
      </div>

      {/* Score / VS */}
      <div className="flex items-center gap-2 min-w-[80px] justify-center">
        {isCompleted ? (
          <span className="font-bold text-lg text-neon">
            {match.homeScore} - {match.awayScore}
          </span>
        ) : hasTeams ? (
          <span className="text-xs text-gray-500 font-medium">VS</span>
        ) : (
          <span className="text-xs text-gray-600">Pendiente</span>
        )}
      </div>

      {/* Away */}
      <div className="flex-1 text-left">
        <p className="text-sm font-medium text-gray-200 truncate">{match.awayPlayer.displayName}</p>
        {match.awayTeam && (
          <p className="text-xs text-gray-500">
            {match.awayTeam.flag} {match.awayTeam.team}
          </p>
        )}
      </div>

      {/* Leg indicator */}
      {match.tieId && (
        <span className="text-[10px] text-gray-500 font-medium">
          {match.leg === 1 ? 'IDA' : 'VTA'}
        </span>
      )}
    </div>
  )
}
