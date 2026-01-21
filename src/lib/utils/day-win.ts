import { DailyRoutine, DsaType } from '@prisma/client'

type PrayerFields = Pick<DailyRoutine, 'fajrDone' | 'dhuhrDone' | 'asrDone' | 'maghribDone' | 'ishaDone'>
type OptionalFields = Pick<DailyRoutine, 'gymDone' | 'dsaType' | 'freelanceDone' | 'readingPages'>
type WorkFields = Pick<DailyRoutine, 'workDone' | 'instituteDone'>

/**
 * Check if all 5 daily prayers are completed
 */
export function allPrayersCompleted(routine: PrayerFields): boolean {
  return (
    routine.fajrDone &&
    routine.dhuhrDone &&
    routine.asrDone &&
    routine.maghribDone &&
    routine.ishaDone
  )
}

/**
 * Check if at least one optional activity is done (gym, DSA, freelance, or reading)
 */
export function hasOptionalActivity(routine: OptionalFields): boolean {
  return (
    routine.gymDone ||
    routine.dsaType !== DsaType.NONE ||
    routine.freelanceDone ||
    routine.readingPages > 0
  )
}

/**
 * Check if it's a weekday (Mon-Fri)
 */
export function isWeekday(date?: Date): boolean {
  const day = (date || new Date()).getDay()
  return day >= 1 && day <= 5
}

/**
 * Determines if a day qualifies as a "Day Win"
 * 
 * Rule: A "Day Win" = 
 *   - All 5 prayers done AND
 *   - Work + Institute done (on weekdays only) AND
 *   - At least 1 optional: gym, DSA, freelance, or reading
 */
export function isDayWin(
  routine: PrayerFields & OptionalFields & WorkFields,
  date?: Date
): boolean {
  const weekday = isWeekday(date)
  
  // Must have all prayers
  if (!allPrayersCompleted(routine)) return false
  
  // Must have at least one optional activity
  if (!hasOptionalActivity(routine)) return false
  
  // On weekdays, must have work AND institute
  if (weekday && (!routine.workDone || !routine.instituteDone)) return false
  
  return true
}

/**
 * Type guard for checking if a routine exists and is a Day Win
 */
export function hasDayWin(
  routine: (PrayerFields & OptionalFields & WorkFields) | null | undefined,
  date?: Date
): boolean {
  if (!routine) return false
  return isDayWin(routine, date)
}
