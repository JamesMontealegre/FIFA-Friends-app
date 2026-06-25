import type { StandingRow, FormResult } from '../../types/tournament'

interface StandingsTableProps {
  rows: StandingRow[]
  highlightTop?: number
}

function FormBadge({ result }: { result: FormResult }) {
  if (result === 'W') {
    return (
      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-500/20 text-green-400 text-xs font-bold">
        &#10003;
      </span>
    )
  }
  if (result === 'L') {
    return (
      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-500/20 text-red-400 text-xs font-bold">
        &#10005;
      </span>
    )
  }
  return (
    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-bold">
      &ndash;
    </span>
  )
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
            <th className="py-2 px-2 text-center">Forma</th>
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
              <td className="py-2 px-2 max-w-[130px]">
                <div className="flex items-center gap-2 min-w-0">
                  {row.photoURL ? (
                    <img
                      src={row.photoURL}
                      alt=""
                      className="w-6 h-6 rounded-full shrink-0"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-gray-400 shrink-0">
                      {row.displayName.charAt(0)}
                    </div>
                  )}
                  <span className="font-medium text-gray-200 truncate">{row.displayName}</span>
                </div>
              </td>
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
              <td className="py-2 px-2">
                <div className="flex items-center justify-center gap-0.5">
                  {row.form.length > 0 ? (
                    row.form.map((r, j) => <FormBadge key={j} result={r} />)
                  ) : (
                    <span className="text-xs text-gray-600">&mdash;</span>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
