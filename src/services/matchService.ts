import {
  collection,
  doc,
  getDocs,
  getDoc,
  updateDoc,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '../config/firebase'
import type { MatchDoc } from '../types/tournament'
import type { TeamSelection } from '../types/team'

function matchesRef(tournamentId: string) {
  return collection(db, 'tournaments', tournamentId, 'matches')
}

export async function getMatches(tournamentId: string): Promise<MatchDoc[]> {
  const q = query(matchesRef(tournamentId))
  const snap = await getDocs(q)
  const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as MatchDoc)
  docs.sort((a, b) => a.round - b.round)
  return docs
}

export async function getMatchesByPhase(tournamentId: string, phase: string): Promise<MatchDoc[]> {
  const q = query(matchesRef(tournamentId), where('phase', '==', phase))
  const snap = await getDocs(q)
  const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as MatchDoc)
  docs.sort((a, b) => a.round - b.round)
  return docs
}

export async function getMatch(tournamentId: string, matchId: string): Promise<MatchDoc | null> {
  const snap = await getDoc(doc(db, 'tournaments', tournamentId, 'matches', matchId))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() } as MatchDoc
}

export async function updateMatchTeams(
  tournamentId: string,
  matchId: string,
  homeTeam: TeamSelection,
  awayTeam: TeamSelection,
): Promise<void> {
  await updateDoc(doc(db, 'tournaments', tournamentId, 'matches', matchId), {
    homeTeam,
    awayTeam,
    status: 'teams_selected',
  })
}

export async function updateMatchScore(
  tournamentId: string,
  matchId: string,
  homeScore: number,
  awayScore: number,
): Promise<void> {
  await updateDoc(doc(db, 'tournaments', tournamentId, 'matches', matchId), {
    homeScore,
    awayScore,
    status: 'completed',
    completedAt: serverTimestamp(),
  })
}

export async function addUsedTeams(
  tournamentId: string,
  playerUid: string,
  teamNames: string[],
  currentUsedTeams: Record<string, string[]>,
): Promise<void> {
  const existing = currentUsedTeams[playerUid] || []
  const updated = { ...currentUsedTeams }
  updated[playerUid] = [...existing, ...teamNames]

  await updateDoc(doc(db, 'tournaments', tournamentId), {
    usedTeams: updated,
  })
}
