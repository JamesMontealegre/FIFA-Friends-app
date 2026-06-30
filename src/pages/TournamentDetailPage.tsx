import { useState } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { PageLayout } from '../components/layout/PageLayout'
import { TournamentBadge } from '../components/tournament/TournamentBadge'
import { StandingsTable } from '../components/standings/StandingsTable'
import { GroupStageView } from '../components/standings/GroupStageView'
import { MatchList } from '../components/match/MatchList'
import { MatchCard } from '../components/match/MatchCard'
import { Spinner } from '../components/ui/Spinner'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { useTournament } from '../hooks/useTournament'
import { useMatches } from '../hooks/useMatches'
import { useStandings } from '../hooks/useStandings'
import { useAdmin } from '../hooks/useAdmin'
import { updateTournament, startTournament, deleteAllTournamentData } from '../services/tournamentService'
import { generateKnockoutFixtures } from '../services/fixtureGenerator'
import { recalculateStandings, getStandings } from '../services/standingsService'
import { recalculatePalmaresForAll } from '../services/palmaresService'
import { assignMatchesToSessions } from '../services/matchService'
import toast from 'react-hot-toast'
import type { MatchDoc } from '../types/tournament'
import type { PlayerTier } from '../types/user'

type Tab = 'standings' | 'matches' | 'sessions'

