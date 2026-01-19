import { DailyRoutine, DsaType } from '@prisma/client'

/**
 * Determines if a day qualifies as a "Day Win"
 * 
 * Rule: A "Day Win" = allPrayersDone AND gymDone AND dsaType !== NONE
 * 
 * This is derived, not stored, ensuring single source of truth.
 */
export function isDayWin(
  routine: Pick<DailyRoutine, 'allPrayersDone' | 'gymDone' | 'dsaType'>
): boolean {
  return (
    routine.allPrayersDone === true &&
    routine.gymDone === true &&
    routine.dsaType !== DsaType.NONE
  )
}

/**
 * Type guard for checking if a routine exists and is a Day Win
 */
export function hasDayWin(
  routine: Pick<DailyRoutine, 'allPrayersDone' | 'gymDone' | 'dsaType'> | null | undefined
): boolean {
  if (!routine) return false
  return isDayWin(routine)
}
