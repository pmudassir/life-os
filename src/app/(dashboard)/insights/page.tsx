import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { InsightsDashboard } from '@/components/insights/insights-dashboard'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Insights | Career Tracker',
  description: 'Analytics and insights about your progress',
}

interface LearningSession {
  startTime: Date
  duration: number
}

interface TimeEntry {
  startTime: Date
  duration: number | null
}

interface SkillData {
  id: string
  name: string
  category: string
  currentLevel: string
}

interface CheckpointData {
  id: string
  name: string
  checkpointDate: Date
  overallScore: number | null
  summary: string | null
}

async function getInsightsData(userId: string) {
  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)

  const [
    learningSessions,
    projectTimeEntries,
    completedGoals,
    activeGoals,
    publishedContent,
    skills,
    checkpoints,
  ] = await Promise.all([
    prisma.learningSession.findMany({
      where: { userId, startTime: { gte: ninetyDaysAgo } },
      select: { startTime: true, duration: true },
      orderBy: { startTime: 'asc' },
    }),
    prisma.timeEntry.findMany({
      where: { userId, startTime: { gte: ninetyDaysAgo } },
      select: { startTime: true, duration: true },
    }),
    prisma.goal.count({
      where: { userId, status: 'ACHIEVED' },
    }),
    prisma.goal.count({
      where: { userId, status: 'IN_PROGRESS' },
    }),
    prisma.contentPiece.count({
      where: { userId, status: 'PUBLISHED' },
    }),
    prisma.skill.findMany({
      where: { userId },
      orderBy: { currentLevel: 'desc' },
      take: 10,
      select: { id: true, name: true, category: true, currentLevel: true },
    }),
    prisma.checkpoint.findMany({
      where: { userId },
      orderBy: { checkpointDate: 'asc' },
      select: { id: true, name: true, checkpointDate: true, overallScore: true, summary: true },
    }),
  ])

  // Calculate learning time by week
  const typedSessions = learningSessions as LearningSession[]
  const learningByWeek = typedSessions.reduce((acc: Record<string, number>, session: LearningSession) => {
    const weekStart = getWeekStart(new Date(session.startTime))
    const key = weekStart.toISOString().split('T')[0]
    acc[key] = (acc[key] || 0) + session.duration
    return acc
  }, {} as Record<string, number>)

  // Calculate project time by week
  const typedEntries = projectTimeEntries as TimeEntry[]
  const projectTimeByWeek = typedEntries.reduce((acc: Record<string, number>, entry: TimeEntry) => {
    const weekStart = getWeekStart(new Date(entry.startTime))
    const key = weekStart.toISOString().split('T')[0]
    acc[key] = (acc[key] || 0) + (entry.duration || 0)
    return acc
  }, {} as Record<string, number>)

  // Weekly totals
  const totalLearningTime = typedSessions.reduce((acc: number, s: LearningSession) => acc + s.duration, 0)
  const totalProjectTime = typedEntries.reduce((acc: number, e: TimeEntry) => acc + (e.duration || 0), 0)

  // Calculate streaks
  const learningStreak = calculateStreak(typedSessions.map((s: LearningSession) => new Date(s.startTime)))

  return {
    overview: {
      totalLearningHours: Math.round(totalLearningTime / 60),
      totalProjectHours: Math.round(totalProjectTime / 60),
      completedGoals,
      activeGoals,
      publishedContent,
      learningStreak,
    },
    charts: {
      learningByWeek,
      projectTimeByWeek,
    },
    skills: skills as SkillData[],
    checkpoints: checkpoints as CheckpointData[],
  }
}

function getWeekStart(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  d.setDate(d.getDate() - day)
  d.setHours(0, 0, 0, 0)
  return d
}

function calculateStreak(dates: Date[]): number {
  if (dates.length === 0) return 0

  const uniqueDays = new Set(dates.map((d) => d.toISOString().split('T')[0]))
  const sortedDays = Array.from(uniqueDays).sort().reverse()

  let streak = 0
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (let i = 0; i < 365; i++) {
    const checkDate = new Date(today)
    checkDate.setDate(today.getDate() - i)
    const dateStr = checkDate.toISOString().split('T')[0]

    if (sortedDays.includes(dateStr)) {
      streak++
    } else if (i > 0) {
      break
    }
  }

  return streak
}

export default async function InsightsPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/')
  }

  const data = await getInsightsData(session.user.id)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Insights</h1>
        <p className="text-muted-foreground mt-1">
          Track your progress and identify areas for improvement
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard
          label="Learning"
          value={`${data.overview.totalLearningHours}h`}
          description="Total hours"
        />
        <StatCard
          label="Projects"
          value={`${data.overview.totalProjectHours}h`}
          description="Total hours"
        />
        <StatCard
          label="Goals Done"
          value={data.overview.completedGoals}
          description="Completed"
        />
        <StatCard
          label="Active Goals"
          value={data.overview.activeGoals}
          description="In progress"
        />
        <StatCard
          label="Content"
          value={data.overview.publishedContent}
          description="Published"
        />
        <StatCard
          label="Streak"
          value={`${data.overview.learningStreak}d`}
          description="Learning"
        />
      </div>

      {/* Main Dashboard */}
      <InsightsDashboard data={data} />
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
    <div className="bg-card border rounded-2xl p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  )
}
