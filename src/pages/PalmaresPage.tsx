import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { PageLayout } from '../components/layout/PageLayout'
import { PalmaresTable } from '../components/palmares/PalmaresTable'
import { CollapsibleSection } from '../components/ui/CollapsibleSection'
import { Button } from '../components/ui/Button'
import { Spinner } from '../components/ui/Spinner'
import { EmptyState } from '../components/ui/EmptyState'
import { usePalmares } from '../hooks/usePalmares'
import { useAdmin } from '../hooks/useAdmin'
import { recalculateAllPalmares } from '../services/palmaresService'
import { hasActivity, sortPalmaresRows } from '../types/palmares'
import type { PalmaresDoc, PalmaresRow } from '../types/palmares'
import type { TournamentVenue } from '../types/tournament'

const VENUES: { venue: TournamentVenue; title: string; icon: string }[] = [
  { venue: 'presencial', title: 'Presencial', icon: '🏠' },
  { venue: 'remoto', title: 'Remoto', icon: '🌐' },
]

/** Pair each player's identity with the stats for one venue, dropping those who never played there. */
function rowsForVenue(palmares: PalmaresDoc[], venue: TournamentVenue): PalmaresRow[] {
  const rows = palmares
    .filter((p) => hasActivity(p.byVenue?.[venue]))
    .map((p) => ({
      uid: p.uid,
      displayName: p.displayName,
      photoURL: p.photoURL,
      ...p.byVenue![venue],
    }))
  return sortPalmaresRows(rows)
}

function playerCount(n: number) {
  return `${n} jugador${n === 1 ? '' : 'es'}`
}

export function PalmaresPage() {
  const { palmares, loading } = usePalmares()
  const isAdmin = useAdmin()
  const [recalculating, setRecalculating] = useState(false)

  const handleRecalculate = async () => {
    setRecalculating(true)
    try {
      const count = await recalculateAllPalmares()
      toast.success(
        count > 0
          ? `Palmares recalculado para ${count} jugador${count === 1 ? '' : 'es'}`
          : 'No hay torneos finalizados para recalcular',
      )
    } catch (err) {
      console.error('Error recalculating palmares:', err)
      toast.error('Error al recalcular el palmares')
    } finally {
      setRecalculating(false)
    }
  }

  const venueSections = useMemo(
    () =>
      VENUES.map((v) => ({ ...v, rows: rowsForVenue(palmares, v.venue) })).filter(
        (s) => s.rows.length > 0,
      ),
    [palmares],
  )

  return (
    <PageLayout
      title="Palmares"
      actions={
        isAdmin && palmares.length > 0 ? (
          <Button variant="secondary" onClick={handleRecalculate} loading={recalculating}>
            Recalcular
          </Button>
        ) : undefined
      }
    >
      {loading && (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      )}

      {!loading && palmares.length === 0 && (
        <EmptyState message="No hay datos de palmares aun" icon="🏆" />
      )}

      {palmares.length > 0 && (
        <div className="space-y-3">
          <CollapsibleSection
            title="Consolidado"
            icon="🏆"
            subtitle={playerCount(palmares.length)}
            defaultOpen
          >
            <PalmaresTable palmares={palmares} />
          </CollapsibleSection>

          {venueSections.map((s) => (
            <CollapsibleSection
              key={s.venue}
              title={s.title}
              icon={s.icon}
              subtitle={playerCount(s.rows.length)}
            >
              <PalmaresTable palmares={s.rows} />
            </CollapsibleSection>
          ))}
        </div>
      )}
    </PageLayout>
  )
}
