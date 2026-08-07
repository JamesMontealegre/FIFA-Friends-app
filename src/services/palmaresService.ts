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
import type { TournamentDoc, TournamentVenue } from '../types/tournament'
import type { PalmaresDoc, PalmaresStats } from '../types/palmares'
import { emptyStats } from '../types/palmares'
import type { PlayerRef } from '../types/user'

/** Tournaments created before the venue field existed were played in person. */
function venueOf(tournament: TournamentDoc): TournamentVenue {
  return tournament.venue ?? 'presencial'
}

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
    const consolidated = emptyStats()
    const byVenue: Record<TournamentVenue, PalmaresStats> = {
      presencial: emptyStats(),
      remoto: emptyStats(),
    }

    for (const tournament of tournaments) {
      if (!tournament.players.some((p) => p.uid === player.uid)) continue

      // Every tally lands in both the consolidated totals and its venue bucket.
      const buckets = [consolidated, byVenue[venueOf(tournament)]]

      const matches = tournamentMatches[tournament.id] ?? []
      for (const m of matches) {
        if (m.status !== 'completed' || m.homeScore === null || m.awayScore === null) continue
        const hp = m.homePlayer as { uid: string }
        const ap = m.awayPlayer as { uid: string }
        const isHome = hp.uid === player.uid
        const isAway = ap.uid === player.uid
        if (!isHome && !isAway) continue

        const gf = isHome ? (m.homeScore as number) : (m.awayScore as number)
        const ga = isHome ? (m.awayScore as number) : (m.homeScore as number)

        for (const b of buckets) {
          b.totalMatchesPlayed++
          b.totalGoalsFor += gf
          b.totalGoalsAgainst += ga
          if (gf > ga) { b.totalWins++; b.totalPoints += 3 }
          else if (gf < ga) { b.totalLosses++ }
          else { b.totalDraws++; b.totalPoints += 1 }
        }
      }

      const pos = tournament.finalStandings?.find((s) => s.uid === player.uid)?.position
      if (pos === 1) {
        for (const b of buckets) {
          b.tournamentsWon.push({
            tournamentId: tournament.id,
            tournamentName: tournament.name,
            type: tournament.type,
            wonAt: tournament.updatedAt,
          })
          b.tournamentsWonCount++
        }
      } else if (pos === 2) {
        for (const b of buckets) b.secondPlaces++
      } else if (pos === 3) {
        for (const b of buckets) b.thirdPlaces++
      }
    }

    const palmaresDoc: Omit<PalmaresDoc, 'updatedAt'> & { updatedAt: ReturnType<typeof serverTimestamp> } = {
      uid: player.uid,
      displayName: player.displayName,
      photoURL: player.photoURL,
      ...consolidated,
      byVenue,
      updatedAt: serverTimestamp(),
    }

    await setDoc(doc(db, 'palmares', player.uid), palmaresDoc)
  }
}
