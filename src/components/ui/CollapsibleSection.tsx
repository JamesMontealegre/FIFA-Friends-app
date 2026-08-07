import { useState, type ReactNode } from 'react'
import clsx from 'clsx'

interface CollapsibleSectionProps {
  title: string
  icon?: string
  subtitle?: string
  defaultOpen?: boolean
  children: ReactNode
}

export function CollapsibleSection({
  title,
  icon,
  subtitle,
  defaultOpen = false,
  children,
}: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="bg-surface-card rounded-xl border border-white/10 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors"
      >
        <svg
          className={clsx(
            'w-4 h-4 text-gray-500 shrink-0 transition-transform',
            open && 'rotate-90',
          )}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
        {icon && <span className="text-lg shrink-0">{icon}</span>}
        <span className="font-semibold text-gray-200">{title}</span>
        {subtitle && (
          <span className="text-xs text-gray-500 ml-auto shrink-0">{subtitle}</span>
        )}
      </button>
      {open && <div className="border-t border-white/10">{children}</div>}
    </div>
  )
}
