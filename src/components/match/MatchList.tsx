import type { MatchDoc } from '../../types/tournament'
import { MatchCard } from './MatchCard'
import { EmptyState } from '../ui/EmptyState'

interface MatchListProps {
  matches: MatchDoc[]
  onMatchClick?: (match: MatchDoc) => void
  groupByRound?: boolean
  roundLabelFn?: (round: number, totalRounds: number) => string
}

export function MatchList({ matches, onMatchClick, groupByRound = true, roundLabelFn }: MatchListProps) {
  if (matches.length === 0) {
    return <EmptyState message="No hay partidos" icon="&#9917;" />
  }

  if (!groupByRound) {
    return (
      <div className="space-y-2">
        {matches.map((m) => (
          <MatchCard key={m.id} match={m} onClick={onMatchClick ? () => onMatchClick(m) : undefined} />
        ))}
      </div>
    )
  }

  // Group by round
  const rounds = [...new Set(matches.map((m) => m.round))].sort((a, b) => a - b)

  return (
    <div className="space-y-6">
      {rounds.map((round) => {
        const roundMatches = matches.filter((m) => m.round === round)
        const group = roundMatches[0]?.group
        return (
          <div key={round}>
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              {roundLabelFn ? roundLabelFn(round, rounds.length) : `${group ? `Grupo ${group} - ` : ''}Jornada ${round}`}
            </h3>
            <div className="space-y-2">
              {roundMatches.map((m) => (
                <MatchCard key={m.id} match={m} onClick={onMatchClick ? () => onMatchClick(m) : undefined} />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
