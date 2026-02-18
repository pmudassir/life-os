import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { GoalsDashboard } from '@/components/goals/goals-dashboard'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Goals | Career Tracker',
  description: 'Track your short-term, medium-term, and long-term goals',
}

async function getGoalsData(userId: string) {
  const now = new Date()
  const sixMonthsFromNow = new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000)
  const twelveMonthsFromNow = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000)

  const [goals, checkpoints] = await Promise.all([
    prisma.goal.findMany({
      where: { userId },
      orderBy: [{ targetDate: 'asc' }, { createdAt: 'desc' }],
    }),
    prisma.checkpoint.findMany({
      where: { userId },
      orderBy: { checkpointDate: 'asc' },
    }),
  ])

  // Calculate progress for each goal
  const goalsWithProgress = goals.map(goal => {
    const progressPercentage = goal.targetValue && goal.currentValue
      ? Math.round((goal.currentValue / goal.targetValue) * 100)
      : goal.status === 'ACHIEVED' ? 100 : 0

    return {
      ...goal,
      progressPercentage,
    }
  })

  // Group by timeframe
  const goalsByTimeframe = {
    WEEKLY: goalsWithProgress.filter(g => g.timeframe === 'WEEKLY'),
    MONTHLY: goalsWithProgress.filter(g => g.timeframe === 'MONTHLY'),
    SIX_MONTH: goalsWithProgress.filter(g => g.timeframe === 'SIX_MONTH'),
    TWELVE_MONTH: goalsWithProgress.filter(g => g.timeframe === 'TWELVE_MONTH'),
  }

  // Calculate checkpoint scores
  const checkpointsWithScore = checkpoints.map(checkpoint => {
    const criteria = checkpoint.criteria as Array<{ achieved: boolean }>
    const achievedCount = criteria.filter(c => c.achieved).length
    return {
      ...checkpoint,
      achievedCriteriaCount: achievedCount,
      totalCriteriaCount: criteria.length,
    }
  })

  return {
    activeGoals: goalsWithProgress.filter(g => g.status === 'NOT_STARTED' || g.status === 'IN_PROGRESS'),
    completedGoals: goalsWithProgress.filter(g => g.status === 'ACHIEVED' || g.status === 'PARTIALLY_ACHIEVED'),
    goalsByTimeframe,
    upcomingCheckpoints: checkpointsWithScore.filter(c => c.checkpointDate >= now),
    pastCheckpoints: checkpointsWithScore.filter(c => c.checkpointDate < now),
  }
}

export default async function GoalsPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/')
  }

  const data = await getGoalsData(session.user.id)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Goals</h1>
          <p className="text-muted-foreground mt-1">
            Track your progress toward 6-month and 12-month checkpoints
          </p>
        </div>
        <Button asChild>
          <Link href="/goals/new">
            <Plus className="w-4 h-4 mr-2" />
            New Goal
          </Link>
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          label="Active Goals"
          value={data.activeGoals.length}
          description="In progress"
        />
        <StatCard
          label="Completed"
          value={data.completedGoals.length}
          description="Achieved goals"
        />
        <StatCard
          label="6-Month Score"
          value={getCheckpointScore(data.upcomingCheckpoints, '6-Month')}
          description="Checkpoint progress"
        />
        <StatCard
          label="12-Month Score"
          value={getCheckpointScore(data.upcomingCheckpoints, '12-Month')}
          description="Checkpoint progress"
        />
      </div>

      {/* Main Dashboard */}
      <GoalsDashboard data={data} />
    </div>
  )
}

function StatCard({
  label,
  value,
  description,
}: {
  label: string
  value: string | number
  description: string
}) {
  return (
    <div className="bg-card border rounded-2xl p-6">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-3xl font-bold mt-1">{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{description}</p>
    </div>
  )
}

function getCheckpointScore(checkpoints: Array<{ name: string; achievedCriteriaCount: number; totalCriteriaCount: number }>, type: string): string {
  const checkpoint = checkpoints.find(c => c.name.includes(type))
  if (!checkpoint || checkpoint.totalCriteriaCount === 0) return '-'
  return `${checkpoint.achievedCriteriaCount}/${checkpoint.totalCriteriaCount}`
}
