import { useEffect, useState } from 'react'
import { collection, onSnapshot, query, where, orderBy } from 'firebase/firestore'
import { db } from '../config/firebase'
import type { TournamentDoc } from '../types/tournament'

export function useHistorial() {
  const [tournaments, setTournaments] = useState<TournamentDoc[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(
      collection(db, 'tournaments'),
      where('status', '==', 'completed'),
      orderBy('updatedAt', 'desc'),
    )

    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as TournamentDoc)
        setTournaments(docs)
        setLoading(false)
      },
      (error) => {
        console.error('Error loading historial:', error)
        setTournaments([])
        setLoading(false)
      },
    )

    return () => unsubscribe()
  }, [])

  return { tournaments, loading }
}
