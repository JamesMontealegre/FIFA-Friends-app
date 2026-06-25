import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { PageLayout } from '../components/layout/PageLayout'
import { MatchScoreForm } from '../components/match/MatchScoreForm'
import { TeamPicker } from '../components/teams/TeamPicker'
import { Button } from '../components/ui/Button'
import { Spinner } from '../components/ui/Spinner'
import { Card } from '../components/ui/Card'
import { useAdmin } from '../hooks/useAdmin'
import { useTeams } from '../hooks/useTeams'
import { useTournament } from '../hooks/useTournament'
import { getMatch, updateMatchTeams, updateMatchScore, addUsedTeams } from '../services/matchService'
import { recalculateStandings } from '../services/standingsService'
import type { MatchDoc } from '../types/tournament'
import type { TeamSelection } from '../types/team'
import toast from 'react-hot-toast'

export function MatchDetailPage() {
  const { id: tournamentId, matchId } = useParams<{ id: string; matchId: string }>()
  const navigate = useNavigate()
  const isAdmin = useAdmin()
  const { data: allTeams } = useTeams()
  const { tournament } = useTournament(tournamentId)
  const [match, setMatch] = useState<MatchDoc | null>(null)
  const [loading, setLoading] = useState(true)
  const [pickerSide, setPickerSide] = useState<'home' | 'away' | null>(null)
  const [homeTeam, setHomeTeam] = useState<TeamSelection | null>(null)
  const [awayTeam, setAwayTeam] = useState<TeamSelection | null>(null)

  useEffect(() => {
    if (!tournamentId || !matchId) return
    getMatch(tournamentId, matchId).then((m) => {
      setMatch(m)
      setHomeTeam(m?.homeTeam ?? null)
      setAwayTeam(m?.awayTeam ?? null)
      setLoading(false)
    })
  }, [tournamentId, matchId])

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!match || !tournament) {
    return (
      <PageLayout title="Partido no encontrado">
        <p className="text-gray-500">El partido no existe.</p>
      </PageLayout>
    )
  }

  // Determine excluded teams for home/away mode
  const excludeTeams = tournament.homeAway
    ? [
        ...(tournament.usedTeams[match.homePlayer.uid] ?? []),
        ...(tournament.usedTeams[match.awayPlayer.uid] ?? []),
      ]
    : []

  const handleTeamSelect = (team: TeamSelection) => {
    if (pickerSide === 'home') setHomeTeam(team)
    else setAwayTeam(team)
    setPickerSide(null)
  }

  const handleSaveTeams = async () => {
    if (!homeTeam || !awayTeam || !tournamentId || !matchId) return
    try {
      await updateMatchTeams(tournamentId, matchId, homeTeam, awayTeam)
      const updated = await getMatch(tournamentId, matchId)
      setMatch(updated)
      toast.success('Equipos asignados')
    } catch {
      toast.error('Error al asignar equipos')
    }
  }

  const handleSaveScore = async (homeScore: number, awayScore: number) => {
    if (!tournamentId || !matchId) return
    try {
      await updateMatchScore(tournamentId, matchId, homeScore, awayScore)

      // If home/away and this completes a tie, mark teams as used
      if (tournament.homeAway && match.tieId) {
        const updatedMatch = await getMatch(tournamentId, matchId)
        if (updatedMatch?.status === 'completed' && updatedMatch.homeTeam && updatedMatch.awayTeam) {
          const teamsUsed = [updatedMatch.homeTeam.team, updatedMatch.awayTeam.team]
          await addUsedTeams(
            tournamentId,
            match.homePlayer.uid,
            teamsUsed,
            tournament.usedTeams,
          )
          const refreshedTournament = { ...tournament }
          refreshedTournament.usedTeams[match.homePlayer.uid] = [
            ...(refreshedTournament.usedTeams[match.homePlayer.uid] ?? []),
            ...teamsUsed,
          ]
          await addUsedTeams(
            tournamentId,
            match.awayPlayer.uid,
            teamsUsed,
            refreshedTournament.usedTeams,
          )
        }
      }

      await recalculateStandings(tournamentId)
      const updated = await getMatch(tournamentId, matchId)
      setMatch(updated)
      toast.success('Resultado guardado')
    } catch {
      toast.error('Error al guardar resultado')
    }
  }

  return (
    <PageLayout title={`${match.homePlayer.displayName} vs ${match.awayPlayer.displayName}`}>
      <button
        onClick={() => navigate(`/tournaments/${tournamentId}`)}
        className="text-sm text-neon mb-4 inline-block hover:underline"
      >
        &larr; Volver al torneo
      </button>

      {/* Match info */}
      <Card className="p-6 mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          {match.group && <span>Grupo {match.group}</span>}
          <span>Jornada {match.round}</span>
          {match.tieId && <span>{match.leg === 1 ? 'Ida' : 'Vuelta'}</span>}
          <span className={`ml-auto px-2 py-0.5 rounded-full text-xs font-medium ${
            match.status === 'completed' ? 'bg-neon/20 text-neon' :
            match.status === 'teams_selected' ? 'bg-primary/20 text-primary-light' :
            'bg-white/10 text-gray-400'
          }`}>
            {match.status === 'completed' ? 'Finalizado' :
             match.status === 'teams_selected' ? 'Equipos asignados' : 'Pendiente'}
          </span>
        </div>

        {/* Current score if completed */}
        {match.status === 'completed' && (
          <div className="text-center py-4">
            <div className="flex items-center justify-center gap-6">
              <div className="text-center">
                <span className="text-3xl">{match.homeTeam?.flag}</span>
                <p className="text-sm font-medium text-gray-200 mt-1">{match.homeTeam?.team}</p>
                <p className="text-xs text-gray-500">{match.homePlayer.displayName}</p>
              </div>
              <span className="text-3xl font-bold text-neon">
                {match.homeScore} - {match.awayScore}
              </span>
              <div className="text-center">
                <span className="text-3xl">{match.awayTeam?.flag}</span>
                <p className="text-sm font-medium text-gray-200 mt-1">{match.awayTeam?.team}</p>
                <p className="text-xs text-gray-500">{match.awayPlayer.displayName}</p>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Team selection (admin only, when no teams yet) */}
      {isAdmin && match.status === 'pending' && (
        <Card className="p-6 mb-6">
          <h3 className="text-sm font-semibold text-gray-300 mb-4">Seleccionar Equipos</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-200 mb-2">{match.homePlayer.displayName}</p>
              {homeTeam ? (
                <div>
                  <span className="text-4xl">{homeTeam.flag}</span>
                  <p className="text-sm text-gray-300 mt-1">{homeTeam.team}</p>
                  <button
                    onClick={() => setPickerSide('home')}
                    className="text-xs text-neon mt-1 hover:underline"
                  >
                    Cambiar
                  </button>
                </div>
              ) : (
                <Button size="sm" variant="secondary" onClick={() => setPickerSide('home')}>
                  Elegir equipo
                </Button>
              )}
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-200 mb-2">{match.awayPlayer.displayName}</p>
              {awayTeam ? (
                <div>
                  <span className="text-4xl">{awayTeam.flag}</span>
                  <p className="text-sm text-gray-300 mt-1">{awayTeam.team}</p>
                  <button
                    onClick={() => setPickerSide('away')}
                    className="text-xs text-neon mt-1 hover:underline"
                  >
                    Cambiar
                  </button>
                </div>
              ) : (
                <Button size="sm" variant="secondary" onClick={() => setPickerSide('away')}>
                  Elegir equipo
                </Button>
              )}
            </div>
          </div>
          {homeTeam && awayTeam && (
            <Button className="w-full mt-4" onClick={handleSaveTeams}>
              Confirmar Equipos
            </Button>
          )}
        </Card>
      )}

      {/* Score entry (admin only, when teams are selected) */}
      {isAdmin && (match.status === 'teams_selected' || match.status === 'completed') && (
        <Card className="p-6">
          <h3 className="text-sm font-semibold text-gray-300 mb-4">
            {match.status === 'completed' ? 'Editar Resultado' : 'Ingresar Resultado'}
          </h3>
          <MatchScoreForm match={match} onSubmit={handleSaveScore} />
        </Card>
      )}

      {/* Team picker modal */}
      {allTeams && (
        <TeamPicker
          open={pickerSide !== null}
          onClose={() => setPickerSide(null)}
          onSelect={handleTeamSelect}
          teams={allTeams}
          excludeTeams={excludeTeams}
          title={`Equipo para ${pickerSide === 'home' ? match.homePlayer.displayName : match.awayPlayer.displayName}`}
        />
      )}
    </PageLayout>
  )
}
