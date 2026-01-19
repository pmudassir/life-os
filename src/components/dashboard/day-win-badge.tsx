import * as React from 'react'
import { cn } from '@/lib/utils'

interface DayWinBadgeProps {
  isWin: boolean | null
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

/**
 * Day Win badge - shows win/pending status
 * Visual, not judgmental - just shows what it is
 */
export function DayWinBadge({ isWin, size = 'md', className }: DayWinBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  }

  if (isWin === null) {
    return null
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-medium rounded-full',
        'transition-all duration-300',
        isWin
          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
          : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
        sizeClasses[size],
        className
      )}
    >
      {isWin ? (
        <>
          <span>🔥</span>
          <span>Day Win</span>
        </>
      ) : (
        <>
          <span>⏳</span>
          <span>In Progress</span>
        </>
      )}
    </span>
  )
}
