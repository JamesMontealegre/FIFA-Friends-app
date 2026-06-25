import type { Team } from '../../types/team'
import { TeamCard } from './TeamCard'

export function TeamGrid({ teams }: { teams: Team[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {teams.map((team) => (
        <TeamCard key={team.team} team={team} />
      ))}
    </div>
  )
}
