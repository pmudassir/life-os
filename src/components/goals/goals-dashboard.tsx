'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { GoalCard } from './goal-card'
import { CheckpointTracker } from './checkpoint-tracker'
import { GoalWithProgress, CheckpointWithScore, GoalTimeframe } from '@/types'

interface GoalsDashboardProps {
  data: {
    activeGoals: GoalWithProgress[]
    completedGoals: GoalWithProgress[]
    goalsByTimeframe: Record<GoalTimeframe, GoalWithProgress[]>
    upcomingCheckpoints: CheckpointWithScore[]
    pastCheckpoints: CheckpointWithScore[]
  }
}

export function GoalsDashboard({ data }: GoalsDashboardProps) {
  const [activeTab, setActiveTab] = useState('active')

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
      <TabsList className="grid w-full grid-cols-4 lg:w-[400px]">
        <TabsTrigger value="active">Active</TabsTrigger>
        <TabsTrigger value="by-timeframe">By Timeframe</TabsTrigger>
        <TabsTrigger value="checkpoints">Checkpoints</TabsTrigger>
        <TabsTrigger value="completed">Completed</TabsTrigger>
      </TabsList>

      <TabsContent value="active" className="space-y-6">
        {data.activeGoals.length === 0 ? (
          <EmptyState
            title="No active goals"
            description="Set goals for your 6-month and 12-month checkpoints to track your progress."
          />
        ) : (
          <div className="grid gap-4">
            {data.activeGoals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="by-timeframe" className="space-y-6">
        <div className="space-y-6">
          <TimeframeSection 
            title="Weekly Goals" 
            goals={data.goalsByTimeframe.WEEKLY} 
          />
          <TimeframeSection 
            title="Monthly Goals" 
            goals={data.goalsByTimeframe.MONTHLY} 
          />
          <TimeframeSection 
            title="6-Month Goals" 
            goals={data.goalsByTimeframe.SIX_MONTH} 
          />
          <TimeframeSection 
            title="12-Month Goals" 
            goals={data.goalsByTimeframe.TWELVE_MONTH} 
          />
        </div>
      </TabsContent>

      <TabsContent value="checkpoints" className="space-y-6">
        <CheckpointTracker 
          upcoming={data.upcomingCheckpoints}
          past={data.pastCheckpoints}
        />
      </TabsContent>

      <TabsContent value="completed" className="space-y-6">
        {data.completedGoals.length === 0 ? (
          <EmptyState
            title="No completed goals yet"
            description="Achieve your first goal to see it here."
          />
        ) : (
          <div className="grid gap-4">
            {data.completedGoals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  )
}

function TimeframeSection({ 
  title, 
  goals 
}: { 
  title: string
  goals: GoalWithProgress[]
}) {
  if (goals.length === 0) return null

  return (
    <div>
      <h3 className="text-lg font-medium mb-3">{title}</h3>
      <div className="grid gap-3">
        {goals.map((goal) => (
          <GoalCard key={goal.id} goal={goal} compact />
        ))}
      </div>
    </div>
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
