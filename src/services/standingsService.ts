import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../config/firebase'
import { getMatches } from './matchService'
import { getTournament } from './tournamentService'
import { calculateStandings } from '../lib/standingsCalculator'
import type { StandingTable, StandingsDoc } from '../types/tournament'

export async function recalculateStandings(tournamentId: string): Promise<void> {
  const tournament = await getTournament(tournamentId)
  if (!tournament) return

  const allMatches = await getMatches(tournamentId)
  const tables: StandingTable[] = []

  if (tournament.type === 'league') {
    const leagueMatches = allMatches.filter((m) => m.phase === 'league')
    tables.push({
      rows: calculateStandings(leagueMatches, tournament.players),
    })
  } else {
    // Cup: one table per group
    const groupMatches = allMatches.filter((m) => m.phase === 'group')
    const groups = [...new Set(groupMatches.map((m) => m.group).filter(Boolean))] as string[]
    groups.sort()

    for (const group of groups) {
      const gMatches = groupMatches.filter((m) => m.group === group)
      // Find players in this group
      const playerUids = new Set<string>()
      for (const m of gMatches) {
        playerUids.add(m.homePlayer.uid)
        playerUids.add(m.awayPlayer.uid)
      }
      const groupPlayers = tournament.players.filter((p) => playerUids.has(p.uid))

      tables.push({
        group,
        rows: calculateStandings(gMatches, groupPlayers),
      })
    }
  }

  await setDoc(doc(db, 'standings', tournamentId), {
    tournamentId,
    tables,
    updatedAt: serverTimestamp(),
  })
}

export async function getStandings(tournamentId: string): Promise<StandingsDoc | null> {
  const snap = await getDoc(doc(db, 'standings', tournamentId))
  if (!snap.exists()) return null
  return snap.data() as StandingsDoc
}
