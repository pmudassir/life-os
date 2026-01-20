import { Header } from '@/components/layout/header'
import { DayCard } from '@/components/dashboard/day-card'
import { StreakIndicator } from '@/components/dashboard/streak-indicator'
import { Card, CardContent } from '@/components/ui/card'
import { getWeekRoutines, getRecentRoutines } from '@/actions/routine'
import { getWeekStart, getWeekEnd, getWeekDays, formatWeekRange } from '@/lib/utils/date'
import { calculateStreak } from '@/lib/utils/streak'
import { isToday, isSameDay, isFuture } from 'date-fns'

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
        title="This Week"
        subtitle={weekRange}
      />

      <StreakIndicator streak={streak} />

      {/* Week Grid */}
      <div className="grid grid-cols-7 gap-2">
        {daysData.map(({ date, routine, isToday: today }) => (
          <DayCard
            key={date.toISOString()}
            date={date}
            routine={routine}
            isToday={today}
            compact
          />
        ))}
      </div>

      {/* Week Stats */}
      <Card>
        <CardContent className="py-6">
          <div className="flex justify-around text-center">
            <div>
              <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                {wins}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Wins</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-red-500 dark:text-red-400">
                {misses}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Misses</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-amber-500 dark:text-amber-400">
                {pending + (daysData.find(d => d.isToday) ? 1 : 0)}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Pending</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Day Details */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-300">
          Daily Breakdown
        </h2>
        {daysData.map(({ date, routine, isToday: today, isFuture: future }) => (
          <DayCard
            key={date.toISOString()}
            date={date}
            routine={routine}
            isToday={today}
          />
        ))}
      </div>
    </div>
  )
}
