import { TodayClient } from './today-client'
import { getOrCreateTodayRoutine, getRecentRoutines } from '@/actions/routine'
import { getTodayPlanner } from '@/actions/planner'
import { calculateStreak } from '@/lib/utils/streak'
import { getToday } from '@/lib/utils/date'

// Prevent static prerendering - this page needs database access
export const dynamic = 'force-dynamic'

export default async function TodayPage() {
  // Fetch all data in parallel
  const [routine, planner, recentRoutines] = await Promise.all([
    getOrCreateTodayRoutine(),
    getTodayPlanner(),
    getRecentRoutines(14),
  ])

  const streak = calculateStreak(recentRoutines)
  const currentDate = getToday()

  return (
    <TodayClient
      initialRoutine={routine}
      initialPlanner={planner}
      initialStreak={streak}
      currentDate={currentDate}
    />
  )
}
