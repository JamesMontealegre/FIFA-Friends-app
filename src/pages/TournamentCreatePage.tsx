import { useNavigate } from 'react-router-dom'
import { PageLayout } from '../components/layout/PageLayout'
import { TournamentForm } from '../components/tournament/TournamentForm'
import { createTournament } from '../services/tournamentService'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'

interface FormData {
  name: string
  type: 'league' | 'cup'
  homeAway: boolean
  leagueConfig: { playoffSize: number }
  cupConfig: { numberOfGroups: number; teamsPerGroup: number; advancePerGroup: number }
}

export function TournamentCreatePage() {
  const { userDoc } = useAuth()
  const navigate = useNavigate()

  const handleCreate = async (data: FormData) => {
    if (!userDoc) {
      toast.error('Error: usuario no disponible. Intenta recargar la pagina.')
      return
    }

    try {
      const tournamentId = await createTournament({
        name: data.name,
        type: data.type,
        homeAway: data.homeAway,
        createdBy: {
          uid: userDoc.uid,
          displayName: userDoc.displayName,
          photoURL: userDoc.photoURL,
          tier: userDoc.tier,
        },
        ...(data.type === 'league'
          ? { leagueConfig: data.leagueConfig }
          : { cupConfig: data.cupConfig }),
      })

      toast.success('Torneo creado exitosamente')
      navigate(`/tournaments/${tournamentId}`)
    } catch (err) {
      console.error('Error creating tournament:', err)
      const msg = err instanceof Error ? err.message : ''
      if (msg.includes('permission') || msg.includes('PERMISSION_DENIED')) {
        toast.error('Sin permisos para crear torneos. Verifica las reglas de Firestore.')
      } else {
        toast.error('Error al crear el torneo. Verifica tu conexion.')
      }
    }
  }

  return (
    <PageLayout title="Nuevo Torneo">
      <TournamentForm onSubmit={handleCreate} />
    </PageLayout>
  )
}
