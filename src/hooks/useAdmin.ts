import { useAuth } from './useAuth'

export function useAdmin() {
  const { isAdmin } = useAuth()
  return isAdmin
}
