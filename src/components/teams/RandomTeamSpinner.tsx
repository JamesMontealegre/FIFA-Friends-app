import { useState, useCallback } from 'react'
import type { Team } from '../../types/team'
import type { TeamSelection } from '../../types/team'
import { Button } from '../ui/Button'

interface RandomTeamSpinnerProps {
  teams: Team[]
  onSelect: (team: TeamSelection) => void
}

export function RandomTeamSpinner({ teams, onSelect }: RandomTeamSpinnerProps) {
  const [spinning, setSpinning] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [result, setResult] = useState<Team | null>(null)

  const spin = useCallback(() => {
    if (teams.length === 0) return
    setSpinning(true)
    setResult(null)

    // Pre-determine the final team
    const finalIndex = Math.floor(Math.random() * teams.length)
    let tick = 0
    const totalTicks = 20 + Math.floor(Math.random() * 10)

    const interval = setInterval(() => {
      tick++
      setCurrentIndex((prev) => (prev + 1) % teams.length)

      if (tick >= totalTicks) {
        clearInterval(interval)
        setCurrentIndex(finalIndex)
        setResult(teams[finalIndex])
        setSpinning(false)
      }
    }, Math.min(50 + tick * 15, 300))

    return () => clearInterval(interval)
  }, [teams])

  const handleConfirm = () => {
    if (result) {
      onSelect({
        team: result.team,
        flag: result.flag,
        GRL: result.GRL,
        stars: result.stars,
      })
    }
  }

  const current = teams[currentIndex]

  return (
    <div className="flex flex-col items-center gap-4 py-6">
      <div
        className={`text-center transition-all ${spinning ? 'animate-pulse' : ''}`}
      >
        <span className="text-7xl block mb-2">{current?.flag ?? '🏳️'}</span>
        <p className="text-lg font-semibold text-gray-100">{current?.team ?? '---'}</p>
        {current && (
          <p className="text-sm text-gray-500">
            {'★'.repeat(Math.floor(current.stars))}
            {current.stars % 1 >= 0.5 ? '½' : ''} - GRL {current.GRL}
          </p>
        )}
      </div>

      <div className="flex gap-2">
        {!result ? (
          <Button onClick={spin} disabled={spinning || teams.length === 0}>
            {spinning ? 'Girando...' : 'Random'}
          </Button>
        ) : (
          <>
            <Button variant="secondary" onClick={spin}>
              Girar de nuevo
            </Button>
            <Button onClick={handleConfirm}>
              Confirmar
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
