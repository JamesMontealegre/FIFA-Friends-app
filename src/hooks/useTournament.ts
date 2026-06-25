import { useEffect, useState } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '../config/firebase'
import type { TournamentDoc } from '../types/tournament'

export function useTournament(id: string | undefined) {
  const [tournament, setTournament] = useState<TournamentDoc | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) {
      setLoading(false)
      return
    }

    const unsubscribe = onSnapshot(
      doc(db, 'tournaments', id),
      (snap) => {
        if (snap.exists()) {
          setTournament({ id: snap.id, ...snap.data() } as TournamentDoc)
        } else {
          setTournament(null)
        }
        setLoading(false)
      },
      (error) => {
        console.error('Error loading tournament:', error)
        setTournament(null)
        setLoading(false)
      },
    )

    return () => unsubscribe()
  }, [id])

  return { tournament, loading }
}
