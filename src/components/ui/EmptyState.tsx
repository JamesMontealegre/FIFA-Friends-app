interface EmptyStateProps {
  message: string
  icon?: string
}

export function EmptyState({ message, icon = '📋' }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-gray-500">
      <span className="text-5xl mb-4">{icon}</span>
      <p className="text-lg">{message}</p>
    </div>
  )
}
