import { TodayClient } from './(dashboard)/today-client'
import { getDayHabits } from '@/actions/habit'
import { getRecentRoutines } from '@/actions/routine'
import { calculateStreak } from '@/lib/utils/streak'
import { getToday } from '@/lib/utils/date'
import { MobileNav } from '@/components/layout/mobile-nav'

// Prevent static prerendering - this page needs database access
export const dynamic = 'force-dynamic'

export default async function HomePage() {
  // Fetch all data in parallel
  const currentDate = getToday()
  const [habits, recentRoutines] = await Promise.all([
    getDayHabits(currentDate),
    getRecentRoutines(14),
  ])

  const streak = calculateStreak(recentRoutines)

  return (
    <div className="min-h-screen bg-kawkab-off-white dark:bg-slate-950">
      <main className="pb-20 px-4 pt-6 max-w-2xl mx-auto h-screen">
        <TodayClient
          initialHabits={habits}
          initialStreak={streak}
          currentDate={currentDate}
        />
      </main>
      <MobileNav />
    </div>
  )
}
