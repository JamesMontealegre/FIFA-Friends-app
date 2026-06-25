import { useEffect, useState } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '../config/firebase'
import type { TournamentDoc } from '../types/tournament'

const LOAD_TIMEOUT = 5000

export function useTournament(id: string | undefined) {
  const [tournament, setTournament] = useState<TournamentDoc | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) {
      setLoading(false)
      return
    }

    const timer = setTimeout(() => setLoading(false), LOAD_TIMEOUT)

    const unsubscribe = onSnapshot(
      doc(db, 'tournaments', id),
      (snap) => {
        clearTimeout(timer)
        if (snap.exists()) {
          setTournament({ id: snap.id, ...snap.data() } as TournamentDoc)
        } else {
          setTournament(null)
        }
        setLoading(false)
      },
      (error) => {
        clearTimeout(timer)
        console.error('Error loading tournament:', error)
        setTournament(null)
        setLoading(false)
      },
    )

    return () => {
      clearTimeout(timer)
      unsubscribe()
    }
  }, [id])

  return { tournament, loading }
}
