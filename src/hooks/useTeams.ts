import { useQuery } from '@tanstack/react-query'
import { fetchAllTeams } from '../services/teamsApi'

export function useTeams() {
  return useQuery({
    queryKey: ['teams'],
    queryFn: fetchAllTeams,
    staleTime: Infinity,
  })
}
