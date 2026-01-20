import * as React from 'react'
import { cn } from '@/lib/utils'
import { getStreakDisplay } from '@/lib/utils/streak'

interface StreakIndicatorProps {
  streak: number
  className?: string
}

/**
 * Streak indicator - shows consecutive day wins
 * Visual, trust-based - no shame on zero
 */
export function StreakIndicator({ streak, className }: StreakIndicatorProps) {
  if (streak === 0) {
    return (
      <div className={cn('text-muted-foreground text-sm', className)}>
        Start your streak today
      </div>
    )
  }

  const display = getStreakDisplay(streak)

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 px-4 py-2 rounded-lg',
        'bg-amber-500/10 border border-amber-500/20',
        className
      )}
    >
      <span className="text-lg">{display}</span>
      <span className="font-semibold text-amber-700 dark:text-amber-400">
        {streak} day{streak !== 1 ? 's' : ''} streak
      </span>
    </div>
  )
}
