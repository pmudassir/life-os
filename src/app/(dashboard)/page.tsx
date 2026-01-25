import { TodayClient } from './today-client'
import { getDayHabits } from '@/actions/habit'
import { getRecentRoutines } from '@/actions/routine'
import { calculateStreak } from '@/lib/utils/streak'
import { getToday } from '@/lib/utils/date'

// Prevent static prerendering - this page needs database access
export const dynamic = 'force-dynamic'

export default async function TodayPage() {
  // Fetch all data in parallel
  const currentDate = getToday()
  const [habits, recentRoutines] = await Promise.all([
    getDayHabits(currentDate),
    getRecentRoutines(14),
  ])

  const streak = calculateStreak(recentRoutines)

  return (
    <TodayClient
      initialHabits={habits}
      initialStreak={streak}
      currentDate={currentDate}
    />
  )
}
