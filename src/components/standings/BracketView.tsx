import type { MatchDoc } from '../../types/tournament'
import { MatchCard } from '../match/MatchCard'

interface BracketViewProps {
  matches: MatchDoc[]
  onMatchClick?: (match: MatchDoc) => void
}

export function BracketView({ matches, onMatchClick }: BracketViewProps) {
  // Group by round
  const rounds = [...new Set(matches.map((m) => m.round))].sort((a, b) => a - b)

  if (matches.length === 0) {
    return <p className="text-sm text-gray-500 text-center py-8">No hay partidos de eliminacion</p>
  }

  const getRoundLabel = (round: number, totalRounds: number): string => {
    const fromEnd = totalRounds - round
    if (fromEnd === 0) return 'Final'
    if (fromEnd === 1) return 'Semifinal'
    if (fromEnd === 2) return 'Cuartos'
    if (fromEnd === 3) return 'Octavos'
    return `Ronda ${round}`
  }

  return (
    <div className="flex gap-6 overflow-x-auto pb-4">
      {rounds.map((round) => {
        const roundMatches = matches.filter((m) => m.round === round)
        return (
          <div key={round} className="min-w-[250px] flex-shrink-0">
            <h4 className="text-sm font-medium text-gray-500 mb-3 text-center">
              {getRoundLabel(round, rounds.length)}
            </h4>
            <div className="space-y-4 flex flex-col justify-around h-full">
              {roundMatches.map((m) => (
                <MatchCard
                  key={m.id}
                  match={m}
                  onClick={onMatchClick ? () => onMatchClick(m) : undefined}
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
