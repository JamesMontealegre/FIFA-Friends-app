interface TrophyBadgeProps {
  count: number
}

export function TrophyBadge({ count }: TrophyBadgeProps) {
  if (count === 0) return <span className="text-gray-300">-</span>

  return (
    <span className="inline-flex items-center gap-0.5 text-amber-500 font-medium">
      <span>🏆</span>
      {count > 1 && <span className="text-xs">x{count}</span>}
    </span>
  )
}
