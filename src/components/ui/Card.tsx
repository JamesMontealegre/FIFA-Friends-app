import clsx from 'clsx'
import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  onClick?: () => void
}

export function Card({ children, className, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={clsx(
        'rounded-xl bg-surface-card border border-white/10',
        onClick && 'cursor-pointer hover:border-neon/30 hover:shadow-lg hover:shadow-neon/5 transition-all',
        className,
      )}
    >
      {children}
    </div>
  )
}
