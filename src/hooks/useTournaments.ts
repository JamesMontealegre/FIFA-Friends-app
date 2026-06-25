import { useEffect, useState } from 'react'
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore'
import { db } from '../config/firebase'
import type { TournamentDoc } from '../types/tournament'

const LOAD_TIMEOUT = 5000

export function useTournaments(maxResults = 20) {
  const [tournaments, setTournaments] = useState<TournamentDoc[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), LOAD_TIMEOUT)

    const q = query(
      collection(db, 'tournaments'),
      orderBy('createdAt', 'desc'),
      limit(maxResults),
    )

    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        clearTimeout(timer)
        const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as TournamentDoc)
        setTournaments(docs)
        setLoading(false)
      },
      (error) => {
        clearTimeout(timer)
        console.error('Error loading tournaments:', error)
        setTournaments([])
        setLoading(false)
      },
    )

    return () => {
      clearTimeout(timer)
      unsubscribe()
    }
  }, [maxResults])

  return { data: tournaments, isLoading: loading }
}
