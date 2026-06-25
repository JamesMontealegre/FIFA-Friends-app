import clsx from 'clsx'
import { Spinner } from './Spinner'
import type { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={clsx(
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface disabled:opacity-50 disabled:cursor-not-allowed',
        variant === 'primary' && 'bg-neon text-black hover:bg-neon-dark focus:ring-neon shadow-lg shadow-neon/25',
        variant === 'secondary' && 'bg-white/10 text-gray-200 hover:bg-white/20 focus:ring-white/30',
        variant === 'danger' && 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
        variant === 'ghost' && 'text-gray-400 hover:bg-white/10 hover:text-gray-200 focus:ring-white/20',
        size === 'sm' && 'px-3 py-1.5 text-sm',
        size === 'md' && 'px-4 py-2 text-sm',
        size === 'lg' && 'px-6 py-3 text-base',
        className,
      )}
      {...props}
    >
      {loading && <Spinner size="sm" />}
      {children}
    </button>
  )
}
