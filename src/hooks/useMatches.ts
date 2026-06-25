import { useEffect, useState } from 'react'
import { collection, onSnapshot, query } from 'firebase/firestore'
import { db } from '../config/firebase'
import type { MatchDoc } from '../types/tournament'

export function useMatches(tournamentId: string | undefined) {
  const [matches, setMatches] = useState<MatchDoc[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!tournamentId) {
      setLoading(false)
      return
    }

    const q = query(
      collection(db, 'tournaments', tournamentId, 'matches'),
    )

    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as MatchDoc)
        docs.sort((a, b) => a.round - b.round)
        setMatches(docs)
        setLoading(false)
      },
      (error) => {
        console.error('Error loading matches:', error)
        setMatches([])
        setLoading(false)
      },
    )

    return () => unsubscribe()
  }, [tournamentId])

  return { matches, loading }
}
