'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ProjectCard } from './project-card'
import { TimeTracker } from './time-tracker'

interface ProjectData {
  id: string
  name: string
  type: string
  status: string
  goalsCount: number
  completedGoalsCount: number
  thisWeekHours: number
  goals: Array<{ id: string; status: string }>
  metrics: Array<{ id: string; recordedAt: Date }>
}

interface TimeEntryData {
  id: string
  description?: string
  startTime: Date
  duration: number
  category: string | null
}

interface ProjectsDashboardProps {
  data: {
    activeProjects: ProjectData[]
    completedProjects: Array<{
      id: string
      name: string
      type: string
      completedDate?: Date | null
      totalHoursLogged?: number
    }>
    totalHoursThisMonth: number
    timeByCategory: Record<string, number>
    recentTimeEntries: TimeEntryData[]
  }
}

export function ProjectsDashboard({ data }: ProjectsDashboardProps) {
  const [activeTab, setActiveTab] = useState('active')

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
      <TabsList className="grid w-full grid-cols-3 lg:w-[300px]">
        <TabsTrigger value="active">Active</TabsTrigger>
        <TabsTrigger value="time">Time</TabsTrigger>
        <TabsTrigger value="completed">Completed</TabsTrigger>
      </TabsList>

      <TabsContent value="active" className="space-y-6">
        {data.activeProjects.length === 0 ? (
          <EmptyState
            title="No active projects"
            description="Create a project to start tracking your work on job, business, freelance, or personal initiatives."
          />
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {data.activeProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="time" className="space-y-6">
        <TimeTracker 
          timeEntries={data.recentTimeEntries}
          timeByCategory={data.timeByCategory}
        />
      </TabsContent>

      <TabsContent value="completed" className="space-y-6">
        {data.completedProjects.length === 0 ? (
          <EmptyState
            title="No completed projects yet"
            description="Complete your first project to see it here."
          />
        ) : (
          <div className="grid gap-4">
            {data.completedProjects.map((project) => (
              <div
                key={project.id}
                className="flex items-center justify-between p-4 bg-muted rounded-xl"
              >
                <div>
                  <p className="font-medium">{project.name}</p>
                  <p className="text-sm text-muted-foreground">{project.type}</p>
                </div>
                <div className="text-right">
                  {project.completedDate && (
                    <p className="text-sm text-muted-foreground">
                      Completed {new Date(project.completedDate).toLocaleDateString()}
                    </p>
                  )}
                  <p className="text-sm font-medium">{project.totalHoursLogged}h total</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  )
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="text-center py-12 bg-muted rounded-2xl">
      <p className="font-medium">{title}</p>
      <p className="text-sm text-muted-foreground mt-1">{description}</p>
    </div>
  )
}
