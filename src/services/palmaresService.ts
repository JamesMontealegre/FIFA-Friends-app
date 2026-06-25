import {
  doc,
  setDoc,
  getDocs,
  collection,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '../config/firebase'
import type { TournamentDoc } from '../types/tournament'
import type { PalmaresDoc, TournamentWin } from '../types/palmares'
import type { PlayerRef } from '../types/user'

export async function recalculatePalmaresForAll(players: PlayerRef[]): Promise<void> {
  const tournamentsSnap = await getDocs(
    query(collection(db, 'tournaments'), where('status', '==', 'completed')),
  )
  const tournaments = tournamentsSnap.docs.map(
    (d) => ({ id: d.id, ...d.data() }) as TournamentDoc,
  )

  // Pre-fetch all matches
  const tournamentMatches: Record<string, Record<string, unknown>[]> = {}
  for (const t of tournaments) {
    const matchesSnap = await getDocs(collection(db, 'tournaments', t.id, 'matches'))
    tournamentMatches[t.id] = matchesSnap.docs.map((d) => d.data() as Record<string, unknown>)
  }

  for (const player of players) {
    let totalGoalsFor = 0
    let totalGoalsAgainst = 0
    let totalPoints = 0
    let totalMatchesPlayed = 0
    let totalWins = 0
    let totalDraws = 0
    let totalLosses = 0
    const tournamentsWon: TournamentWin[] = []
    let secondPlaces = 0
    let thirdPlaces = 0

    for (const tournament of tournaments) {
      if (!tournament.players.some((p) => p.uid === player.uid)) continue

      const matches = tournamentMatches[tournament.id] ?? []
      for (const m of matches) {
        if (m.status !== 'completed' || m.homeScore === null || m.awayScore === null) continue
        const hp = m.homePlayer as { uid: string }
        const ap = m.awayPlayer as { uid: string }
        const isHome = hp.uid === player.uid
        const isAway = ap.uid === player.uid
        if (!isHome && !isAway) continue

        totalMatchesPlayed++
        const gf = isHome ? (m.homeScore as number) : (m.awayScore as number)
        const ga = isHome ? (m.awayScore as number) : (m.homeScore as number)
        totalGoalsFor += gf
        totalGoalsAgainst += ga

        if (gf > ga) { totalWins++; totalPoints += 3 }
        else if (gf < ga) { totalLosses++ }
        else { totalDraws++; totalPoints += 1 }
      }

      const pos = tournament.finalStandings?.find((s) => s.uid === player.uid)?.position
      if (pos === 1) {
        tournamentsWon.push({
          tournamentId: tournament.id,
          tournamentName: tournament.name,
          type: tournament.type,
          wonAt: tournament.updatedAt,
        })
      } else if (pos === 2) { secondPlaces++ }
      else if (pos === 3) { thirdPlaces++ }
    }

    const palmaresDoc: Omit<PalmaresDoc, 'updatedAt'> & { updatedAt: ReturnType<typeof serverTimestamp> } = {
      uid: player.uid,
      displayName: player.displayName,
      photoURL: player.photoURL,
      totalGoalsFor,
      totalGoalsAgainst,
      totalPoints,
      totalMatchesPlayed,
      totalWins,
      totalDraws,
      totalLosses,
      tournamentsWon,
      tournamentsWonCount: tournamentsWon.length,
      secondPlaces,
      thirdPlaces,
      updatedAt: serverTimestamp(),
    }

    await setDoc(doc(db, 'palmares', player.uid), palmaresDoc)
  }
}