export function TournamentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { tournament, loading: tLoading } = useTournament(id)
  const { matches, loading: mLoading } = useMatches(id)
  const { standings } = useStandings(id)
  const isAdmin = useAdmin()
  const validTabs: Tab[] = ['standings', 'matches', 'sessions']
  const initialTab = validTabs.includes(searchParams.get('tab') as Tab) ? (searchParams.get('tab') as Tab) : 'standings'
  const [tab, setTab] = useState<Tab>(initialTab)
  const [advancing, setAdvancing] = useState(false)
  const [starting, setStarting] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [finalizing, setFinalizing] = useState(false)
  const [sessionCount, setSessionCount] = useState(2)
  const [creatingSessions, setCreatingSessions] = useState(false)
  const [playoffOpen, setPlayoffOpen] = useState(true)
  const [matchesOpen, setMatchesOpen] = useState<boolean | null>(null)
  const [seedingType, setSeedingType] = useState<'random' | 'seeded'>('random')
  const [playoffHomeAway, setPlayoffHomeAway] = useState(false)

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

  const handleToggleTier = async (uid: string) => {
    if (!tournament) return
    const updated = tournament.players.map((p) =>
      p.uid === uid ? { ...p, tier: (p.tier === 'pro' ? 'casual' : 'pro') as PlayerTier } : p,
    )
    try {
      await updateTournament(tournament.id, { players: updated } as never)
    } catch {
      toast.error('Error al cambiar tier')
    }
  }

  const handleDeleteTournament = async () => {
    if (!confirm('Eliminar torneo? Esta accion no se puede deshacer. Los datos no seran considerados en palmares ni historial.')) return
    setDeleting(true)
    try {
      await deleteAllTournamentData(tournament.id)
      toast.success('Torneo eliminado')
      navigate('/tournaments')
    } catch {
      toast.error('Error al eliminar torneo')
    } finally {
      setDeleting(false)
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
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm font-medium text-gray-400">
                        {p.displayName.charAt(0)}
                      </div>
                    )}
                    <span className="text-sm text-gray-200">{p.displayName}</span>
                    {isAdmin ? (
                      <button
                        onClick={() => handleToggleTier(p.uid)}
                        className={`ml-auto text-xs px-2 py-0.5 rounded-full border transition-colors ${
                          p.tier === 'pro'
                            ? 'border-neon/40 text-neon bg-neon/10'
                            : 'border-yellow-500/40 text-yellow-400 bg-yellow-500/10'
                        }`}
                        title="Cambiar tier"
                      >
                        {p.tier === 'pro' ? 'PRO' : '5\u2605'}
                      </button>
                    ) : (
                      <span className="ml-auto text-xs text-gray-500">
                        {p.tier === 'pro' ? 'PRO' : '5\u2605'}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Start tournament button (admin only) */}
          {isAdmin && (
            <div className="text-center space-y-4">
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
              <div>
                <Button variant="danger" size="sm" onClick={handleDeleteTournament} loading={deleting}>
                  Eliminar Torneo
                </Button>
              </div>
            </div>
          )}
        </div>
      </PageLayout>
    )
  }

  const leagueMatches = matches.filter((m) => m.phase === 'league')
  const groupMatches = matches.filter((m) => m.phase === 'group')
  const knockoutMatches = matches.filter((m) => m.phase === 'knockout')

  // Sessions: matches with sessionNumber assigned and not completed
  const activeSessions = matches.filter((m) => m.sessionNumber != null && m.status !== 'completed')
  const maxSession = matches.reduce((max, m) => Math.max(max, m.sessionNumber ?? 0), 0)
  const pendingForSession = matches.filter((m) => m.sessionNumber == null && m.status !== 'completed')

  // Max consolas = jugadores unicos en partidos pendientes / 2
  const uniquePendingPlayers = new Set(
    pendingForSession.flatMap((m) => [m.homePlayer.uid, m.awayPlayer.uid]),
  )
  const maxConsoles = Math.floor(uniquePendingPlayers.size / 2)

  const handleMatchClick = (match: MatchDoc) => {
    navigate(`/tournaments/${id}/matches/${match.id}`)
  }

  const handleCreateSessions = async () => {
    if (pendingForSession.length === 0) {
      toast.error('No hay partidos pendientes para asignar')
      return
    }
    setCreatingSessions(true)
    try {
      const count = Math.min(sessionCount, pendingForSession.length, maxConsoles)
      // Seleccionar partidos sin repetir jugadores
      const shuffled = [...pendingForSession].sort(() => Math.random() - 0.5)
      const selected: MatchDoc[] = []
      const usedPlayers = new Set<string>()
      for (const m of shuffled) {
        if (selected.length >= count) break
        if (usedPlayers.has(m.homePlayer.uid) || usedPlayers.has(m.awayPlayer.uid)) continue
        selected.push(m)
        usedPlayers.add(m.homePlayer.uid)
        usedPlayers.add(m.awayPlayer.uid)
      }
      if (selected.length === 0) {
        toast.error('No se pueden crear sesiones sin conflictos de jugadores')
        return
      }
      await assignMatchesToSessions(
        tournament.id,
        selected.map((m) => m.id),
        maxSession + 1,
      )
      toast.success(`${selected.length} sesiones creadas`)
    } catch {
      toast.error('Error al crear sesiones')
    } finally {
      setCreatingSessions(false)
    }
  }

  // Seeding tradicional: 1ro vs 3ro, 2do vs 4to, etc.
  // Para bracket: posiciones consecutivas se enfrentan [0,1], [2,3]
  // Asi que el array queda [1ro, 3ro, 2do, 4to, ...] para emparejar por posicion
  const seedTraditional = (players: typeof tournament.players) => {
    const half = Math.ceil(players.length / 2)
    const top = players.slice(0, half)
    const bottom = players.slice(half).reverse()
    const seeded: typeof players = []
    for (let i = 0; i < half; i++) {
      seeded.push(top[i])
      if (bottom[i]) seeded.push(bottom[i])
    }
    return seeded
  }

  const applySeeding = (players: typeof tournament.players) => {
    if (seedingType === 'random') {
      return [...players].sort(() => Math.random() - 0.5)
    }
    return seedTraditional(players)
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

      const seeded = applySeeding(topPlayers)
      await generateKnockoutFixtures(tournament.id, seeded, tournament.homeAway || playoffHomeAway)
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

      const seeded = applySeeding(qualifiers)
      await generateKnockoutFixtures(tournament.id, seeded, tournament.homeAway || playoffHomeAway)
      await updateTournament(tournament.id, { status: 'knockout' } as never)
      toast.success('Eliminatorias generadas')
    } catch {
      toast.error('Error al generar eliminatorias')
    } finally {
      setAdvancing(false)
    }
  }

  const handleFinalizeTournament = async () => {
    if (!tournament) return
    if (!confirm('¿Finalizar torneo sin playoffs? Esta accion no se puede deshacer.')) return
    setFinalizing(true)
    try {
      await recalculateStandings(tournament.id)
      const latestStandings = await getStandings(tournament.id)
      const rows = latestStandings?.tables[0]?.rows ?? []
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
    } catch {
      toast.error('Error al finalizar torneo')
    } finally {
      setFinalizing(false)
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

  const tabs: Tab[] = ['standings', 'matches', 'sessions']

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
      <div className="flex gap-1 mb-6 border-b border-white/10 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              tab === t
                ? 'border-neon text-neon'
                : 'border-transparent text-gray-500 hover:text-gray-300'
            }`}
          >
            {t === 'standings' ? 'Tabla' : t === 'matches' ? 'Partidos' : 'Sesiones'}
          </button>
        ))}
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
            <div className="flex flex-col items-center gap-3">
              <div className="flex items-center gap-3">
                <label className="text-sm text-gray-300">Sorteo:</label>
                <select
                  value={seedingType}
                  onChange={(e) => setSeedingType(e.target.value as 'random' | 'seeded')}
                  className="px-3 py-1.5 bg-surface-card border border-white/10 rounded-lg text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-neon/50"
                >
                  <option value="random">Aleatorio</option>
                  <option value="seeded">Tradicional (1ro vs 3ro, 2do vs 4to)</option>
                </select>
              </div>
              {!tournament.homeAway && (
                <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={playoffHomeAway}
                    onChange={(e) => setPlayoffHomeAway(e.target.checked)}
                    className="accent-neon w-4 h-4"
                  />
                  Ida y Vuelta
                </label>
              )}
              <Button
                onClick={tournament.type === 'league' ? handleAdvanceToPlayoffs : handleAdvanceToKnockout}
                loading={advancing}
              >
                {tournament.type === 'league' ? 'Generar Playoffs' : 'Generar Eliminatorias'}
              </Button>
            </div>
          )}

          {isAdmin && tournament.status !== 'completed' && (
            <div className="flex justify-center mt-4">
              <button
                onClick={handleFinalizeTournament}
                disabled={finalizing}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-[#FA8072]/20 text-[#FA8072] border border-[#FA8072]/30 hover:bg-[#FA8072]/30 transition-colors disabled:opacity-50"
              >
                {finalizing ? 'Finalizando...' : 'Finalizar Torneo'}
              </button>
            </div>
          )}
        </div>
      )}

      {tab === 'matches' && (() => {
        const hasPlayoff = knockoutMatches.length > 0
        // Si no se ha tocado (null), abierto solo cuando no hay playoff
        const isMatchesOpen = matchesOpen === null ? !hasPlayoff : matchesOpen
        return (
          <div className="space-y-4">
            {/* Playoff arriba, desplegado por defecto */}
            {hasPlayoff && (
              <>
                <button
                  onClick={() => setPlayoffOpen(!playoffOpen)}
                  className="w-full flex items-center justify-between py-2 text-sm font-semibold text-neon"
                >
                  <span>Playoff</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`w-4 h-4 transition-transform ${playoffOpen ? 'rotate-180' : ''}`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                {playoffOpen && (
                  <MatchList
                    matches={knockoutMatches}
                    onMatchClick={isAdmin ? handleMatchClick : undefined}
                    roundLabelFn={(round, total) => {
                      const fromEnd = total - round
                      if (fromEnd === 0) return 'Final'
                      if (fromEnd === 1) return 'Semifinal'
                      if (fromEnd === 2) return 'Cuartos de Final'
                      if (fromEnd === 3) return 'Octavos de Final'
                      return `Ronda ${round}`
                    }}
                  />
                )}
              </>
            )}

            {/* Partidos regulares */}
            <button
              onClick={() => setMatchesOpen(!isMatchesOpen)}
              className="w-full flex items-center justify-between py-2 text-sm font-semibold text-gray-300"
            >
              <span>Partidos</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`w-4 h-4 transition-transform ${isMatchesOpen ? 'rotate-180' : ''}`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            {isMatchesOpen && (
              <MatchList
                matches={tournament.type === 'league' ? leagueMatches : groupMatches}
                onMatchClick={isAdmin ? handleMatchClick : undefined}
              />
            )}
          </div>
        )
      })()}

      {tab === 'sessions' && (
        <div className="space-y-6">
          {/* Create sessions (admin only) */}
          {isAdmin && pendingForSession.length > 0 && activeSessions.length === 0 && (
            <div className="bg-surface-card rounded-xl border border-white/10 p-4">
              <h3 className="text-sm font-medium text-gray-400 mb-3">Crear Sesiones</h3>
              <div className="flex items-center gap-3">
                <label className="text-sm text-gray-300">Consolas:</label>
                <select
                  value={sessionCount}
                  onChange={(e) => setSessionCount(Number(e.target.value))}
                  className="px-3 py-1.5 bg-surface-card border border-white/10 rounded-lg text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-neon/50"
                >
                  {Array.from({ length: Math.min(10, pendingForSession.length, maxConsoles) }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
                <Button size="sm" onClick={handleCreateSessions} loading={creatingSessions}>
                  Asignar Partidos
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {pendingForSession.length} partidos pendientes disponibles
              </p>
            </div>
          )}

          {/* Active sessions */}
          {activeSessions.length > 0 ? (
            <div className="space-y-3">
              {[...new Set(activeSessions.map((m) => m.sessionNumber!))].sort((a, b) => a - b).map((sn, idx) => {
                const sessionMatches = activeSessions.filter((m) => m.sessionNumber === sn)
                return (
                  <div key={sn} className="bg-surface-card rounded-xl border border-white/10 p-4">
                    <h3 className="text-sm font-semibold text-neon mb-3">
                      Consola {idx + 1}
                    </h3>
                    <div className="space-y-2">
                      {sessionMatches.map((m) => (
                        <MatchCard
                          key={m.id}
                          match={m}
                          onClick={isAdmin ? () => handleMatchClick(m) : undefined}
                        />
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <EmptyState message="No hay sesiones activas" icon="&#127918;" />
          )}
        </div>
      )}

    </PageLayout>
  )
}
