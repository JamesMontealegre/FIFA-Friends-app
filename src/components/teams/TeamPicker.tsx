import { useState, useMemo } from 'react'
import { Modal } from '../ui/Modal'
import { RandomTeamSpinner } from './RandomTeamSpinner'
import type { Team, TeamSelection } from '../../types/team'

interface TeamPickerProps {
  open: boolean
  onClose: () => void
  onSelect: (team: TeamSelection) => void
  teams: Team[]
  excludeTeams?: string[]
  title?: string
}

export function TeamPicker({ open, onClose, onSelect, teams, excludeTeams = [], title = 'Elegir Seleccion' }: TeamPickerProps) {
  const [mode, setMode] = useState<'manual' | 'random'>('manual')
  const [search, setSearch] = useState('')
  const [exactStars, setExactStars] = useState(0)

  const available = useMemo(
    () => teams.filter((t) => !excludeTeams.includes(t.team)),
    [teams, excludeTeams],
  )

  const filtered = useMemo(
    () =>
      available.filter(
        (t) => !search || t.team.toLowerCase().includes(search.toLowerCase()),
      ),
    [available, search],
  )

  const handleSelect = (team: TeamSelection) => {
    onSelect(team)
    onClose()
    setSearch('')
    setMode('manual')
  }

  return (
    <Modal open={open} onClose={onClose} title={title}>
      {/* Mode toggle */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setMode('manual')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
            mode === 'manual' ? 'bg-neon text-black' : 'bg-white/10 text-gray-400'
          }`}
        >
          Manual
        </button>
        <button
          onClick={() => setMode('random')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
            mode === 'random' ? 'bg-neon text-black' : 'bg-white/10 text-gray-400'
          }`}
        >
          Random
        </button>
      </div>

      {mode === 'random' ? (
        <>
          <div className="flex items-center gap-2 mb-4">
            <label className="text-sm text-gray-400">Estrellas:</label>
            <select
              value={exactStars}
              onChange={(e) => setExactStars(Number(e.target.value))}
              className="px-3 py-1.5 bg-surface-card border border-white/10 rounded-lg text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-neon/50"
            >
              <option value={0}>Todas</option>
              <option value={5}>{'\u2605'.repeat(5)}</option>
              <option value={4.5}>{'\u2605'.repeat(4)}{'\u00BD'}</option>
              <option value={4}>{'\u2605'.repeat(4)}</option>
              <option value={3.5}>{'\u2605'.repeat(3)}{'\u00BD'}</option>
              <option value={3}>{'\u2605'.repeat(3)}</option>
              <option value={2.5}>{'\u2605'.repeat(2)}{'\u00BD'}</option>
              <option value={2}>{'\u2605'.repeat(2)}</option>
            </select>
          </div>
          <RandomTeamSpinner
            teams={exactStars > 0 ? available.filter((t) => t.stars === exactStars) : available}
            onSelect={handleSelect}
          />
        </>
      ) : (
        <>
          <input
            type="text"
            placeholder="Buscar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-2 bg-surface-card border border-white/10 rounded-lg mb-3 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-neon/50"
          />
          <div className="space-y-1 max-h-80 overflow-y-auto">
            {filtered.map((team) => (
              <button
                key={team.team}
                onClick={() =>
                  handleSelect({
                    team: team.team,
                    flag: team.flag,
                    GRL: team.GRL,
                    stars: team.stars,
                  })
                }
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 text-left transition-colors"
              >
                <span className="text-2xl">{team.flag}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-200 truncate">{team.team}</p>
                  <p className="text-xs text-gray-500">
                    {'\u2605'.repeat(Math.floor(team.stars))}
                    {team.stars % 1 >= 0.5 ? '\u00BD' : ''} - GRL {team.GRL}
                  </p>
                </div>
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">No hay selecciones disponibles</p>
            )}
          </div>
        </>
      )}
    </Modal>
  )
}
