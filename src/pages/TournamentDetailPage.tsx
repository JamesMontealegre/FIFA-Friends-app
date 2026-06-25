import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { PageLayout } from '../components/layout/PageLayout'
import { TournamentBadge } from '../components/tournament/TournamentBadge'
import { StandingsTable } from '../components/standings/StandingsTable'
import { GroupStageView } from '../components/standings/GroupStageView'
import { BracketView } from '../components/standings/BracketView'
import { MatchList } from '../components/match/MatchList'
import { Spinner } from '../components/ui/Spinner'
import { Button } from '../components/ui/Button'
import { useTournament } from '../hooks/useTournament'
import { useMatches } from '../hooks/useMatches'
import { useStandings } from '../hooks/useStandings'
import { useAdmin } from '../hooks/useAdmin'
import { updateTournament, startTournament } from '../services/tournamentService'
import { generateKnockoutFixtures } from '../services/fixtureGenerator'
import { recalculateStandings } from '../services/standingsService'
import toast from 'react-hot-toast'
import type { MatchDoc } from '../types/tournament'

type Tab = 'standings' | 'matches' | 'bracket'

export function TournamentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { tournament, loading: tLoading } = useTournament(id)
  const { matches, loading: mLoading } = useMatches(id)
  const { standings } = useStandings(id)
  const isAdmin = useAdmin()
  const [tab, setTab] = useState<Tab>('standings')
  const [advancing, setAdvancing] = useState(false)
  const [starting, setStarting] = useState(false)

  if (tLoading || mLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!tournament) {
    return (
      <PageLayout title="Torneo no encontrado">
        <p className="text-gray-500">El torneo no existe.</p>
      </PageLayout>
    )
  }

  const handleStartTournament = async () => {
    if (!tournament) return
    setStarting(true)
    try {
      await startTournament(tournament.id, tournament)
      toast.success('Torneo iniciado')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al iniciar torneo')
    } finally {
      setStarting(false)
    }
  }

  if (tournament.status === 'draft') {
    return (
      <PageLayout
        title={tournament.name}
        actions={<TournamentBadge status={tournament.status} />}
      >
        <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-6">
          <span>{tournament.type === 'league' ? 'Liguilla' : 'Copa'}</span>
          {tournament.homeAway && <span>Ida y Vuelta</span>}
        </div>

        <div className="max-w-md mx-auto space-y-6">
          {/* Invite code display */}
          <div className="bg-surface-card rounded-xl border border-white/10 p-6 text-center">
            <p className="text-sm text-gray-400 mb-2">Codigo de invitacion</p>
            <div className="flex items-center justify-center gap-3">
              <span className="text-3xl font-mono font-bold tracking-[0.3em] text-neon">
                {tournament.inviteCode}
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(tournament.inviteCode)
                  toast.success('Codigo copiado')
                }}
                className="p-2 text-gray-400 hover:text-neon transition-colors"
                title="Copiar codigo"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              Comparte este codigo con tus amigos para que se unan
            </p>
          </div>

          {/* Joined players list */}
          <div className="bg-surface-card rounded-xl border border-white/10 p-4">
            <h3 className="text-sm font-medium text-gray-400 mb-3">
              Jugadores ({tournament.players.length})
            </h3>
            {tournament.players.length === 0 ? (
              <p className="text-gray-500 text-sm py-4 text-center">
                Esperando jugadores...
              </p>
            ) : (
              <div className="space-y-2">
                {tournament.players.map((p) => (
                  <div key={p.uid} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/5">
                    {p.photoURL ? (
                      <img
                        src={p.photoURL}
                        alt={p.displayName}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm font-medium text-gray-400">
                        {p.displayName.charAt(0)}
                      </div>
                    )}
                    <span className="text-sm text-gray-200">{p.displayName}</span>
                    <span className="ml-auto text-xs text-gray-500">
                      {p.tier === 'pro' ? 'PRO' : '5\u2605'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Start tournament button (admin only) */}
          {isAdmin && (
            <div className="text-center space-y-2">
              <Button
                onClick={handleStartTournament}
                disabled={tournament.players.length < 2}
                loading={starting}
              >
                Iniciar Torneo ({tournament.players.length} jugadores)
              </Button>
              {tournament.players.length < 2 && (
                <p className="text-xs text-gray-500">
                  Se necesitan al menos 2 jugadores para iniciar
                </p>
              )}
            </div>
          )}
        </div>
      </PageLayout>
    )
  }

  const leagueMatches = matches.filter((m) => m.phase === 'league')
  const groupMatches = matches.filter((m) => m.phase === 'group')
  const knockoutMatches = matches.filter((m) => m.phase === 'knockout')
  const hasKnockout = knockoutMatches.length > 0

  const handleMatchClick = (match: MatchDoc) => {
    navigate(`/tournaments/${id}/matches/${match.id}`)
  }

  const handleAdvanceToPlayoffs = async () => {
    if (!tournament || !standings) return
    setAdvancing(true)
    try {
      await recalculateStandings(tournament.id)

      const playoffSize = tournament.leagueConfig?.playoffSize ?? 4
      const topPlayers = standings.tables[0]?.rows
        .slice(0, playoffSize)
        .map((r) => tournament.players.find((p) => p.uid === r.uid)!)
        .filter(Boolean)

      if (topPlayers.length < 2) {
        toast.error('No hay suficientes jugadores para playoffs')
        return
      }

      await generateKnockoutFixtures(tournament.id, topPlayers, tournament.homeAway)
      await updateTournament(tournament.id, { status: 'playoffs' } as never)
      toast.success('Playoffs generados')
    } catch {
      toast.error('Error al generar playoffs')
    } finally {
      setAdvancing(false)
    }
  }

  const handleAdvanceToKnockout = async () => {
    if (!tournament || !standings) return
    setAdvancing(true)
    try {
      await recalculateStandings(tournament.id)

      const advancePerGroup = tournament.cupConfig?.advancePerGroup ?? 2
      const qualifiers = standings.tables.flatMap((table) =>
        table.rows
          .slice(0, advancePerGroup)
          .map((r) => tournament.players.find((p) => p.uid === r.uid)!)
          .filter(Boolean),
      )

      if (qualifiers.length < 2) {
        toast.error('No hay suficientes clasificados')
        return
      }

      await generateKnockoutFixtures(tournament.id, qualifiers, tournament.homeAway)
      await updateTournament(tournament.id, { status: 'knockout' } as never)
      toast.success('Eliminatorias generadas')
    } catch {
      toast.error('Error al generar eliminatorias')
    } finally {
      setAdvancing(false)
    }
  }

  const canAdvance = (() => {
    if (!isAdmin) return false
    if (tournament.type === 'league' && tournament.status === 'league_stage' && tournament.leagueConfig?.playoffSize) {
      return leagueMatches.length > 0 && leagueMatches.every((m) => m.status === 'completed')
    }
    if (tournament.type === 'cup' && tournament.status === 'group_stage') {
      return groupMatches.length > 0 && groupMatches.every((m) => m.status === 'completed')
    }
    return false
  })()

  const handleComplete = async () => {
    if (!tournament || !standings) return
    const finalRows = standings.tables[0]?.rows ?? []
    await updateTournament(tournament.id, {
      status: 'completed',
      finalStandings: finalRows.map((r, i) => ({
        uid: r.uid,
        displayName: r.displayName,
        position: i + 1,
      })),
    } as never)
    toast.success('Torneo finalizado')
  }

  return (
    <PageLayout
      title={tournament.name}
      actions={<TournamentBadge status={tournament.status} />}
    >
      {/* Info bar */}
      <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-6">
        <span>{tournament.type === 'league' ? 'Liguilla' : 'Copa'}</span>
        {tournament.homeAway && <span>Ida y Vuelta</span>}
        <span>{tournament.players.length} jugadores</span>
      </div>

      {/* Tab navigation */}
      <div className="flex gap-1 mb-6 border-b border-white/10">
        {(['standings', 'matches', 'bracket'] as const).map((t) => {
          if (t === 'bracket' && !hasKnockout && !canAdvance) return null
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                tab === t
                  ? 'border-neon text-neon'
                  : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              {t === 'standings' ? 'Tabla' : t === 'matches' ? 'Partidos' : 'Bracket'}
            </button>
          )
        })}
      </div>

      {/* Tab content */}
      {tab === 'standings' && standings && (
        <div className="space-y-6">
          {tournament.type === 'cup' ? (
            <GroupStageView
              tables={standings.tables}
              matches={groupMatches}
              advancePerGroup={tournament.cupConfig?.advancePerGroup ?? 2}
              onMatchClick={isAdmin ? handleMatchClick : undefined}
            />
          ) : (
            <div className="bg-surface-card rounded-xl border border-white/10 p-4">
              <StandingsTable
                rows={standings.tables[0]?.rows ?? []}
                highlightTop={tournament.leagueConfig?.playoffSize}
              />
            </div>
          )}

          {canAdvance && (
            <div className="text-center">
              <Button
                onClick={tournament.type === 'league' ? handleAdvanceToPlayoffs : handleAdvanceToKnockout}
                loading={advancing}
              >
                {tournament.type === 'league' ? 'Generar Playoffs' : 'Generar Eliminatorias'}
              </Button>
            </div>
          )}
        </div>
      )}

      {tab === 'matches' && (
        <MatchList
          matches={tournament.type === 'league' ? leagueMatches : [...groupMatches, ...knockoutMatches]}
          onMatchClick={isAdmin ? handleMatchClick : undefined}
        />
      )}

      {tab === 'bracket' && (
        <BracketView matches={knockoutMatches} onMatchClick={isAdmin ? handleMatchClick : undefined} />
      )}

      {/* Complete tournament button */}
      {isAdmin && tournament.status !== 'completed' && (
        <div className="mt-8 text-center">
          <Button variant="secondary" onClick={handleComplete}>
            Finalizar Torneo
          </Button>
        </div>
      )}
    </PageLayout>
  )
}
