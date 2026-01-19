import * as React from 'react'
import { cn } from '@/lib/utils'
import { format, isToday as checkIsToday, isFuture } from 'date-fns'
import type { DailyRoutineWithDayWin } from '@/types'

interface DayCardProps {
  date: Date
  routine: DailyRoutineWithDayWin | null
  isToday?: boolean
  compact?: boolean
  className?: string
}

/**
 * Day card for the week view
 * Shows day status at a glance
 */
export function DayCard({
  date,
  routine,
  isToday = false,
  compact = false,
  className,
}: DayCardProps) {
  const isFutureDay = isFuture(date) && !checkIsToday(date)
  const dayWin = routine?.dayWin ?? null

  // Determine status
  const status: 'win' | 'miss' | 'pending' | 'future' = (() => {
    if (isFutureDay) return 'future'
    if (!routine) return 'pending'
    if (dayWin) return 'win'
    return 'miss'
  })()

  const statusConfig = {
    win: {
      icon: '🔥',
      bg: 'bg-emerald-100 dark:bg-emerald-900/30',
      border: 'border-emerald-300 dark:border-emerald-700',
      text: 'text-emerald-700 dark:text-emerald-300',
    },
    miss: {
      icon: '❌',
      bg: 'bg-red-50 dark:bg-red-900/20',
      border: 'border-red-200 dark:border-red-800',
      text: 'text-red-600 dark:text-red-400',
    },
    pending: {
      icon: '⏳',
      bg: 'bg-amber-50 dark:bg-amber-900/20',
      border: 'border-amber-200 dark:border-amber-700',
      text: 'text-amber-600 dark:text-amber-400',
    },
    future: {
      icon: '○',
      bg: 'bg-slate-50 dark:bg-slate-800/50',
      border: 'border-slate-200 dark:border-slate-700',
      text: 'text-slate-400 dark:text-slate-500',
    },
  }

  const config = statusConfig[status]

  if (compact) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center p-2 rounded-lg border',
          config.bg,
          config.border,
          isToday && 'ring-2 ring-blue-500',
          className
        )}
      >
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
          {format(date, 'EEE')}
        </span>
        <span className="text-lg mt-1">{config.icon}</span>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'flex flex-col p-4 rounded-xl border-2 transition-all duration-200',
        config.bg,
        config.border,
        isToday && 'ring-2 ring-blue-500 ring-offset-2',
        !isFutureDay && 'cursor-pointer hover:scale-[1.02]',
        className
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
          {format(date, 'EEE')}
        </span>
        <span className="text-2xl">{config.icon}</span>
      </div>
      <span className={cn('text-lg font-semibold', config.text)}>
        {format(date, 'd')}
      </span>
      {isToday && (
        <span className="text-xs text-blue-600 dark:text-blue-400 font-medium mt-1">
          Today
        </span>
      )}
    </div>
  )
}
