import { useQuery } from '@tanstack/react-query'
import { getTournaments } from '../services/tournamentService'

export function useTournaments(maxResults = 20) {
  return useQuery({
    queryKey: ['tournaments', maxResults],
    queryFn: () => getTournaments(maxResults),
  })
}
