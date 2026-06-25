import { useState } from 'react'
import { Button } from '../ui/Button'

interface TournamentFormData {
  name: string
  type: 'league' | 'cup'
  homeAway: boolean
  leagueConfig: { playoffSize: number }
  cupConfig: { numberOfGroups: number; teamsPerGroup: number; advancePerGroup: number }
}

interface TournamentFormProps {
  onSubmit: (data: TournamentFormData) => Promise<void>
}

export function TournamentForm({ onSubmit }: TournamentFormProps) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<TournamentFormData>({
    name: '',
    type: 'league',
    homeAway: false,
    leagueConfig: { playoffSize: 0 },
    cupConfig: { numberOfGroups: 2, teamsPerGroup: 4, advancePerGroup: 2 },
  })

  const canAdvance = () => {
    if (step === 1) return form.name.trim().length > 0
    if (step === 2) return true
    return true
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      await onSubmit(form)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto">
      {/* Steps indicator */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                s <= step ? 'bg-neon text-black' : 'bg-white/10 text-gray-500'
              }`}
            >
              {s}
            </div>
            {s < 2 && <div className={`w-12 h-0.5 ${s < step ? 'bg-neon' : 'bg-white/10'}`} />}
          </div>
        ))}
      </div>

      {/* Step 1: Basic info */}
      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-200">Informacion del torneo</h2>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Nombre</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ej: Copa Verano 2026"
              className="w-full px-4 py-2 bg-surface-card border border-white/10 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-neon/50 focus:border-neon/50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Tipo de torneo</label>
            <div className="grid grid-cols-2 gap-3">
              {(['league', 'cup'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setForm({ ...form, type: t })}
                  className={`p-4 rounded-lg border-2 text-left transition-colors ${
                    form.type === t ? 'border-neon bg-neon/5' : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  <p className="font-medium text-gray-200">{t === 'league' ? 'Liguilla' : 'Copa'}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {t === 'league' ? 'Todos contra todos + playoffs' : 'Grupos + eliminatorias'}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.homeAway}
              onChange={(e) => setForm({ ...form, homeAway: e.target.checked })}
              className="w-4 h-4 rounded border-white/20 bg-surface-card text-neon focus:ring-neon"
            />
            <div>
              <p className="text-sm font-medium text-gray-300">Ida y vuelta</p>
              <p className="text-xs text-gray-500">Los equipos se intercambian entre partidos</p>
            </div>
          </label>
        </div>
      )}

      {/* Step 2: Type-specific config */}
      {step === 2 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-200">
            {form.type === 'league' ? 'Configuracion de Liguilla' : 'Configuracion de Copa'}
          </h2>

          {form.type === 'league' ? (
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Clasificados a playoffs
              </label>
              <select
                value={form.leagueConfig.playoffSize}
                onChange={(e) =>
                  setForm({
                    ...form,
                    leagueConfig: { playoffSize: Number(e.target.value) },
                  })
                }
                className="w-full px-4 py-2 bg-surface-card border border-white/10 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-neon/50"
              >
                <option value={0}>Sin playoffs (solo liguilla)</option>
                <option value={2}>Final (top 2)</option>
                <option value={4}>Semifinales (top 4)</option>
                <option value={8}>Cuartos de final (top 8)</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Los mejores clasificados pasan a eliminacion directa
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Numero de grupos
                </label>
                <select
                  value={form.cupConfig.numberOfGroups}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      cupConfig: { ...form.cupConfig, numberOfGroups: Number(e.target.value) },
                    })
                  }
                  className="w-full px-4 py-2 bg-surface-card border border-white/10 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-neon/50"
                >
                  {[2, 3, 4, 6, 8].map((n) => (
                    <option key={n} value={n}>{n} grupos</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Clasificados por grupo
                </label>
                <select
                  value={form.cupConfig.advancePerGroup}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      cupConfig: { ...form.cupConfig, advancePerGroup: Number(e.target.value) },
                    })
                  }
                  className="w-full px-4 py-2 bg-surface-card border border-white/10 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-neon/50"
                >
                  {[1, 2, 3].map((n) => (
                    <option key={n} value={n}>Top {n}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        {step > 1 ? (
          <Button variant="secondary" onClick={() => setStep(step - 1)}>
            Atras
          </Button>
        ) : (
          <div />
        )}
        {step < 2 ? (
          <Button onClick={() => setStep(step + 1)} disabled={!canAdvance()}>
            Siguiente
          </Button>
        ) : (
          <Button onClick={handleSubmit} loading={loading} disabled={!canAdvance()}>
            Crear Torneo
          </Button>
        )}
      </div>
    </div>
  )
}
