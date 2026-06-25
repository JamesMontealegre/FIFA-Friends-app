import { useEffect, useState } from 'react'
import { collection, onSnapshot, query } from 'firebase/firestore'
import { db } from '../config/firebase'
import type { PalmaresDoc } from '../types/palmares'

export function usePalmares() {
  const [palmares, setPalmares] = useState<PalmaresDoc[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(collection(db, 'palmares'))

    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        const docs = snap.docs.map((d) => d.data() as PalmaresDoc)
        docs.sort((a, b) =>
          (b.tournamentsWonCount ?? 0) - (a.tournamentsWonCount ?? 0)
          || (b.secondPlaces ?? 0) - (a.secondPlaces ?? 0)
          || (b.thirdPlaces ?? 0) - (a.thirdPlaces ?? 0)
          || b.totalPoints - a.totalPoints,
        )
        setPalmares(docs)
        setLoading(false)
      },
      (error) => {
        console.error('Error loading palmares:', error)
        setPalmares([])
        setLoading(false)
      },
    )

    return () => unsubscribe()
  }, [])

  return { palmares, loading }
}
