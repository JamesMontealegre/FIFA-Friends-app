import type { PalmaresDoc } from '../../types/palmares'
import { TrophyBadge } from './TrophyBadge'

interface PalmaresTableProps {
  palmares: PalmaresDoc[]
}

export function PalmaresTable({ palmares }: PalmaresTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/10 text-gray-500">
            <th className="py-3 px-2 text-left w-8">#</th>
            <th className="py-3 px-2 text-left">Jugador</th>
            <th className="py-3 px-1 text-center">PJ</th>
            <th className="py-3 px-1 text-center">G</th>
            <th className="py-3 px-1 text-center">E</th>
            <th className="py-3 px-1 text-center">P</th>
            <th className="py-3 px-1 text-center">GF</th>
            <th className="py-3 px-1 text-center">GC</th>
            <th className="py-3 px-2 text-center font-bold text-neon">PTS</th>
            <th className="py-3 px-2 text-center">Trofeos</th>
          </tr>
        </thead>
        <tbody>
          {palmares.map((p, i) => (
            <tr key={p.uid} className="border-b border-white/5 last:border-0 hover:bg-white/5">
              <td className="py-3 px-2 text-gray-500 font-medium">{i + 1}</td>
              <td className="py-3 px-2">
                <div className="flex items-center gap-2">
                  {p.photoURL ? (
                    <img src={p.photoURL} alt="" className="w-6 h-6 rounded-full" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-surface-dark flex items-center justify-center text-xs text-gray-400">
                      {p.displayName[0]}
                    </div>
                  )}
                  <span className="font-medium text-gray-200 truncate max-w-[120px]">{p.displayName}</span>
                </div>
              </td>
              <td className="py-3 px-1 text-center text-gray-400">{p.totalMatchesPlayed}</td>
              <td className="py-3 px-1 text-center text-gray-400">{p.totalWins}</td>
              <td className="py-3 px-1 text-center text-gray-400">{p.totalDraws}</td>
              <td className="py-3 px-1 text-center text-gray-400">{p.totalLosses}</td>
              <td className="py-3 px-1 text-center text-gray-400">{p.totalGoalsFor}</td>
              <td className="py-3 px-1 text-center text-gray-400">{p.totalGoalsAgainst}</td>
              <td className="py-3 px-2 text-center font-bold text-neon">{p.totalPoints}</td>
              <td className="py-3 px-2 text-center">
                <TrophyBadge count={p.tournamentsWonCount} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
