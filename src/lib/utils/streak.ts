import { DailyRoutine } from '@prisma/client'
import { isDayWin } from './day-win'
import { differenceInCalendarDays, subDays, startOfDay } from 'date-fns'

/**
 * Calculates the current streak of consecutive "Day Win" days.
 * 
 * Streak Logic:
 * - Counts consecutive days where isDayWin() === true
 * - Starts from today and goes backwards
 * - Breaks on any gap in dates or non-win day
 * - Returns 0 if no current streak
 * 
 * Note: Streaks are visual, not fragile counters. A missed day breaks
 * the streak but doesn't delete history.
 */
export function calculateStreak(
  routines: Pick<DailyRoutine, 'date' | 'allPrayersDone' | 'gymDone' | 'dsaType'>[]
): number {
  if (!routines.length) return 0

  // Sort by date descending (most recent first)
  const sorted = [...routines].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  let streak = 0
  let expectedDate = startOfDay(new Date())

  for (const routine of sorted) {
    const routineDate = startOfDay(new Date(routine.date))
    const daysDiff = differenceInCalendarDays(expectedDate, routineDate)

    // If there's a gap of more than 1 day, streak is broken
    if (daysDiff > 1) break

    // If this day isn't a win, streak is broken
    if (!isDayWin(routine)) break

    streak++
    expectedDate = subDays(expectedDate, 1)
  }

  return streak
}

/**
 * Get streak display with fire emojis
 * Returns "" for 0, "🔥" for 1, "🔥🔥" for 2, etc.
 */
export function getStreakDisplay(streak: number): string {
  if (streak <= 0) return ''
  return '🔥'.repeat(Math.min(streak, 10)) // Cap at 10 fires for display
}
