import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  arrayUnion,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '../config/firebase'
import { generateInviteCode } from '../lib/inviteCode'
import { generateLeagueFixtures, generateGroupFixtures } from './fixtureGenerator'
import type { TournamentDoc } from '../types/tournament'
import type { PlayerRef } from '../types/user'

const COLLECTION = 'tournaments'

export interface CreateTournamentInput {
  name: string
  type: 'league' | 'cup'
  homeAway: boolean
  leagueConfig?: { playoffSize: number }
  cupConfig?: { numberOfGroups: number; teamsPerGroup: number; advancePerGroup: number }
  createdBy: PlayerRef
}

export async function createTournament(input: CreateTournamentInput): Promise<string> {
  const inviteCode = generateInviteCode()
  const { createdBy, ...rest } = input
  const docRef = await addDoc(collection(db, COLLECTION), {
    ...rest,
    createdBy: createdBy.uid,
    players: [createdBy],
    inviteCode,
    inviteCodeLower: inviteCode.toLowerCase(),
    status: 'draft',
    usedTeams: {},
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return docRef.id
}

export async function getTournaments(maxResults = 20): Promise<TournamentDoc[]> {
  const q = query(
    collection(db, COLLECTION),
    orderBy('createdAt', 'desc'),
    limit(maxResults),
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as TournamentDoc)
}

export async function getTournament(id: string): Promise<TournamentDoc | null> {
  const snap = await getDoc(doc(db, COLLECTION, id))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() } as TournamentDoc
}

export async function updateTournament(id: string, data: Partial<TournamentDoc>): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), {
    ...data,
    updatedAt: serverTimestamp(),
  })
}

export async function deleteTournament(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id))
}

export async function findTournamentByCode(code: string): Promise<TournamentDoc | null> {
  const q = query(
    collection(db, COLLECTION),
    where('inviteCodeLower', '==', code.toLowerCase()),
  )
  const snap = await getDocs(q)
  if (snap.empty) return null
  const d = snap.docs[0]
  return { id: d.id, ...d.data() } as TournamentDoc
}

export async function joinTournament(tournamentId: string, player: PlayerRef): Promise<void> {
  await updateDoc(doc(db, COLLECTION, tournamentId), {
    players: arrayUnion(player),
    updatedAt: serverTimestamp(),
  })
}

export async function startTournament(
  tournamentId: string,
  tournament: TournamentDoc,
): Promise<void> {
  if (tournament.players.length < 2) {
    throw new Error('Se necesitan al menos 2 jugadores')
  }

  if (tournament.type === 'league') {
    await generateLeagueFixtures(tournamentId, tournament.players, tournament.homeAway)
    await updateTournament(tournamentId, { status: 'league_stage' } as never)
  } else {
    await generateGroupFixtures(
      tournamentId,
      tournament.players,
      tournament.cupConfig!.numberOfGroups,
      tournament.homeAway,
    )
    await updateTournament(tournamentId, { status: 'group_stage' } as never)
  }
}
