import { Header } from '@/components/layout/header'
import { getWeekRoutines, getRecentRoutines } from '@/actions/routine'
import { getWeekStart, getWeekEnd, getWeekDays, formatWeekRange } from '@/lib/utils/date'
import { calculateStreak } from '@/lib/utils/streak'
import { isToday, isSameDay, isFuture } from 'date-fns'
import { WeekClient } from './week-client'

// Prevent static prerendering - this page needs database access
export const dynamic = 'force-dynamic'

export default async function WeekPage() {
  const weekStart = getWeekStart()
  const weekEnd = getWeekEnd()
  const weekDays = getWeekDays()

  const [weekRoutines, recentRoutines] = await Promise.all([
    getWeekRoutines(weekStart, weekEnd),
    getRecentRoutines(14),
  ])

  const streak = calculateStreak(recentRoutines)
  const weekRange = formatWeekRange()

  // Map routines to days
  const daysData = weekDays.map((date) => {
    const routine = weekRoutines.find((r) => isSameDay(new Date(r.date), date))
    return {
      date,
      routine: routine ?? null,
      isToday: isToday(date),
      isFuture: isFuture(date) && !isToday(date),
    }
  })

  // Calculate stats
  const wins = daysData.filter((d) => d.routine?.dayWin).length
  const misses = daysData.filter((d) => d.routine && !d.routine.dayWin && !d.isFuture).length
  const pending = daysData.filter((d) => !d.routine && !d.isFuture && !d.isToday).length

  return (
    <div className="space-y-6">
      <Header
        title="Weekly Rhythm"
        subtitle={weekRange}
      />

      <WeekClient 
        days={daysData} 
        stats={{ wins, misses, pending }} 
        streak={streak} 
      />
    </div>
  )
}
