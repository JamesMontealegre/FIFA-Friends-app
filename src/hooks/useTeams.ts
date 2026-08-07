import { useQuery } from '@tanstack/react-query'
import { fetchAllTeams, fetchAllClubs, fetchLeagues } from '../services/teamsApi'
import type { TeamKind } from '../types/team'

export function useTeams() {
  return useQuery({
    queryKey: ['teams'],
    queryFn: fetchAllTeams,
    staleTime: Infinity,
  })
}

export function useClubs() {
  return useQuery({
    queryKey: ['clubs'],
    queryFn: fetchAllClubs,
    staleTime: Infinity,
  })
}

export function useLeagues() {
  return useQuery({
    queryKey: ['leagues'],
    queryFn: fetchLeagues,
    staleTime: Infinity,
  })
}

export function useTeamsByKind(kind: TeamKind) {
  return useQuery({
    queryKey: [kind === 'club' ? 'clubs' : 'teams'],
    queryFn: kind === 'club' ? fetchAllClubs : fetchAllTeams,
    staleTime: Infinity,
  })
}
