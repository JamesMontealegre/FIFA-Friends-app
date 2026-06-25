import { useState } from 'react'
import { Button } from '../ui/Button'
import type { MatchDoc } from '../../types/tournament'

interface MatchScoreFormProps {
  match: MatchDoc
  onSubmit: (homeScore: number, awayScore: number) => Promise<void>
}

export function MatchScoreForm({ match, onSubmit }: MatchScoreFormProps) {
  const [homeScore, setHomeScore] = useState<string>(match.homeScore?.toString() ?? '')
  const [awayScore, setAwayScore] = useState<string>(match.awayScore?.toString() ?? '')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    const h = parseInt(homeScore)
    const a = parseInt(awayScore)
    if (isNaN(h) || isNaN(a) || h < 0 || a < 0) return

    setLoading(true)
    try {
      await onSubmit(h, a)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        {/* Home */}
        <div className="flex-1 text-center">
          <p className="text-sm font-medium text-gray-200 mb-1">{match.homePlayer.displayName}</p>
          {match.homeTeam && (
            <p className="text-xs text-gray-500 mb-2">
              {match.homeTeam.flag} {match.homeTeam.team}
            </p>
          )}
          <input
            type="number"
            min={0}
            value={homeScore}
            onChange={(e) => setHomeScore(e.target.value)}
            className="w-20 mx-auto px-3 py-2 bg-surface-card border border-white/10 rounded-lg text-center text-lg font-bold text-gray-100 focus:outline-none focus:ring-2 focus:ring-neon/50 focus:border-neon/50"
          />
        </div>

        <span className="text-gray-500 font-bold text-lg">-</span>

        {/* Away */}
        <div className="flex-1 text-center">
          <p className="text-sm font-medium text-gray-200 mb-1">{match.awayPlayer.displayName}</p>
          {match.awayTeam && (
            <p className="text-xs text-gray-500 mb-2">
              {match.awayTeam.flag} {match.awayTeam.team}
            </p>
          )}
          <input
            type="number"
            min={0}
            value={awayScore}
            onChange={(e) => setAwayScore(e.target.value)}
            className="w-20 mx-auto px-3 py-2 bg-surface-card border border-white/10 rounded-lg text-center text-lg font-bold text-gray-100 focus:outline-none focus:ring-2 focus:ring-neon/50 focus:border-neon/50"
          />
        </div>
      </div>

      <Button
        onClick={handleSubmit}
        loading={loading}
        disabled={homeScore === '' || awayScore === ''}
        className="w-full"
      >
        Guardar Resultado
      </Button>
    </div>
  )
}
