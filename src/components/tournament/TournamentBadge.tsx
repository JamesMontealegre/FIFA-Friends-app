import clsx from 'clsx'
import type { TournamentStatus, TournamentVenue } from '../../types/tournament'

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
    <span className={clsx('px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap', config.color)}>
      {config.label}
    </span>
  )
}

const VENUE_CONFIG: Record<TournamentVenue, { label: string; icon: string; color: string }> = {
  presencial: { label: 'Presencial', icon: '🏠', color: 'bg-emerald-500/20 text-emerald-400' },
  remoto: { label: 'Remoto', icon: '🌐', color: 'bg-sky-500/20 text-sky-400' },
}

export function VenueBadge({ venue }: { venue: TournamentVenue }) {
  const config = VENUE_CONFIG[venue] ?? VENUE_CONFIG.presencial
  return (
    <span className={clsx('px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap', config.color)}>
      <span className="mr-1">{config.icon}</span>
      {config.label}
    </span>
  )
}
