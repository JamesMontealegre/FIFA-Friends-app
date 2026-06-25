import clsx from 'clsx'

export function Spinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  return (
    <div
      className={clsx(
        'animate-spin rounded-full border-2 border-neon border-t-transparent',
        size === 'sm' && 'h-4 w-4',
        size === 'md' && 'h-8 w-8',
        size === 'lg' && 'h-12 w-12',
      )}
    />
  )
}
