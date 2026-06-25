import type { StandingTable, MatchDoc } from '../../types/tournament'
import { StandingsTable } from './StandingsTable'
import { MatchList } from '../match/MatchList'

interface GroupStageViewProps {
  tables: StandingTable[]
  matches: MatchDoc[]
  advancePerGroup: number
  onMatchClick?: (match: MatchDoc) => void
}

export function GroupStageView({ tables, matches, advancePerGroup, onMatchClick }: GroupStageViewProps) {
  return (
    <div className="space-y-8">
      {tables.map((table) => {
        const groupMatches = matches.filter((m) => m.group === table.group)
        return (
          <div key={table.group ?? 'league'}>
            {table.group && (
              <h3 className="text-lg font-semibold text-gray-200 mb-3">Grupo {table.group}</h3>
            )}
            <div className="bg-surface-card rounded-xl border border-white/10 p-4 mb-4">
              <StandingsTable rows={table.rows} highlightTop={advancePerGroup} />
            </div>
            <MatchList matches={groupMatches} onMatchClick={onMatchClick} />
          </div>
        )
      })}
    </div>
  )
}
