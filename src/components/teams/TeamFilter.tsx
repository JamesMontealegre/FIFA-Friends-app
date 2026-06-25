import clsx from 'clsx'

const STAR_OPTIONS = [0, 5, 4.5, 4, 3.5, 3, 2.5, 2, 1.5, 1]

interface TeamFilterProps {
  selectedStars: number
  onStarsChange: (stars: number) => void
  search: string
  onSearchChange: (search: string) => void
}

export function TeamFilter({ selectedStars, onStarsChange, search, onSearchChange }: TeamFilterProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-6">
      <input
        type="text"
        placeholder="Buscar seleccion..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="px-4 py-2 bg-surface-card border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-neon/50 focus:border-neon/50 text-sm text-gray-200 placeholder-gray-500 flex-1"
      />
      <div className="flex flex-wrap gap-1">
        {STAR_OPTIONS.map((s) => (
          <button
            key={s}
            onClick={() => onStarsChange(s)}
            className={clsx(
              'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
              selectedStars === s
                ? 'bg-neon text-black'
                : 'bg-white/10 text-gray-400 hover:bg-white/20',
            )}
          >
            {s === 0 ? 'Todas' : `${s}\u2605`}
          </button>
        ))}
      </div>
    </div>
  )
}
