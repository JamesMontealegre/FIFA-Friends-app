import type { ReactNode } from 'react'

interface PageLayoutProps {
  title?: string
  children: ReactNode
  actions?: ReactNode
}

export function PageLayout({ title, children, actions }: PageLayoutProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {(title || actions) && (
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 mb-6">
          {title && (
            <h1 className="text-2xl font-bold text-gray-100 min-w-0 break-words">{title}</h1>
          )}
          {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  )
}
