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
import type { UserDoc } from '../types/user'

export async function recalculatePalmares(user: UserDoc): Promise<void> {
  // Get all completed tournaments
  const tournamentsSnap = await getDocs(
    query(collection(db, 'tournaments'), where('status', '==', 'completed')),
  )
  const tournaments = tournamentsSnap.docs.map(
    (d) => ({ id: d.id, ...d.data() }) as TournamentDoc,
  )

  let totalGoalsFor = 0
  let totalGoalsAgainst = 0
  let totalPoints = 0
  let totalMatchesPlayed = 0
  let totalWins = 0
  let totalDraws = 0
  let totalLosses = 0
  const tournamentsWon: TournamentWin[] = []

  for (const tournament of tournaments) {
    // Check if this user participated
    if (!tournament.players.some((p) => p.uid === user.uid)) continue

    // Get all matches
    const matchesSnap = await getDocs(
      collection(db, 'tournaments', tournament.id, 'matches'),
    )

    for (const mDoc of matchesSnap.docs) {
      const m = mDoc.data()
      if (m.status !== 'completed' || m.homeScore === null || m.awayScore === null) continue

      const isHome = m.homePlayer.uid === user.uid
      const isAway = m.awayPlayer.uid === user.uid
      if (!isHome && !isAway) continue

      totalMatchesPlayed++
      const gf = isHome ? m.homeScore : m.awayScore
      const ga = isHome ? m.awayScore : m.homeScore
      totalGoalsFor += gf
      totalGoalsAgainst += ga

      if (gf > ga) {
        totalWins++
        totalPoints += 3
      } else if (gf < ga) {
        totalLosses++
      } else {
        totalDraws++
        totalPoints += 1
      }
    }

    // Check if user won this tournament
    if (tournament.finalStandings?.[0]?.uid === user.uid) {
      tournamentsWon.push({
        tournamentId: tournament.id,
        tournamentName: tournament.name,
        type: tournament.type,
        wonAt: tournament.updatedAt,
      })
    }
  }

  const palmaresDoc: Omit<PalmaresDoc, 'updatedAt'> & { updatedAt: ReturnType<typeof serverTimestamp> } = {
    uid: user.uid,
    displayName: user.displayName,
    photoURL: user.photoURL,
    totalGoalsFor,
    totalGoalsAgainst,
    totalPoints,
    totalMatchesPlayed,
    totalWins,
    totalDraws,
    totalLosses,
    tournamentsWon,
    tournamentsWonCount: tournamentsWon.length,
    updatedAt: serverTimestamp(),
  }

  await setDoc(doc(db, 'palmares', user.uid), palmaresDoc)
}
