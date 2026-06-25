import { PageLayout } from '../components/layout/PageLayout'
import { PalmaresTable } from '../components/palmares/PalmaresTable'
import { Spinner } from '../components/ui/Spinner'
import { EmptyState } from '../components/ui/EmptyState'
import { usePalmares } from '../hooks/usePalmares'

export function PalmaresPage() {
  const { palmares, loading } = usePalmares()

  return (
    <PageLayout title="Palmares">
      {loading && (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      )}

      {!loading && palmares.length === 0 && (
        <EmptyState message="No hay datos de palmares aun" icon="🏆" />
      )}

      {palmares.length > 0 && (
        <div className="bg-surface-card rounded-xl border border-white/10 overflow-hidden">
          <PalmaresTable palmares={palmares} />
        </div>
      )}
    </PageLayout>
  )
}
