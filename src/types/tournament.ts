import type { Timestamp } from 'firebase/firestore'
import type { PlayerRef } from './user'
import type { TeamSelection } from './team'

export interface LeagueConfig {
  playoffSize: number
}

export interface CupConfig {
  numberOfGroups: number
  teamsPerGroup: number
  advancePerGroup: number
}

export type TournamentStatus =
  | 'draft'
  | 'group_stage'
  | 'league_stage'
  | 'playoffs'
  | 'knockout'
  | 'completed'

export interface FinalStanding {
  uid: string
  displayName: string
  position: number
}

export interface TournamentDoc {
  id: string
  name: string
  type: 'league' | 'cup'
  homeAway: boolean
  status: TournamentStatus
  createdBy: string
  createdAt: Timestamp
  updatedAt: Timestamp
  players: PlayerRef[]
  inviteCode: string
  inviteCodeLower: string
  leagueConfig?: LeagueConfig
  cupConfig?: CupConfig
  usedTeams: Record<string, string[]>
  finalStandings?: FinalStanding[]
}

export type MatchPhase = 'league' | 'group' | 'knockout'
export type MatchStatus = 'pending' | 'teams_selected' | 'completed'

export interface MatchPlayer {
  uid: string
  displayName: string
  photoURL: string
}

export interface MatchDoc {
  id: string
  tournamentId: string
  phase: MatchPhase
  round: number
  group?: string
  bracketPosition?: number
  homePlayer: MatchPlayer
  awayPlayer: MatchPlayer
  homeTeam: TeamSelection | null
  awayTeam: TeamSelection | null
  homeScore: number | null
  awayScore: number | null
  leg: 1 | 2
  tieId?: string
  status: MatchStatus
  completedAt?: Timestamp
  sessionNumber?: number
}

export type FormResult = 'W' | 'D' | 'L'

export interface StandingRow {
  uid: string
  displayName: string
  photoURL: string
  played: number
  won: number
  drawn: number
  lost: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
  points: number
  form: FormResult[]
}

export interface StandingTable {
  group?: string
  rows: StandingRow[]
}

export interface StandingsDoc {
  tournamentId: string
  tables: StandingTable[]
  updatedAt: Timestamp
}
