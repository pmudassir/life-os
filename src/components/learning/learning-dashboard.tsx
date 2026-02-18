'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BookTracker } from './book-tracker'
import { SkillTree } from './skill-tree'
import { RecentSessions } from './recent-sessions'

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
  sessions: Array<{ duration: number }>
  progressPercentage: number
  sessionsCount: number
  totalTimeSpent: number
}

interface LearningSession {
  id: string
  startTime: Date
  duration: number
  resource?: { title: string; type: string }
}

interface Skill {
  id: string
  name: string
  category: string
  currentLevel: string
  progress: Array<{ id: string; createdAt: Date }>
}

interface LearningDashboardProps {
  data: {
    activeResources: LearningResource[]
    completedResources: Array<{
      id: string
      title: string
      type: string
      completedDate: Date | null
    }>
    recentSessions: LearningSession[]
    skills: Skill[]
    weeklyLearningTime: number
    monthlyLearningTime: number
  }
}

export function LearningDashboard({ data }: LearningDashboardProps) {
  const [activeTab, setActiveTab] = useState('active')

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
      <TabsList className="grid w-full grid-cols-4 lg:w-[400px]">
        <TabsTrigger value="active">Active</TabsTrigger>
        <TabsTrigger value="completed">Completed</TabsTrigger>
        <TabsTrigger value="skills">Skills</TabsTrigger>
        <TabsTrigger value="history">History</TabsTrigger>
      </TabsList>

      <TabsContent value="active" className="space-y-6">
        {data.activeResources.length === 0 ? (
          <EmptyState
            title="No active learning resources"
            description="Add a book, course, or other resource to start tracking your learning."
          />
        ) : (
          <div className="grid gap-6">
            {data.activeResources.map((resource) => (
              <BookTracker key={resource.id} resource={resource} />
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="completed" className="space-y-6">
        {data.completedResources.length === 0 ? (
          <EmptyState
            title="No completed resources yet"
            description="Complete your first learning resource to see it here."
          />
        ) : (
          <div className="grid gap-4">
            {data.completedResources.map((resource) => (
              <div
                key={resource.id}
                className="flex items-center justify-between p-4 bg-muted rounded-xl"
              >
                <div>
                  <p className="font-medium">{resource.title}</p>
                  <p className="text-sm text-muted-foreground">{resource.type}</p>
                </div>
                {resource.completedDate && (
                  <p className="text-sm text-muted-foreground">
                    Completed {new Date(resource.completedDate).toLocaleDateString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="skills" className="space-y-6">
        <SkillTree skills={data.skills as any} />
      </TabsContent>

      <TabsContent value="history" className="space-y-6">
        <RecentSessions sessions={data.recentSessions} />
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
