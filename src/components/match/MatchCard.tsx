import clsx from 'clsx'
import type { MatchDoc } from '../../types/tournament'

interface MatchCardProps {
  match: MatchDoc
  onClick?: () => void
}

function PlayerAvatar({ photoURL, name }: { photoURL?: string; name: string }) {
  if (photoURL) {
    return (
      <img
        src={photoURL}
        alt={name}
        className="w-6 h-6 rounded-full flex-shrink-0"
        referrerPolicy="no-referrer"
      />
    )
  }
  return (
    <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-gray-400 flex-shrink-0">
      {name.charAt(0)}
    </div>
  )
}

export function MatchCard({ match, onClick }: MatchCardProps) {
  const isCompleted = match.status === 'completed'
  const hasTeams = match.homeTeam && match.awayTeam

  return (
    <div
      onClick={onClick}
      className={clsx(
        'flex items-center gap-2 px-3 py-3 rounded-lg border transition-colors',
        onClick && 'cursor-pointer hover:bg-white/5',
        isCompleted ? 'border-neon/20 bg-neon/5' : 'border-white/10 bg-surface-card',
      )}
    >
      {/* Home */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-end gap-1.5">
          <p className="font-gaming font-semibold text-sm neon-cyan truncate">
            {match.homePlayer.displayName}
          </p>
          <PlayerAvatar photoURL={match.homePlayer.photoURL} name={match.homePlayer.displayName} />
        </div>
        {match.homeTeam && (
          <p className="text-[11px] text-gray-500 text-right mt-0.5">
            {match.homeTeam.flag} {match.homeTeam.team}
          </p>
        )}
      </div>

      {/* Score / VS */}
      <div className="flex items-center min-w-[60px] justify-center flex-shrink-0">
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
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <PlayerAvatar photoURL={match.awayPlayer.photoURL} name={match.awayPlayer.displayName} />
          <p className="font-gaming font-semibold text-sm neon-pink truncate">
            {match.awayPlayer.displayName}
          </p>
        </div>
        {match.awayTeam && (
          <p className="text-[11px] text-gray-500 mt-0.5">
            {match.awayTeam.flag} {match.awayTeam.team}
          </p>
        )}
      </div>

      {/* Leg indicator */}
      {match.tieId && (
        <span className="text-[10px] text-gray-500 font-medium flex-shrink-0">
          {match.leg === 1 ? 'IDA' : 'VTA'}
        </span>
      )}
    </div>
  )
}
