import clsx from 'clsx'
import type { TournamentStatus } from '../../types/tournament'

const STATUS_CONFIG: Record<TournamentStatus, { label: string; color: string }> = {
  draft: { label: 'Sala de espera', color: 'bg-blue-500/20 text-blue-400' },
  league_stage: { label: 'Fase de Liga', color: 'bg-neon/20 text-neon' },
  group_stage: { label: 'Fase de Grupos', color: 'bg-neon/20 text-neon' },
  playoffs: { label: 'Playoffs', color: 'bg-amber-500/20 text-amber-400' },
  knockout: { label: 'Eliminatorias', color: 'bg-amber-500/20 text-amber-400' },
  completed: { label: 'Finalizado', color: 'bg-primary/20 text-primary-light' },
}

export function TournamentBadge({ status }: { status: TournamentStatus }) {
  const config = STATUS_CONFIG[status]
  return (
    <span className={clsx('px-2.5 py-0.5 rounded-full text-xs font-medium', config.color)}>
      {config.label}
    </span>
  )
}
