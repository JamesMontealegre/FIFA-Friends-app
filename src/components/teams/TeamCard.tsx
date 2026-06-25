import type { Team } from '../../types/team'
import { Card } from '../ui/Card'

function StarRating({ stars }: { stars: number }) {
  const full = Math.floor(stars)
  const half = stars % 1 >= 0.5
  return (
    <span className="text-amber-400 text-sm">
      {'\u2605'.repeat(full)}
      {half && '\u00BD'}
    </span>
  )
}

function RatingBar({ label, value, max = 100 }: { label: string; value: number; max?: number }) {
  const pct = Math.round((value / max) * 100)
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-8 text-gray-500 font-medium">{label}</span>
      <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-neon/70 rounded-full"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-6 text-right text-gray-400">{value}</span>
    </div>
  )
}

export function TeamCard({ team }: { team: Team }) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3 mb-3">
        <span className="text-3xl">{team.flag}</span>
        <div className="min-w-0">
          <h3 className="font-semibold text-gray-100 truncate">{team.team}</h3>
          <div className="flex items-center gap-2">
            <StarRating stars={team.stars} />
            <span className="text-xs text-gray-500">GRL {team.GRL}</span>
          </div>
        </div>
      </div>
      <div className="space-y-1.5">
        <RatingBar label="ATA" value={team.ATA} />
        <RatingBar label="MED" value={team.MED} />
        <RatingBar label="DEF" value={team.DEF} />
      </div>
    </Card>
  )
}
