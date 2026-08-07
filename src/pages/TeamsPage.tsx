import { useState, useMemo } from 'react'
import clsx from 'clsx'
import { PageLayout } from '../components/layout/PageLayout'
import { TeamGrid } from '../components/teams/TeamGrid'
import { TeamFilter } from '../components/teams/TeamFilter'
import { Spinner } from '../components/ui/Spinner'
import { useTeamsByKind, useLeagues } from '../hooks/useTeams'
import type { TeamKind } from '../types/team'

const TABS: { kind: TeamKind; label: string; icon: string }[] = [
  { kind: 'national', label: 'Selecciones', icon: '🌍' },
  { kind: 'club', label: 'Clubes', icon: '🛡️' },
]

export function TeamsPage() {
  const [kind, setKind] = useState<TeamKind>('national')
  const [selectedStars, setSelectedStars] = useState(0)
  const [selectedLeague, setSelectedLeague] = useState('')
  const [search, setSearch] = useState('')

  const { data: teams, isLoading, error } = useTeamsByKind(kind)
  const { data: leagues } = useLeagues()

  const filtered = useMemo(() => {
    if (!teams) return []
    return teams.filter((t) => {
      if (selectedStars > 0 && t.stars !== selectedStars) return false
      if (selectedLeague && t.league !== selectedLeague) return false
      if (search && !t.team.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [teams, selectedStars, selectedLeague, search])

  function switchTab(next: TeamKind) {
    setKind(next)
    setSelectedLeague('')
    setSearch('')
  }

  const isClubs = kind === 'club'
  const noun = isClubs ? 'club' : 'seleccion'

  return (
    <PageLayout title="Equipos">
      <div className="flex gap-2 mb-6">
        {TABS.map((t) => (
          <button
            key={t.kind}
            onClick={() => switchTab(t.kind)}
            className={clsx(
              'flex-1 sm:flex-none px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors',
              kind === t.kind
                ? 'bg-neon text-black shadow-lg shadow-neon/25'
                : 'bg-white/10 text-gray-400 hover:bg-white/20',
            )}
          >
            <span className="mr-1.5">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      <TeamFilter
        selectedStars={selectedStars}
        onStarsChange={setSelectedStars}
        search={search}
        onSearchChange={setSearch}
        placeholder={isClubs ? 'Buscar club...' : 'Buscar seleccion...'}
        leagues={isClubs ? leagues : undefined}
        selectedLeague={selectedLeague}
        onLeagueChange={isClubs ? setSelectedLeague : undefined}
      />

      {isLoading && (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      )}

      {error && (
        <div className="text-center py-12 text-red-500">
          Error al cargar {isClubs ? 'clubes' : 'selecciones'}
        </div>
      )}

      {teams && !isLoading && (
        <>
          <p className="text-sm text-gray-500 mb-4">
            {filtered.length} {noun}
            {filtered.length !== 1 ? (isClubs ? 'es' : 'es') : ''}
          </p>
          <TeamGrid teams={filtered} />
        </>
      )}
    </PageLayout>
  )
}
