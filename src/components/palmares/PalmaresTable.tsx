import type { PalmaresDoc } from '../../types/palmares'

interface PalmaresTableProps {
  palmares: PalmaresDoc[]
}

const MEDAL: Record<number, string> = { 1: '\uD83E\uDD47', 2: '\uD83E\uDD48', 3: '\uD83E\uDD49' }

export function PalmaresTable({ palmares }: PalmaresTableProps) {
  return (
    <div>
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-white/10 text-gray-500">
            <th className="py-3 px-1 text-left w-6">#</th>
            <th className="py-3 px-1 text-left">Jugador</th>
            <th className="py-3 px-1 text-center" title="Campeonatos">{'\uD83C\uDFC6'}</th>
            <th className="py-3 px-1 text-center" title="Segundos puestos">{'\uD83E\uDD48'}</th>
            <th className="py-3 px-1 text-center" title="Terceros puestos">{'\uD83E\uDD49'}</th>
            <th className="py-3 px-1 text-center">PJ</th>
            <th className="py-3 px-1 text-center">G</th>
            <th className="py-3 px-1 text-center">E</th>
            <th className="py-3 px-1 text-center">P</th>
            <th className="py-3 px-1 text-center">GF</th>
            <th className="py-3 px-1 text-center">GC</th>
            <th className="py-3 px-1 text-center font-bold text-neon">PTS</th>
          </tr>
        </thead>
        <tbody>
          {palmares.map((p, i) => {
            const pos = i + 1
            const medal = MEDAL[pos]
            return (
              <tr key={p.uid} className="border-b border-white/5 last:border-0 hover:bg-white/5">
                <td className="py-3 px-1 font-medium">
                  {medal ? <span className="text-base">{medal}</span> : <span className="text-gray-500">{pos}</span>}
                </td>
                <td className="py-3 px-1">
                  <div className="flex items-center gap-2">
                    {p.photoURL ? (
                      <img src={p.photoURL} alt="" className="w-6 h-6 rounded-full" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-surface-dark flex items-center justify-center text-xs text-gray-400">
                        {p.displayName[0]}
                      </div>
                    )}
                    <span className="font-medium text-gray-200 truncate max-w-[80px]">{p.displayName}</span>
                  </div>
                </td>
                <td className="py-3 px-1 text-center font-bold text-yellow-400">{p.tournamentsWonCount || '-'}</td>
                <td className="py-3 px-1 text-center text-gray-400">{p.secondPlaces || '-'}</td>
                <td className="py-3 px-1 text-center text-gray-400">{p.thirdPlaces || '-'}</td>
                <td className="py-3 px-1 text-center text-gray-400">{p.totalMatchesPlayed}</td>
                <td className="py-3 px-1 text-center text-gray-400">{p.totalWins}</td>
                <td className="py-3 px-1 text-center text-gray-400">{p.totalDraws}</td>
                <td className="py-3 px-1 text-center text-gray-400">{p.totalLosses}</td>
                <td className="py-3 px-1 text-center text-gray-400">{p.totalGoalsFor}</td>
                <td className="py-3 px-1 text-center text-gray-400">{p.totalGoalsAgainst}</td>
                <td className="py-3 px-1 text-center font-bold text-neon">{p.totalPoints}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
