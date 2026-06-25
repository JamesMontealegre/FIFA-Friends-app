import type { MatchDoc, StandingRow } from '../types/tournament'
import type { PlayerRef } from '../types/user'

export function calculateStandings(
  matches: MatchDoc[],
  players: PlayerRef[],
): StandingRow[] {
  const map = new Map<string, StandingRow>()

  for (const p of players) {
    map.set(p.uid, {
      uid: p.uid,
      displayName: p.displayName,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0,
    })
  }

  for (const m of matches) {
    if (m.status !== 'completed' || m.homeScore === null || m.awayScore === null) continue

    const home = map.get(m.homePlayer.uid)
    const away = map.get(m.awayPlayer.uid)
    if (!home || !away) continue

    home.played++
    away.played++
    home.goalsFor += m.homeScore
    home.goalsAgainst += m.awayScore
    away.goalsFor += m.awayScore
    away.goalsAgainst += m.homeScore

    if (m.homeScore > m.awayScore) {
      home.won++
      home.points += 3
      away.lost++
    } else if (m.homeScore < m.awayScore) {
      away.won++
      away.points += 3
      home.lost++
    } else {
      home.drawn++
      away.drawn++
      home.points += 1
      away.points += 1
    }
  }

  const rows = Array.from(map.values())
  for (const r of rows) {
    r.goalDifference = r.goalsFor - r.goalsAgainst
  }

  rows.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference
    return b.goalsFor - a.goalsFor
  })

  return rows
}
