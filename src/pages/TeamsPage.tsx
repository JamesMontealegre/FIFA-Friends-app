import { useState, useMemo } from 'react'
import { PageLayout } from '../components/layout/PageLayout'
import { TeamGrid } from '../components/teams/TeamGrid'
import { TeamFilter } from '../components/teams/TeamFilter'
import { Spinner } from '../components/ui/Spinner'
import { useTeams } from '../hooks/useTeams'

export function TeamsPage() {
  const { data: teams, isLoading, error } = useTeams()
  const [selectedStars, setSelectedStars] = useState(0)
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    if (!teams) return []
    return teams.filter((t) => {
      if (selectedStars > 0 && t.stars !== selectedStars) return false
      if (search && !t.team.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [teams, selectedStars, search])

  return (
    <PageLayout title="Selecciones">
      <TeamFilter
        selectedStars={selectedStars}
        onStarsChange={setSelectedStars}
        search={search}
        onSearchChange={setSearch}
      />

      {isLoading && (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      )}

      {error && (
        <div className="text-center py-12 text-red-500">
          Error al cargar selecciones
        </div>
      )}

      {teams && (
        <>
          <p className="text-sm text-gray-500 mb-4">
            {filtered.length} seleccion{filtered.length !== 1 ? 'es' : ''}
          </p>
          <TeamGrid teams={filtered} />
        </>
      )}
    </PageLayout>
  )
}
