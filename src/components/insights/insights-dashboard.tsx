'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  TrendingUp,
  Target,
  BookOpen,
  Code,
  Calendar,
  Lightbulb,
  BarChart3,
  Sparkles,
  ChevronRight,
  Zap,
} from 'lucide-react'
import { AIInsightsPanel } from '@/components/ai/ai-insights-panel'

interface Skill {
  id: string
  name: string
  category: string
  currentLevel: string
}

interface Checkpoint {
  id: string
  name: string
  checkpointDate: Date
  overallScore: number | null
  summary: string | null
}

interface InsightsDashboardProps {
  data: {
    overview: {
      totalLearningHours: number
      totalProjectHours: number
      completedGoals: number
      activeGoals: number
      publishedContent: number
      learningStreak: number
    }
    charts: {
      learningByWeek: Record<string, number>
      projectTimeByWeek: Record<string, number>
    }
    skills: Skill[]
    checkpoints: Checkpoint[]
  }
}

export function InsightsDashboard({ data }: InsightsDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
      <TabsList className="grid w-full grid-cols-4 max-w-xl">
        <TabsTrigger value="overview">
          <BarChart3 className="w-4 h-4 mr-2" />
          Overview
        </TabsTrigger>
        <TabsTrigger value="progress">
          <TrendingUp className="w-4 h-4 mr-2" />
          Progress
        </TabsTrigger>
        <TabsTrigger value="skills">
          <Code className="w-4 h-4 mr-2" />
          Skills
        </TabsTrigger>
        <TabsTrigger value="ai">
          <Sparkles className="w-4 h-4 mr-2" />
          AI Insights
        </TabsTrigger>
      </TabsList>

      {/* Overview Tab */}
      <TabsContent value="overview" className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weekly Activity Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Learning Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <WeeklyChart
                data={data.charts.learningByWeek}
                label="Learning hours"
                color="bg-blue-500"
              />
            </CardContent>
          </Card>

          {/* Project Time Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="w-5 h-5" />
                Project Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <WeeklyChart
                data={data.charts.projectTimeByWeek}
                label="Project hours"
                color="bg-green-500"
              />
            </CardContent>
          </Card>
        </div>

        {/* Checkpoints */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Upcoming Checkpoints
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.checkpoints.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No checkpoints set. Create 6-month and 12-month goals!
              </p>
            ) : (
              <div className="space-y-4">
                {data.checkpoints.slice(0, 4).map((checkpoint) => (
                  <CheckpointCard key={checkpoint.id} checkpoint={checkpoint} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* Progress Tab */}
      <TabsContent value="progress" className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Productivity Score */}
          <Card>
            <CardHeader>
              <CardTitle>Productivity Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center py-8">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full border-8 border-muted flex items-center justify-center">
                    <span className="text-4xl font-bold">
                      {calculateProductivityScore(data.overview)}
                    </span>
                  </div>
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                    <Badge variant="secondary">/ 100</Badge>
                  </div>
                </div>
              </div>
              <div className="space-y-2 mt-4">
                <ScoreBreakdown
                  label="Learning consistency"
                  value={Math.min(data.overview.learningStreak * 5, 30)}
                  max={30}
                />
                <ScoreBreakdown
                  label="Goal completion"
                  value={Math.min(data.overview.completedGoals * 10, 30)}
                  max={30}
                />
                <ScoreBreakdown
                  label="Content creation"
                  value={Math.min(data.overview.publishedContent * 5, 20)}
                  max={20}
                />
                <ScoreBreakdown
                  label="Active engagement"
                  value={Math.min(data.overview.activeGoals * 5, 20)}
                  max={20}
                />
              </div>
            </CardContent>
          </Card>

          {/* Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Key Trends</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <TrendItem
                icon={<TrendingUp className="w-4 h-4 text-green-500" />}
                title="Learning streak"
                value={`${data.overview.learningStreak} days`}
                trend="Keep it going!"
              />
              <TrendItem
                icon={<Target className="w-4 h-4 text-blue-500" />}
                title="Goals completed"
                value={`${data.overview.completedGoals} total`}
                trend={data.overview.activeGoals > 0 ? `${data.overview.activeGoals} in progress` : 'Set new goals'}
              />
              <TrendItem
                icon={<Zap className="w-4 h-4 text-amber-500" />}
                title="Total focus time"
                value={`${data.overview.totalLearningHours + data.overview.totalProjectHours}h`}
                trend="Last 90 days"
              />
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      {/* Skills Tab */}
      <TabsContent value="skills" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Skill Progress</CardTitle>
          </CardHeader>
          <CardContent>
            {data.skills.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No skills tracked yet. Add skills from your learning resources!
              </p>
            ) : (
              <div className="space-y-4">
                {data.skills.map((skill) => (
                  <SkillBar key={skill.id} skill={skill} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* AI Insights Tab */}
      <TabsContent value="ai" className="space-y-6">
        <AIInsightsPanel data={data} />
      </TabsContent>
    </Tabs>
  )
}

function WeeklyChart({
  data,
  label,
  color,
}: {
  data: Record<string, number>
  label: string
  color: string
}) {
  const weeks = Object.entries(data).slice(-8)
  const maxValue = Math.max(...weeks.map(([, v]) => v), 1)

  if (weeks.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No data available yet
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-end gap-2 h-40">
        {weeks.map(([week, value]) => (
          <div key={week} className="flex-1 flex flex-col items-center gap-1">
            <div
              className={`w-full rounded-t ${color}`}
              style={{
                height: `${(value / maxValue) * 100}%`,
                minHeight: value > 0 ? 4 : 0,
              }}
            />
            <span className="text-xs text-muted-foreground">
              {new Date(week).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
            </span>
          </div>
        ))}
      </div>
      <p className="text-sm text-muted-foreground text-center">{label} per week</p>
    </div>
  )
}

function CheckpointCard({ checkpoint }: { checkpoint: Checkpoint }) {
  const daysUntil = Math.ceil(
    (new Date(checkpoint.checkpointDate).getTime() - new Date().getTime()) /
      (1000 * 60 * 60 * 24)
  )

  return (
    <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-xl">
      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
        <span className="text-lg font-bold text-primary">{checkpoint.overallScore ?? 0}%</span>
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium truncate">{checkpoint.name}</h4>
        <div className="flex items-center gap-2 mt-1">
          <Calendar className="w-3 h-3 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {daysUntil > 0 ? `${daysUntil} days left` : 'Due soon'}
          </span>
        </div>
      </div>
      <ChevronRight className="w-5 h-5 text-muted-foreground" />
    </div>
  )
}

function ScoreBreakdown({
  label,
  value,
  max,
}: {
  label: string
  value: number
  max: number
}) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{value}/{max}</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all"
          style={{ width: `${(value / max) * 100}%` }}
        />
      </div>
    </div>
  )
}

function TrendItem({
  icon,
  title,
  value,
  trend,
}: {
  icon: React.ReactNode
  title: string
  value: string
  trend: string
}) {
  return (
    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
      <div className="p-2 bg-background rounded-lg">{icon}</div>
      <div className="flex-1">
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="font-medium">{value}</p>
      </div>
      <span className="text-xs text-muted-foreground">{trend}</span>
    </div>
  )
}

function SkillBar({ skill }: { skill: Skill }) {
  const levelLabels: Record<string, string> = {
    BEGINNER: 'Beginner',
    INTERMEDIATE: 'Intermediate',
    ADVANCED: 'Advanced',
    EXPERT: 'Expert',
  }

  const levelValues: Record<string, number> = {
    BEGINNER: 1,
    INTERMEDIATE: 2,
    ADVANCED: 3,
    EXPERT: 4,
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <div>
          <span className="font-medium">{skill.name}</span>
          <Badge variant="secondary" className="ml-2 text-xs">
            {skill.category}
          </Badge>
        </div>
        <span className="text-sm text-muted-foreground">
          {levelLabels[skill.currentLevel] || skill.currentLevel}
        </span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all"
          style={{ width: `${((levelValues[skill.currentLevel] || 1) / 4) * 100}%` }}
        />
      </div>
    </div>
  )
}

function calculateProductivityScore(overview: {
  learningStreak: number
  completedGoals: number
  publishedContent: number
  activeGoals: number
}): number {
  const streakScore = Math.min(overview.learningStreak * 5, 30)
  const goalsScore = Math.min(overview.completedGoals * 10, 30)
  const contentScore = Math.min(overview.publishedContent * 5, 20)
  const engagementScore = Math.min(overview.activeGoals * 5, 20)

  return streakScore + goalsScore + contentScore + engagementScore
}
