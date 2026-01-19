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
      <div className={cn('text-slate-400 dark:text-slate-500 text-sm', className)}>
        Start your streak today
      </div>
    )
  }

  const display = getStreakDisplay(streak)

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 px-4 py-2 rounded-lg',
        'bg-amber-50 dark:bg-amber-900/20',
        className
      )}
    >
      <span className="text-lg">{display}</span>
      <span className="font-semibold text-amber-700 dark:text-amber-300">
        {streak} day{streak !== 1 ? 's' : ''} streak
      </span>
    </div>
  )
}
