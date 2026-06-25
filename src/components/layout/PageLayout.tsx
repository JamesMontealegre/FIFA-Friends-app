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
        <div className="flex items-center justify-between mb-6">
          {title && <h1 className="text-2xl font-bold text-gray-100">{title}</h1>}
          {actions && <div className="flex gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  )
}
