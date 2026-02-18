import { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'

type PageProps = {
  params: Promise<{ id: string }>
}

export const metadata: Metadata = {
  title: 'Project Details | Career Tracker',
  description: 'View project goals, metrics, and recent work logs',
}

export default async function ProjectDetailsPage({ params }: PageProps) {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/')
  }

  const { id } = await params
  const project = await prisma.project.findFirst({
    where: {
      id,
      userId: session.user.id,
    },
    include: {
      goals: {
        orderBy: { targetDate: 'asc' },
        take: 10,
      },
      metrics: {
        orderBy: { recordedAt: 'desc' },
        take: 10,
      },
      timeEntries: {
        orderBy: { startTime: 'desc' },
        take: 10,
      },
    },
  })

  if (!project) {
    notFound()
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">{project.name}</h1>
          <p className="text-muted-foreground mt-1">
            {project.type} • {project.status.replace('_', ' ')}
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/projects">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Link>
        </Button>
      </div>

      {project.description && (
        <div className="bg-card border rounded-2xl p-6">
          <h2 className="font-semibold mb-2">Description</h2>
          <p className="text-muted-foreground">{project.description}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Hours Logged" value={`${Math.round(project.totalHoursLogged)}h`} />
        <StatCard label="Goals" value={project.goals.length} />
        <StatCard label="Metrics" value={project.metrics.length} />
      </div>

      <section className="bg-card border rounded-2xl p-6">
        <h2 className="font-semibold mb-4">Goals</h2>
        {project.goals.length === 0 ? (
          <p className="text-sm text-muted-foreground">No goals added yet.</p>
        ) : (
          <div className="space-y-3">
            {project.goals.map((goal) => (
              <div key={goal.id} className="border rounded-xl p-3">
                <p className="font-medium">{goal.title}</p>
                <p className="text-sm text-muted-foreground">{goal.status}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="bg-card border rounded-2xl p-6">
        <h2 className="font-semibold mb-4">Recent Time Entries</h2>
        {project.timeEntries.length === 0 ? (
          <p className="text-sm text-muted-foreground">No time entries logged yet.</p>
        ) : (
          <div className="space-y-3">
            {project.timeEntries.map((entry) => (
              <div key={entry.id} className="border rounded-xl p-3">
                <p className="font-medium">{entry.description}</p>
                <p className="text-sm text-muted-foreground">
                  {Math.round(entry.duration / 60)}h • {new Date(entry.startTime).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-card border rounded-2xl p-6">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-3xl font-bold mt-1">{value}</p>
    </div>
  )
}
