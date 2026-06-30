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
import { getMatch, getMatches, getMatchByTieIdAndLeg, updateMatchTeams, updateMatchScore, addUsedTeams } from '../services/matchService'
import { recalculateStandings, getStandings } from '../services/standingsService'
import { updateTournament } from '../services/tournamentService'
import { recalculatePalmaresForAll } from '../services/palmaresService'
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

  // Equipos excluidos: los ya usados por el jugador actual (solo pro) + el equipo del oponente en este partido
  const getExcludeTeams = () => {
    if (!pickerSide) return []
    const currentPlayerUid = pickerSide === 'home' ? match.homePlayer.uid : match.awayPlayer.uid
    const playerRef = tournament.players.find((p) => p.uid === currentPlayerUid)
    const opponentTeam = pickerSide === 'home' ? awayTeam : homeTeam
    const usedTeams = playerRef?.tier === 'casual' ? [] : (tournament.usedTeams[currentPlayerUid] ?? [])
    return [
      ...usedTeams,
      ...(opponentTeam ? [opponentTeam.team] : []),
    ]
  }

  const handleTeamSelect = (team: TeamSelection) => {
    if (pickerSide === 'home') setHomeTeam(team)
    else setAwayTeam(team)
    setPickerSide(null)
  }

  const handleSaveTeams = async () => {
    if (!homeTeam || !awayTeam || !tournamentId || !matchId) return
    try {
      await updateMatchTeams(tournamentId, matchId, homeTeam, awayTeam)

      // Registrar equipos usados por cada jugador
      await addUsedTeams(tournamentId, match.homePlayer.uid, [homeTeam.team], tournament.usedTeams)
      const refreshed = { ...tournament.usedTeams }
      refreshed[match.homePlayer.uid] = [...(refreshed[match.homePlayer.uid] ?? []), homeTeam.team]
      await addUsedTeams(tournamentId, match.awayPlayer.uid, [awayTeam.team], refreshed)

      // Auto-assign reversed teams for the paired leg
      if (match.tieId) {
        const pairedLeg = match.leg === 1 ? 2 : 1
        const pairedMatch = await getMatchByTieIdAndLeg(tournamentId, match.tieId, pairedLeg as 1 | 2)
        if (pairedMatch && pairedMatch.status === 'pending') {
          await updateMatchTeams(tournamentId, pairedMatch.id, awayTeam, homeTeam)
        }
      }

      toast.success('Equipos asignados')
      navigate(`/tournaments/${tournamentId}?tab=sessions`)
    } catch {
      toast.error('Error al asignar equipos')
    }
  }

  const handleSaveScore = async (homeScore: number, awayScore: number) => {
    if (!tournamentId || !matchId) return
    try {
      await updateMatchScore(tournamentId, matchId, homeScore, awayScore)
      await recalculateStandings(tournamentId)

      // Auto-finalizar torneo si todos los partidos estan completados
      // No auto-finalizar si faltan playoffs/knockout por generar
      const allMatches = await getMatches(tournamentId)
      const allCompleted = allMatches.length > 0 && allMatches.every((m) => m.status === 'completed')

      const pendingPlayoffs = tournament.type === 'league'
        && tournament.status === 'league_stage'
        && (tournament.leagueConfig?.playoffSize ?? 0) > 0

      const pendingKnockout = tournament.type === 'cup'
        && tournament.status === 'group_stage'

      if (allCompleted && !pendingPlayoffs && !pendingKnockout) {
        const standings = await getStandings(tournamentId)
        const rows = standings?.tables[0]?.rows ?? []
        const finalStandings = rows.map((r, i) => ({
          uid: r.uid,
          displayName: r.displayName,
          position: i + 1,
        }))

        await updateTournament(tournament.id, {
          status: 'completed',
          finalStandings,
        } as never)
        await recalculatePalmaresForAll(tournament.players)
        toast.success('Torneo finalizado')
      } else {
        toast.success('Resultado guardado')
      }

      navigate(`/tournaments/${tournamentId}?tab=matches`)
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
          <div className="py-4">
            <div className="flex items-center gap-3">
              <div className="flex-1 min-w-0 text-center">
                {match.homePlayer.photoURL ? (
                  <img src={match.homePlayer.photoURL} alt="" className="w-10 h-10 rounded-full mx-auto mb-1" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold text-gray-400 mx-auto mb-1">{match.homePlayer.displayName.charAt(0)}</div>
                )}
                <span className="text-3xl">{match.homeTeam?.flag}</span>
                <p className="text-sm font-medium text-gray-200 mt-1 truncate">{match.homeTeam?.team}</p>
                <p className="text-xs font-gaming font-semibold neon-cyan truncate">{match.homePlayer.displayName}</p>
              </div>
              <span className="text-3xl font-bold text-neon shrink-0">
                {match.homeScore} - {match.awayScore}
              </span>
              <div className="flex-1 min-w-0 text-center">
                {match.awayPlayer.photoURL ? (
                  <img src={match.awayPlayer.photoURL} alt="" className="w-10 h-10 rounded-full mx-auto mb-1" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold text-gray-400 mx-auto mb-1">{match.awayPlayer.displayName.charAt(0)}</div>
                )}
                <span className="text-3xl">{match.awayTeam?.flag}</span>
                <p className="text-sm font-medium text-gray-200 mt-1 truncate">{match.awayTeam?.team}</p>
                <p className="text-xs font-gaming font-semibold neon-pink truncate">{match.awayPlayer.displayName}</p>
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
            <div className="text-center min-w-0">
              {match.homePlayer.photoURL ? (
                <img src={match.homePlayer.photoURL} alt="" className="w-8 h-8 rounded-full mx-auto mb-1" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-gray-400 mx-auto mb-1">{match.homePlayer.displayName.charAt(0)}</div>
              )}
              <p className="text-sm font-gaming font-semibold neon-cyan mb-2 truncate">{match.homePlayer.displayName}</p>
              {homeTeam ? (
                <div>
                  <span className="text-4xl">{homeTeam.flag}</span>
                  <p className="text-sm text-gray-300 mt-1 truncate">{homeTeam.team}</p>
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
            <div className="text-center min-w-0">
              {match.awayPlayer.photoURL ? (
                <img src={match.awayPlayer.photoURL} alt="" className="w-8 h-8 rounded-full mx-auto mb-1" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-gray-400 mx-auto mb-1">{match.awayPlayer.displayName.charAt(0)}</div>
              )}
              <p className="text-sm font-gaming font-semibold neon-pink mb-2 truncate">{match.awayPlayer.displayName}</p>
              {awayTeam ? (
                <div>
                  <span className="text-4xl">{awayTeam.flag}</span>
                  <p className="text-sm text-gray-300 mt-1 truncate">{awayTeam.team}</p>
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
          excludeTeams={getExcludeTeams()}
          title={`Equipo para ${pickerSide === 'home' ? match.homePlayer.displayName : match.awayPlayer.displayName}`}
        />
      )}
    </PageLayout>
  )
}
