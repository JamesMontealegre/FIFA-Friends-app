import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageLayout } from '../components/layout/PageLayout'
import { Button } from '../components/ui/Button'
import { useAuth } from '../hooks/useAuth'
import { findTournamentByCode, joinTournament } from '../services/tournamentService'
import toast from 'react-hot-toast'

export function JoinTournamentPage() {
  const { user, userDoc } = useAuth()
  const navigate = useNavigate()
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)

  const handleJoin = async () => {
    if (!user || !userDoc) return
    setLoading(true)

    try {
      const tournament = await findTournamentByCode(code.trim())

      if (!tournament) {
        toast.error('Codigo no encontrado')
        return
      }

      if (tournament.status !== 'draft') {
        toast.error('Este torneo ya comenzo')
        return
      }

      if (tournament.players.some((p) => p.uid === user.uid)) {
        toast('Ya estas en este torneo')
        navigate(`/tournaments/${tournament.id}`)
        return
      }

      await joinTournament(tournament.id, {
        uid: userDoc.uid,
        displayName: userDoc.displayName,
        photoURL: userDoc.photoURL,
        tier: userDoc.tier,
      })

      toast.success(`Te uniste a "${tournament.name}"`)
      navigate(`/tournaments/${tournament.id}`)
    } catch {
      toast.error('Error al unirse al torneo')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageLayout title="Unirse a Torneo">
      <div className="max-w-sm mx-auto space-y-6">
        <p className="text-sm text-gray-400 text-center">
          Ingresa el codigo de invitacion que te compartieron
        </p>
        <div>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Ej: ABC123"
            maxLength={6}
            className="w-full px-4 py-3 bg-surface-card border border-white/10 rounded-lg
                       text-center text-2xl font-mono tracking-[0.3em] text-gray-200
                       placeholder-gray-500 uppercase
                       focus:outline-none focus:ring-2 focus:ring-neon/50 focus:border-neon/50"
          />
        </div>
        <Button
          onClick={handleJoin}
          loading={loading}
          disabled={code.trim().length < 6}
          className="w-full"
        >
          Unirse
        </Button>
      </div>
    </PageLayout>
  )
}
