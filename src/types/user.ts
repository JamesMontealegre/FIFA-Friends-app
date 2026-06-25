import type { Timestamp } from 'firebase/firestore'

export type UserRole = 'admin' | 'viewer'
/** pro = all teams, casual = only 5-star teams */
export type PlayerTier = 'pro' | 'casual'

export interface UserDoc {
  uid: string
  email: string
  displayName: string
  photoURL: string
  role: UserRole
  tier: PlayerTier
  createdAt: Timestamp
  lastLoginAt: Timestamp
}

export interface PlayerRef {
  uid: string
  displayName: string
  photoURL: string
  tier: PlayerTier
}
