import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ScheduleDashboard } from '@/components/schedule/schedule-dashboard'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Schedule | Career Tracker',
  description: 'Plan and manage your weekly schedule',
}

interface TimeBlock {
  id: string
  date: Date
  startTime: string
  endTime: string
  duration: number
  title: string
  category: string
  color: string
  completed: boolean
  projectId: string | null
  resourceId: string | null
}

async function getScheduleData(userId: string) {
  const now = new Date()
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - now.getDay())
  startOfWeek.setHours(0, 0, 0, 0)
  
  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 7)

  // Get time blocks and scheduled items
  const [timeBlocks, weeklyGoals] = await Promise.all([
    prisma.timeBlock.findMany({
      where: { userId },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    }),
    prisma.goal.findMany({
      where: {
        userId,
        status: 'IN_PROGRESS',
      },
      take: 5,
    }),
  ])

  // Calculate time allocation
  const typedBlocks = timeBlocks as TimeBlock[]
  const timeAllocation = typedBlocks.reduce((acc: Record<string, number>, block: TimeBlock) => {
    const duration = block.duration / 60 // convert to hours
    acc[block.category] = (acc[block.category] || 0) + duration
    return acc
  }, {} as Record<string, number>)

  return {
    timeBlocks: typedBlocks,
    weeklyGoals,
    timeAllocation,
    totalScheduledHours: Object.values(timeAllocation).reduce((a: number, b: number) => a + b, 0),
  }
}

function calculateDuration(start: string, end: string): number {
  const [startHour, startMin] = start.split(':').map(Number)
  const [endHour, endMin] = end.split(':').map(Number)
  return (endHour * 60 + endMin - startHour * 60 - startMin) / 60
}

export default async function SchedulePage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/')
  }

  const data = await getScheduleData(session.user.id)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Schedule</h1>
          <p className="text-muted-foreground mt-1">
            Plan your week for maximum productivity
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Block
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Scheduled"
          value={`${Math.round(data.totalScheduledHours)}h`}
          description="This week"
        />
        <StatCard
          label="Deep Work"
          value={`${Math.round(data.timeAllocation['deep_work'] || 0)}h`}
          description="Focus time"
        />
        <StatCard
          label="Learning"
          value={`${Math.round(data.timeAllocation['learning'] || 0)}h`}
          description="Study blocks"
        />
        <StatCard
          label="Active Goals"
          value={data.weeklyGoals.length}
          description="In progress"
        />
      </div>

      {/* Main Dashboard */}
      <ScheduleDashboard data={data} />
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
