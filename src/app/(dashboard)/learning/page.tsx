import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { LearningDashboard } from '@/components/learning/learning-dashboard'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Learning | Career Tracker',
  description: 'Track your learning progress, books, courses, and skills',
}

interface LearningSession {
  id: string
  startTime: Date
  duration: number
  resource?: { title: string; type: string }
}

interface LearningResource {
  id: string
  title: string
  type: string
  status: string
  currentPage: number
  totalPages: number | null
  currentChapter: number
  totalChapters: number | null
  isFocusResource: boolean
  sessions: LearningSession[]
}

interface Skill {
  id: string
  name: string
  category: string
  currentLevel: string
  order: number
  progress: Array<{ id: string; createdAt: Date; level?: string }>
}

async function getLearningData(userId: string) {
  const [activeResources, completedResources, recentSessions, skills] = await Promise.all([
    prisma.learningResource.findMany({
      where: { userId, status: 'IN_PROGRESS' },
      orderBy: [{ isFocusResource: 'desc' }, { updatedAt: 'desc' }],
      include: {
        sessions: {
          orderBy: { startTime: 'desc' },
          take: 5,
        },
      },
    }),
    prisma.learningResource.findMany({
      where: { userId, status: 'COMPLETED' },
      orderBy: { completedDate: 'desc' },
      take: 5,
    }),
    prisma.learningSession.findMany({
      where: { userId },
      orderBy: { startTime: 'desc' },
      take: 10,
      include: {
        resource: {
          select: { title: true, type: true },
        },
      },
    }),
    prisma.skill.findMany({
      where: { userId },
      orderBy: { order: 'asc' },
      include: {
        progress: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    }),
  ])

  // Calculate learning time (last 7 days and 30 days)
  const now = new Date()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const sessionsList = recentSessions as LearningSession[]
  const weeklyLearningTime = sessionsList
    .filter((s: LearningSession) => s.startTime >= sevenDaysAgo)
    .reduce((acc: number, s: LearningSession) => acc + s.duration, 0)

  const monthlyLearningTime = await prisma.learningSession.aggregate({
    where: {
      userId,
      startTime: { gte: thirtyDaysAgo },
    },
    _sum: { duration: true },
  })

  // Calculate progress for each resource
  const typedResources = activeResources as LearningResource[]
  const resourcesWithProgress = typedResources.map((resource: LearningResource) => {
    const totalTimeSpent = resource.sessions.reduce((acc: number, s: LearningSession) => acc + s.duration, 0)
    const progressPercentage = resource.totalPages
      ? Math.round((resource.currentPage / resource.totalPages) * 100)
      : resource.totalChapters
      ? Math.round((resource.currentChapter / resource.totalChapters) * 100)
      : 0

    return {
      ...resource,
      progressPercentage,
      sessionsCount: resource.sessions.length,
      totalTimeSpent,
    }
  })

  const typedSkills = skills as unknown as Skill[]
  const skillsWithProgress = typedSkills.map((skill: Skill) => ({
    ...skill,
    latestProgress: skill.progress[0] || null,
    progressHistory: skill.progress,
  }))

  return {
    activeResources: resourcesWithProgress,
    completedResources,
    recentSessions,
    skills: skillsWithProgress,
    weeklyLearningTime,
    monthlyLearningTime: monthlyLearningTime._sum.duration || 0,
  }
}

export default async function LearningPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/')
  }

  const data = await getLearningData(session.user.id)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Learning</h1>
          <p className="text-muted-foreground mt-1">
            Track your progress across books, courses, and skills
          </p>
        </div>
        <Button asChild>
          <Link href="/learning/new">
            <Plus className="w-4 h-4 mr-2" />
            Add Resource
          </Link>
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          label="Active Resources"
          value={data.activeResources.length}
          description="Currently learning"
        />
        <StatCard
          label="This Week"
          value={`${Math.round(data.weeklyLearningTime / 60)}h`}
          description="Learning time"
        />
        <StatCard
          label="This Month"
          value={`${Math.round(data.monthlyLearningTime / 60)}h`}
          description="Learning time"
        />
        <StatCard
          label="Skills Tracked"
          value={data.skills.length}
          description="Across categories"
        />
      </div>

      {/* Main Dashboard */}
      <LearningDashboard data={data} />
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
