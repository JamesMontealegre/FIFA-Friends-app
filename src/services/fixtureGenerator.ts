import { collection, doc, writeBatch } from 'firebase/firestore'
import { db } from '../config/firebase'
import { generateRoundRobin } from '../lib/roundRobinUtils'
import { generateBracket } from '../lib/bracketUtils'
import type { PlayerRef } from '../types/user'
import type { MatchPhase } from '../types/tournament'

function makeTieId(): string {
  return crypto.randomUUID()
}

interface MatchData {
  tournamentId: string
  phase: MatchPhase
  round: number
  group?: string
  bracketPosition?: number
  homePlayer: { uid: string; displayName: string; photoURL: string }
  awayPlayer: { uid: string; displayName: string; photoURL: string }
  leg: 1 | 2
  tieId?: string
  homeTeam: null
  awayTeam: null
  homeScore: null
  awayScore: null
  status: 'pending'
}

async function commitMatchBatch(matches: MatchData[]): Promise<void> {
  const BATCH_SIZE = 500

  for (let i = 0; i < matches.length; i += BATCH_SIZE) {
    const chunk = matches.slice(i, i + BATCH_SIZE)
    const batch = writeBatch(db)

    for (const match of chunk) {
      const ref = doc(collection(db, 'tournaments', match.tournamentId, 'matches'))
      batch.set(ref, match)
    }

    await batch.commit()
  }
}

function makeMatchBase(tournamentId: string, phase: MatchPhase) {
  return {
    tournamentId,
    phase,
    homeTeam: null as null,
    awayTeam: null as null,
    homeScore: null as null,
    awayScore: null as null,
    status: 'pending' as const,
  }
}

export async function generateLeagueFixtures(
  tournamentId: string,
  players: PlayerRef[],
  homeAway: boolean,
): Promise<void> {
  const schedule = generateRoundRobin(players)
  const matches: MatchData[] = []
  const base = makeMatchBase(tournamentId, 'league')

  for (const match of schedule) {
    if (homeAway) {
      const tieId = makeTieId()
      matches.push({
        ...base,
        round: match.round,
        homePlayer: { uid: match.home.uid, displayName: match.home.displayName, photoURL: match.home.photoURL },
        awayPlayer: { uid: match.away.uid, displayName: match.away.displayName, photoURL: match.away.photoURL },
        leg: 1,
        tieId,
      })
      matches.push({
        ...base,
        round: match.round + schedule.length,
        homePlayer: { uid: match.away.uid, displayName: match.away.displayName, photoURL: match.away.photoURL },
        awayPlayer: { uid: match.home.uid, displayName: match.home.displayName, photoURL: match.home.photoURL },
        leg: 2,
        tieId,
      })
    } else {
      matches.push({
        ...base,
        round: match.round,
        homePlayer: { uid: match.home.uid, displayName: match.home.displayName, photoURL: match.home.photoURL },
        awayPlayer: { uid: match.away.uid, displayName: match.away.displayName, photoURL: match.away.photoURL },
        leg: 1,
      })
    }
  }

  await commitMatchBatch(matches)
}

export async function generateGroupFixtures(
  tournamentId: string,
  players: PlayerRef[],
  numberOfGroups: number,
  homeAway: boolean,
): Promise<void> {
  const shuffled = [...players].sort(() => Math.random() - 0.5)
  const groups: PlayerRef[][] = Array.from({ length: numberOfGroups }, () => [])

  shuffled.forEach((player, i) => {
    groups[i % numberOfGroups].push(player)
  })

  const groupLabels = 'ABCDEFGHIJKLMNOP'
  const matches: MatchData[] = []
  const base = makeMatchBase(tournamentId, 'group')

  for (let g = 0; g < groups.length; g++) {
    const groupPlayers = groups[g]
    const groupLabel = groupLabels[g]
    const schedule = generateRoundRobin(groupPlayers)

    for (const match of schedule) {
      if (homeAway) {
        const tieId = makeTieId()
        matches.push({
          ...base,
          round: match.round,
          group: groupLabel,
          homePlayer: { uid: match.home.uid, displayName: match.home.displayName, photoURL: match.home.photoURL },
          awayPlayer: { uid: match.away.uid, displayName: match.away.displayName, photoURL: match.away.photoURL },
          leg: 1,
          tieId,
        })
        matches.push({
          ...base,
          round: match.round + schedule.length,
          group: groupLabel,
          homePlayer: { uid: match.away.uid, displayName: match.away.displayName, photoURL: match.away.photoURL },
          awayPlayer: { uid: match.home.uid, displayName: match.home.displayName, photoURL: match.home.photoURL },
          leg: 2,
          tieId,
        })
      } else {
        matches.push({
          ...base,
          round: match.round,
          group: groupLabel,
          homePlayer: { uid: match.home.uid, displayName: match.home.displayName, photoURL: match.home.photoURL },
          awayPlayer: { uid: match.away.uid, displayName: match.away.displayName, photoURL: match.away.photoURL },
          leg: 1,
        })
      }
    }
  }

  await commitMatchBatch(matches)
}

export async function generateKnockoutFixtures(
  tournamentId: string,
  players: PlayerRef[],
  homeAway: boolean,
): Promise<void> {
  const bracket = generateBracket(players)
  const matches: MatchData[] = []
  const base = makeMatchBase(tournamentId, 'knockout')

  for (const match of bracket) {
    if (!match.home || !match.away) {
      if (match.home && !match.away) {
        matches.push({
          ...base,
          round: match.round,
          bracketPosition: match.bracketPosition,
          homePlayer: { uid: match.home.uid, displayName: match.home.displayName, photoURL: match.home.photoURL },
          awayPlayer: { uid: '__bye__', displayName: 'BYE', photoURL: '' },
          leg: 1,
        })
      }
      continue
    }

    if (homeAway) {
      const tieId = makeTieId()
      matches.push({
        ...base,
        round: match.round,
        bracketPosition: match.bracketPosition,
        homePlayer: { uid: match.home.uid, displayName: match.home.displayName, photoURL: match.home.photoURL },
        awayPlayer: { uid: match.away.uid, displayName: match.away.displayName, photoURL: match.away.photoURL },
        leg: 1,
        tieId,
      })
      matches.push({
        ...base,
        round: match.round,
        bracketPosition: match.bracketPosition,
        homePlayer: { uid: match.away.uid, displayName: match.away.displayName, photoURL: match.away.photoURL },
        awayPlayer: { uid: match.home.uid, displayName: match.home.displayName, photoURL: match.home.photoURL },
        leg: 2,
        tieId,
      })
    } else {
      matches.push({
        ...base,
        round: match.round,
        bracketPosition: match.bracketPosition,
        homePlayer: { uid: match.home.uid, displayName: match.home.displayName, photoURL: match.home.photoURL },
        awayPlayer: { uid: match.away.uid, displayName: match.away.displayName, photoURL: match.away.photoURL },
        leg: 1,
      })
    }
  }

  await commitMatchBatch(matches)
}
