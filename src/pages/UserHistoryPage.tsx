import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '../config/firebase'
import { PageLayout } from '../components/layout/PageLayout'
import { Card } from '../components/ui/Card'
import { Spinner } from '../components/ui/Spinner'
import { EmptyState } from '../components/ui/EmptyState'
import { TrophyBadge } from '../components/palmares/TrophyBadge'
import type { UserDoc } from '../types/user'
import type { TournamentDoc } from '../types/tournament'
import type { PalmaresDoc } from '../types/palmares'

interface TournamentHistory {
  tournament: TournamentDoc
  matchesPlayed: number
  goalsFor: number
  goalsAgainst: number
  position: number | null
}

export function UserHistoryPage() {
  const { uid } = useParams<{ uid: string }>()
  const [user, setUser] = useState<UserDoc | null>(null)
  const [palmares, setPalmares] = useState<PalmaresDoc | null>(null)
  const [history, setHistory] = useState<TournamentHistory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!uid) return

    async function loadData() {
      try {
        const userSnap = await getDoc(doc(db, 'users', uid!))
        if (userSnap.exists()) setUser(userSnap.data() as UserDoc)

        const palmaresSnap = await getDoc(doc(db, 'palmares', uid!))
        if (palmaresSnap.exists()) setPalmares(palmaresSnap.data() as PalmaresDoc)

        const tournamentsSnap = await getDocs(
          query(collection(db, 'tournaments'), where('status', '==', 'completed')),
        )
        const tournaments = tournamentsSnap.docs
          .map((d) => ({ id: d.id, ...d.data() }) as TournamentDoc)
          .filter((t) => t.players.some((p) => p.uid === uid))

        const hist: TournamentHistory[] = []
        for (const t of tournaments) {
          const matchesSnap = await getDocs(collection(db, 'tournaments', t.id, 'matches'))
          let matchesPlayed = 0
          let gf = 0
          let ga = 0

          for (const mDoc of matchesSnap.docs) {
            const m = mDoc.data()
            if (m.status !== 'completed') continue
            const isHome = m.homePlayer.uid === uid
            const isAway = m.awayPlayer.uid === uid
            if (!isHome && !isAway) continue
            matchesPlayed++
            gf += isHome ? m.homeScore : m.awayScore
            ga += isHome ? m.awayScore : m.homeScore
          }

          const standing = t.finalStandings?.find((s) => s.uid === uid)
          hist.push({
            tournament: t,
            matchesPlayed,
            goalsFor: gf,
            goalsAgainst: ga,
            position: standing?.position ?? null,
          })
        }

        setHistory(hist)
      } catch (e) {
        console.warn('Error loading user history:', e)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [uid])

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <PageLayout title={user?.displayName ?? 'Jugador'}>
      {/* Palmares summary */}
      {palmares && (
        <Card className="p-5 mb-6">
          <div className="flex items-center gap-4">
            {palmares.photoURL ? (
              <img src={palmares.photoURL} alt="" className="w-16 h-16 rounded-full border border-neon/30" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-surface-dark flex items-center justify-center text-2xl text-gray-400">
                {palmares.displayName[0]}
              </div>
            )}
            <div>
              <h2 className="text-xl font-bold text-gray-100">{palmares.displayName}</h2>
              <div className="flex gap-4 mt-1 text-sm text-gray-500">
                <span>{palmares.totalMatchesPlayed} partidos</span>
                <span>{palmares.totalGoalsFor} goles</span>
                <span>{palmares.totalPoints} pts</span>
                <TrophyBadge count={palmares.tournamentsWonCount} />
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Tournament history */}
      {history.length === 0 ? (
        <EmptyState message="No hay historial de torneos" icon="📊" />
      ) : (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-200">Historial de Torneos</h3>
          {history.map((h) => (
            <Card key={h.tournament.id} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-200">{h.tournament.name}</h4>
                  <p className="text-sm text-gray-500">
                    {h.tournament.type === 'league' ? 'Liguilla' : 'Copa'} &middot;{' '}
                    {h.matchesPlayed} partidos &middot; {h.goalsFor} GF / {h.goalsAgainst} GC
                  </p>
                </div>
                <div className="text-right">
                  {h.position === 1 ? (
                    <span className="text-amber-400 font-bold">🏆 Campeon</span>
                  ) : h.position ? (
                    <span className="text-gray-400 font-medium">#{h.position}</span>
                  ) : (
                    <span className="text-gray-600 text-sm">-</span>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </PageLayout>
  )
}
