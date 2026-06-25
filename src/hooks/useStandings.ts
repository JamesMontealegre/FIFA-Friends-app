import { useEffect, useState } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '../config/firebase'
import type { StandingsDoc } from '../types/tournament'

const LOAD_TIMEOUT = 5000

export function useStandings(tournamentId: string | undefined) {
  const [standings, setStandings] = useState<StandingsDoc | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!tournamentId) {
      setLoading(false)
      return
    }

    const timer = setTimeout(() => setLoading(false), LOAD_TIMEOUT)

    const unsubscribe = onSnapshot(
      doc(db, 'standings', tournamentId),
      (snap) => {
        clearTimeout(timer)
        if (snap.exists()) {
          setStandings(snap.data() as StandingsDoc)
        } else {
          setStandings(null)
        }
        setLoading(false)
      },
      (error) => {
        clearTimeout(timer)
        console.error('Error loading standings:', error)
        setStandings(null)
        setLoading(false)
      },
    )

    return () => {
      clearTimeout(timer)
      unsubscribe()
    }
  }, [tournamentId])

  return { standings, loading }
}
