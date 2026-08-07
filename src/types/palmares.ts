import type { Timestamp } from 'firebase/firestore'
import type { TournamentVenue } from './tournament'

export interface TournamentWin {
  tournamentId: string
  tournamentName: string
  type: 'league' | 'cup'
  wonAt: Timestamp
}

/** Aggregate performance over a set of tournaments. */
export interface PalmaresStats {
  totalGoalsFor: number
  totalGoalsAgainst: number
  totalPoints: number
  totalMatchesPlayed: number
  totalWins: number
  totalDraws: number
  totalLosses: number
  tournamentsWon: TournamentWin[]
  tournamentsWonCount: number
  secondPlaces: number
  thirdPlaces: number
}

export interface PlayerIdentity {
  uid: string
  displayName: string
  photoURL: string
}

/** A player's identity paired with one set of stats — what the table renders. */
export type PalmaresRow = PlayerIdentity & PalmaresStats

/**
 * Root-level fields hold the consolidated totals across every venue, so older
 * documents written before the venue split still read correctly. `byVenue`
 * carries the same shape restricted to each venue.
 */
export interface PalmaresDoc extends PlayerIdentity, PalmaresStats {
  byVenue?: Record<TournamentVenue, PalmaresStats>
  updatedAt: Timestamp
}

export function emptyStats(): PalmaresStats {
  return {
    totalGoalsFor: 0,
    totalGoalsAgainst: 0,
    totalPoints: 0,
    totalMatchesPlayed: 0,
    totalWins: 0,
    totalDraws: 0,
    totalLosses: 0,
    tournamentsWon: [],
    tournamentsWonCount: 0,
    secondPlaces: 0,
    thirdPlaces: 0,
  }
}

/** True when the player has played at least one match in this set. */
export function hasActivity(stats: PalmaresStats | undefined): boolean {
  return (stats?.totalMatchesPlayed ?? 0) > 0
}

/** Ranking order: titles first, then podiums, then points. */
export function sortPalmaresRows<T extends PalmaresStats>(rows: T[]): T[] {
  return [...rows].sort(
    (a, b) =>
      (b.tournamentsWonCount ?? 0) - (a.tournamentsWonCount ?? 0) ||
      (b.secondPlaces ?? 0) - (a.secondPlaces ?? 0) ||
      (b.thirdPlaces ?? 0) - (a.thirdPlaces ?? 0) ||
      b.totalPoints - a.totalPoints,
  )
}
