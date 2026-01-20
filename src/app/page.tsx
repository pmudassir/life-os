import { TodayClient } from './(dashboard)/today-client'
import { getOrCreateTodayRoutine, getRecentRoutines } from '@/actions/routine'
import { getTodayPlanner } from '@/actions/planner'
import { calculateStreak } from '@/lib/utils/streak'
import { getToday } from '@/lib/utils/date'
import { MobileNav } from '@/components/layout/mobile-nav'

// Prevent static prerendering - this page needs database access
export const dynamic = 'force-dynamic'

export default async function HomePage() {
  // Fetch all data in parallel
  const [routine, planner, recentRoutines] = await Promise.all([
    getOrCreateTodayRoutine(),
    getTodayPlanner(),
    getRecentRoutines(14),
  ])

  const streak = calculateStreak(recentRoutines)
  const currentDate = getToday()

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <main className="pb-20 px-4 pt-6 max-w-2xl mx-auto">
        <TodayClient
          initialRoutine={routine}
          initialPlanner={planner}
          initialStreak={streak}
          currentDate={currentDate}
        />
      </main>
      <MobileNav />
    </div>
  )
}
