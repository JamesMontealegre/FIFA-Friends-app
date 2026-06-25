import type { StandingRow } from '../../types/tournament'

interface StandingsTableProps {
  rows: StandingRow[]
  highlightTop?: number
}

export function StandingsTable({ rows, highlightTop = 0 }: StandingsTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/10 text-gray-500">
            <th className="py-2 px-2 text-left w-8">#</th>
            <th className="py-2 px-2 text-left">Jugador</th>
            <th className="py-2 px-1 text-center">PJ</th>
            <th className="py-2 px-1 text-center">G</th>
            <th className="py-2 px-1 text-center">E</th>
            <th className="py-2 px-1 text-center">P</th>
            <th className="py-2 px-1 text-center">GF</th>
            <th className="py-2 px-1 text-center">GC</th>
            <th className="py-2 px-1 text-center">DG</th>
            <th className="py-2 px-2 text-center font-bold text-neon">PTS</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={row.uid}
              className={`border-b border-white/5 last:border-0 ${
                i < highlightTop ? 'bg-neon/5' : ''
              }`}
            >
              <td className="py-2 px-2 text-gray-500">{i + 1}</td>
              <td className="py-2 px-2 font-medium text-gray-200 truncate max-w-[120px]">{row.displayName}</td>
              <td className="py-2 px-1 text-center text-gray-400">{row.played}</td>
              <td className="py-2 px-1 text-center text-gray-400">{row.won}</td>
              <td className="py-2 px-1 text-center text-gray-400">{row.drawn}</td>
              <td className="py-2 px-1 text-center text-gray-400">{row.lost}</td>
              <td className="py-2 px-1 text-center text-gray-400">{row.goalsFor}</td>
              <td className="py-2 px-1 text-center text-gray-400">{row.goalsAgainst}</td>
              <td className="py-2 px-1 text-center text-gray-400">
                {row.goalDifference > 0 ? '+' : ''}{row.goalDifference}
              </td>
              <td className="py-2 px-2 text-center font-bold text-neon">{row.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
