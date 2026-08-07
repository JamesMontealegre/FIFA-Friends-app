export type TeamKind = 'national' | 'club'

export interface Team {
  team: string
  flag: string
  league: string
  GRL: number
  ATA: number
  MED: number
  DEF: number
  stars: number
  country?: string
}

export interface League {
  league: string
  country: string
  flag: string
  clubs: number
  avg_GRL: number
}

export interface TeamSelection {
  team: string
  flag: string
  GRL: number
  stars: number
  kind: TeamKind
}
