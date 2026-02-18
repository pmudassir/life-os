import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ProjectsDashboard } from '@/components/projects/projects-dashboard'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Projects | Career Tracker',
  description: 'Manage your job, business, freelance, and personal projects',
}

interface TimeEntry {
  id: string
  projectId: string | null
  startTime: Date
  duration: number
  category: string | null
}

interface ProjectGoal {
  id: string
  status: string
  targetDate: Date | null
}

interface Project {
  id: string
  name: string
  type: string
  status: string
  goals: ProjectGoal[]
  metrics: Array<{ id: string; recordedAt: Date }>
}

async function getProjectsData(userId: string) {
  const now = new Date()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const [activeProjects, completedProjects, recentTimeEntries] = await Promise.all([
    prisma.project.findMany({
      where: { userId, status: { in: ['ACTIVE', 'PLANNING'] } },
      orderBy: { updatedAt: 'desc' },
      include: {
        goals: {
          where: { status: { not: 'completed' } },
          orderBy: { targetDate: 'asc' },
        },
        metrics: {
          orderBy: { recordedAt: 'desc' },
          take: 5,
        },
      },
    }),
    prisma.project.findMany({
      where: { userId, status: 'COMPLETED' },
      orderBy: { completedDate: 'desc' },
      take: 5,
    }),
    prisma.timeEntry.findMany({
      where: { userId },
      orderBy: { startTime: 'desc' },
      take: 20,
    }),
  ])

  // Calculate stats for each active project
  const typedProjects = activeProjects as Project[]
  const typedEntries = recentTimeEntries as TimeEntry[]
  const projectsWithStats = typedProjects.map((project: Project) => {
    const thisWeekHours = typedEntries
      .filter((e: TimeEntry) => 
        e.projectId === project.id && 
        e.startTime >= sevenDaysAgo
      )
      .reduce((acc: number, e: TimeEntry) => acc + e.duration, 0) / 60

    return {
      ...project,
      goalsCount: project.goals.length,
      completedGoalsCount: project.goals.filter((g: ProjectGoal) => g.status === 'completed').length,
      thisWeekHours: Math.round(thisWeekHours * 10) / 10,
    }
  })

  // Calculate time distribution
  const timeByCategory = typedEntries.reduce((acc: Record<string, number>, entry: TimeEntry) => {
    const category = entry.category || 'uncategorized'
    acc[category] = (acc[category] || 0) + entry.duration
    return acc
  }, {} as Record<string, number>)

  // Total hours this month
  const totalHoursThisMonth = await prisma.timeEntry.aggregate({
    where: {
      userId,
      startTime: { gte: thirtyDaysAgo },
    },
    _sum: { duration: true },
  })

  return {
    activeProjects: projectsWithStats,
    completedProjects,
    totalHoursThisMonth: (totalHoursThisMonth._sum.duration || 0) / 60,
    timeByCategory,
    recentTimeEntries,
  }
}

export default async function ProjectsPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/')
  }

  const data = await getProjectsData(session.user.id)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground mt-1">
            Track your job, business, freelance, and personal projects
          </p>
        </div>
        <Button asChild>
          <Link href="/projects/new">
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Link>
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          label="Active Projects"
          value={data.activeProjects.length}
          description="Currently working on"
        />
        <StatCard
          label="This Month"
          value={`${Math.round(data.totalHoursThisMonth)}h`}
          description="Hours logged"
        />
        <StatCard
          label="Completed"
          value={data.completedProjects.length}
          description="Finished projects"
        />
        <StatCard
          label="Active Goals"
          value={data.activeProjects.reduce((acc, p) => acc + p.goalsCount, 0)}
          description="Across all projects"
        />
      </div>

      {/* Main Dashboard */}
      <ProjectsDashboard data={data} />
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
