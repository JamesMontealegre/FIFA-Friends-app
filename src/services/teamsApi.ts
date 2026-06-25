import type { Team } from '../types/team'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://fc26-clubs-api.vercel.app'

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  const json = await res.json()
  return json.data as T
}

export function fetchAllTeams(): Promise<Team[]> {
  return fetchJson<Team[]>(`${API_BASE}/api/teams`)
}

export function fetchTeamsByStars(stars: number): Promise<Team[]> {
  return fetchJson<Team[]>(`${API_BASE}/api/teams/by-stars?stars=${stars}`)
}

export function fetchTeamsByMinStars(minStars: number): Promise<Team[]> {
  return fetchJson<Team[]>(`${API_BASE}/api/teams/by-min-stars?min_stars=${minStars}`)
}

export function fetchTeamsSummary(): Promise<{ stars: number; teams: number; avg_GRL: number }[]> {
  return fetchJson(`${API_BASE}/api/teams/summary`)
}
