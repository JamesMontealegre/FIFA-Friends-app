import type { PlayerRef } from '../types/user'

export interface RoundRobinMatch {
  round: number
  home: PlayerRef
  away: PlayerRef
}

/**
 * Generate a round-robin schedule using the circle method.
 * If odd number of players, a BYE is added (filtered out).
 */
export function generateRoundRobin(players: PlayerRef[]): RoundRobinMatch[] {
  const list = [...players]
  const hasBye = list.length % 2 !== 0
  if (hasBye) {
    list.push({ uid: '__bye__', displayName: 'BYE', photoURL: '', tier: 'pro' })
  }

  const n = list.length
  const rounds = n - 1
  const half = n / 2
  const matches: RoundRobinMatch[] = []

  // Fix first player, rotate the rest
  const fixed = list[0]
  const rotating = list.slice(1)

  for (let round = 0; round < rounds; round++) {
    const current = [fixed, ...rotating]

    for (let i = 0; i < half; i++) {
      const home = current[i]
      const away = current[n - 1 - i]

      // Skip BYE matches
      if (home.uid === '__bye__' || away.uid === '__bye__') continue

      matches.push({ round: round + 1, home, away })
    }

    // Rotate: move last element to the front of the rotating array
    rotating.unshift(rotating.pop()!)
  }

  return matches
}
