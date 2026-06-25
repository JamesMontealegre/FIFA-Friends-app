import type { MatchDoc, StandingRow, FormResult } from '../types/tournament'
import type { PlayerRef } from '../types/user'

export function calculateStandings(
  matches: MatchDoc[],
  players: PlayerRef[],
): StandingRow[] {
  const map = new Map<string, StandingRow>()
  const formMap = new Map<string, { round: number; result: FormResult }[]>()

  for (const p of players) {
    map.set(p.uid, {
      uid: p.uid,
      displayName: p.displayName,
      photoURL: p.photoURL,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0,
      form: [],
    })
    formMap.set(p.uid, [])
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
      formMap.get(m.homePlayer.uid)?.push({ round: m.round, result: 'W' })
      formMap.get(m.awayPlayer.uid)?.push({ round: m.round, result: 'L' })
    } else if (m.homeScore < m.awayScore) {
      away.won++
      away.points += 3
      home.lost++
      formMap.get(m.homePlayer.uid)?.push({ round: m.round, result: 'L' })
      formMap.get(m.awayPlayer.uid)?.push({ round: m.round, result: 'W' })
    } else {
      home.drawn++
      away.drawn++
      home.points += 1
      away.points += 1
      formMap.get(m.homePlayer.uid)?.push({ round: m.round, result: 'D' })
      formMap.get(m.awayPlayer.uid)?.push({ round: m.round, result: 'D' })
    }
  }

  const rows = Array.from(map.values())
  for (const r of rows) {
    r.goalDifference = r.goalsFor - r.goalsAgainst
    // Last 5 results sorted by round (most recent last)
    const entries = formMap.get(r.uid) ?? []
    entries.sort((a, b) => a.round - b.round)
    r.form = entries.slice(-5).map((e) => e.result)
  }

  rows.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference
    return b.goalsFor - a.goalsFor
  })

  return rows
}
