import {
  format,
  startOfWeek,
  endOfWeek,
  startOfDay,
  eachDayOfInterval,
  isToday,
  isSameDay,
  parseISO,
} from 'date-fns'

/**
 * Get today's date at midnight (for consistent date comparisons)
 */
export function getToday(): Date {
  return startOfDay(new Date())
}

/**
 * Format date for display: "Sunday, Jan 19"
 */
export function formatDisplayDate(date: Date): string {
  return format(date, 'EEEE, MMM d')
}

/**
 * Format date for database storage: "2026-01-19"
 */
export function formatDbDate(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

/**
 * Parse a date string from the database
 */
export function parseDbDate(dateString: string): Date {
  return parseISO(dateString)
}

/**
 * Get the start of the current week (Monday)
 */
export function getWeekStart(date: Date = new Date()): Date {
  return startOfWeek(date, { weekStartsOn: 1 }) // Monday
}

/**
 * Get the end of the current week (Sunday)
 */
export function getWeekEnd(date: Date = new Date()): Date {
  return endOfWeek(date, { weekStartsOn: 1 }) // Sunday
}

/**
 * Get all days in the current week
 */
export function getWeekDays(date: Date = new Date()): Date[] {
  return eachDayOfInterval({
    start: getWeekStart(date),
    end: getWeekEnd(date),
  })
}

/**
 * Format week range for display: "Jan 13 - Jan 19"
 */
export function formatWeekRange(date: Date = new Date()): string {
  const start = getWeekStart(date)
  const end = getWeekEnd(date)
  return `${format(start, 'MMM d')} - ${format(end, 'MMM d')}`
}

/**
 * Check if a date is today
 */
export { isToday, isSameDay }
