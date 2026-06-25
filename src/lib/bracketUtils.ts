import type { PlayerRef } from '../types/user'

export interface BracketMatch {
  bracketPosition: number
  round: number
  home: PlayerRef | null
  away: PlayerRef | null
}

/**
 * Generate a single-elimination bracket.
 * Players are seeded by their order in the array.
 * bracketPosition: 1 = final, 2-3 = semis, 4-7 = quarters, etc.
 */
export function generateBracket(players: PlayerRef[]): BracketMatch[] {
  // Round up to next power of 2
  let size = 1
  while (size < players.length) size *= 2

  const totalRounds = Math.log2(size)
  const matches: BracketMatch[] = []

  // Generate all bracket positions (1-indexed)
  // Position 1 = final, 2-3 = semis, etc.
  // First round matches are positions [size/2 .. size-1]
  const firstRoundStart = size / 2

  // Seed players into first-round positions
  const seeded: (PlayerRef | null)[] = new Array(size).fill(null)
  for (let i = 0; i < players.length; i++) {
    seeded[i] = players[i]
  }

  // Generate first round matches
  for (let i = 0; i < size / 2; i++) {
    const home = seeded[i * 2]
    const away = seeded[i * 2 + 1]
    const pos = firstRoundStart + i

    // Skip if both are null (no match needed)
    if (!home && !away) continue

    matches.push({
      bracketPosition: pos,
      round: 1,
      home,
      away,
    })
  }

  // Generate subsequent rounds (empty matches to be filled as results come in)
  for (let round = 2; round <= totalRounds; round++) {
    const roundStart = size / Math.pow(2, round)
    const matchesInRound = roundStart

    for (let i = 0; i < matchesInRound; i++) {
      matches.push({
        bracketPosition: roundStart + i,
        round,
        home: null,
        away: null,
      })
    }
  }

  return matches
}

/**
 * Get the round name based on the number of matches in the round.
 */
export function getRoundName(matchesInRound: number): string {
  switch (matchesInRound) {
    case 1: return 'Final'
    case 2: return 'Semifinal'
    case 4: return 'Cuartos de Final'
    case 8: return 'Octavos de Final'
    case 16: return 'Dieciseisavos de Final'
    default: return `Ronda de ${matchesInRound * 2}`
  }
}
