import type { Timestamp } from 'firebase/firestore'

export interface TournamentWin {
  tournamentId: string
  tournamentName: string
  type: 'league' | 'cup'
  wonAt: Timestamp
}

export interface PalmaresDoc {
  uid: string
  displayName: string
  photoURL: string
  totalGoalsFor: number
  totalGoalsAgainst: number
  totalPoints: number
  totalMatchesPlayed: number
  totalWins: number
  totalDraws: number
  totalLosses: number
  tournamentsWon: TournamentWin[]
  tournamentsWonCount: number
  updatedAt: Timestamp
}
