'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Sparkles,
  Lightbulb,
  Target,
  TrendingUp,
  AlertCircle,
  RefreshCw,
  ChevronRight,
  BookOpen,
  Code,
  Calendar,
} from 'lucide-react'

interface AIInsightsPanelProps {
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
    skills: Array<{ id: string; name: string; category: string; currentLevel: string }>
    checkpoints: Array<{
      id: string
      name: string
      checkpointDate: Date
      overallScore: number | null
      summary: string | null
    }>
  }
}

export function AIInsightsPanel({ data }: AIInsightsPanelProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [insights, setInsights] = useState<string[]>([])

  // Generate initial insights based on data
  const generateInsights = () => {
    setIsGenerating(true)
    
    // Simulate AI generation with pattern-based insights
    setTimeout(() => {
      const newInsights: string[] = []

      // Learning insights
      if (data.overview.learningStreak > 7) {
        newInsights.push(
          `Great momentum! You've maintained a ${data.overview.learningStreak}-day learning streak. This consistency is key for mastering complex topics like distributed systems.`
        )
      } else if (data.overview.learningStreak > 0) {
        newInsights.push(
          `You have a ${data.overview.learningStreak}-day learning streak. Try to study at the same time each day to build a stronger habit.`
        )
      } else {
        newInsights.push(
          `It's been a while since your last learning session. Even 25 minutes today can help maintain your knowledge.`
        )
      }

      // Goal insights
      if (data.overview.activeGoals > 0 && data.overview.completedGoals > 0) {
        newInsights.push(
          `You've completed ${data.overview.completedGoals} goals and have ${data.overview.activeGoals} in progress. Consider reviewing your active goals to ensure they align with your career trajectory.`
        )
      } else if (data.overview.activeGoals === 0) {
        newInsights.push(
          `You don't have any active goals right now. Setting a 6-month checkpoint for your DDIA learning or PawSpace development could help maintain focus.`
        )
      }

      // Content insights
      if (data.overview.publishedContent > 0) {
        newInsights.push(
          `You've published ${data.overview.publishedContent} pieces of content. Sharing your learning journey builds your personal brand and reinforces your knowledge.`
        )
      } else {
        newInsights.push(
          `Consider sharing what you're learning! Writing about distributed systems concepts or your AI agent projects could attract opportunities.`
        )
      }

      // Time allocation
      const totalTime = data.overview.totalLearningHours + data.overview.totalProjectHours
      if (totalTime > 0) {
        const learningRatio = (data.overview.totalLearningHours / totalTime) * 100
        if (learningRatio > 70) {
          newInsights.push(
            `You're spending ${Math.round(learningRatio)}% of your time on learning. Consider allocating more time to apply your knowledge through projects.`
          )
        } else if (learningRatio < 30) {
          newInsights.push(
            `You're heavily project-focused. Dedicating more time to structured learning could help you discover new approaches and technologies.`
          )
        }
      }

      setInsights(newInsights)
      setIsGenerating(false)
    }, 1500)
  }

  // Auto-generate on first render
  useState(() => {
    generateInsights()
  })

  return (
    <div className="space-y-6">
      {/* AI Summary Card */}
      <Card className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-500" />
              AI Career Coach
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={generateInsights}
              disabled={isGenerating}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isGenerating ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-muted/50 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {insights.map((insight, index) => (
                <InsightCard key={index} insight={insight} index={index} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recommendations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <RecommendationCard
          icon={<BookOpen className="w-5 h-5 text-blue-500" />}
          title="Recommended Reading"
          description="Based on your DDIA progress, focus on Chapter 5: Replication next"
          action="Continue Learning"
        />
        <RecommendationCard
          icon={<Code className="w-5 h-5 text-green-500" />}
          title="Project Focus"
          description="PawSpace could benefit from implementing the caching patterns you studied"
          action="View Project"
        />
        <RecommendationCard
          icon={<Target className="w-5 h-5 text-amber-500" />}
          title="Goal Checkpoint"
          description="Your 6-month review is approaching. Schedule time to assess progress"
          action="Review Goals"
        />
        <RecommendationCard
          icon={<Calendar className="w-5 h-5 text-purple-500" />}
          title="Schedule Optimization"
          description="Your most productive learning hours are 9-11 AM. Consider protecting this time"
          action="View Schedule"
        />
      </div>

      {/* Action Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Suggested Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <ActionItem
              priority="high"
              title="Complete DDIA Chapter 4 review"
              context="You started 5 days ago, 40% remaining"
            />
            <ActionItem
              priority="medium"
              title="Log this week's PawSpace progress"
              context="No time entries logged this week"
            />
            <ActionItem
              priority="low"
              title="Share a learning insight on LinkedIn"
              context="Last post was 2 weeks ago"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function InsightCard({ insight, index }: { insight: string; index: number }) {
  const icons = [Lightbulb, TrendingUp, Target, Sparkles]
  const Icon = icons[index % icons.length]

  return (
    <div className="flex gap-3 p-3 bg-background rounded-xl">
      <div className="p-2 bg-purple-100 text-purple-600 rounded-lg h-fit">
        <Icon className="w-4 h-4" />
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">{insight}</p>
    </div>
  )
}

function RecommendationCard({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode
  title: string
  description: string
  action: string
}) {
  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-muted rounded-lg">{icon}</div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium">{title}</h4>
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          </div>
          <Button variant="ghost" size="sm" className="shrink-0">
            {action}
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function ActionItem({
  priority,
  title,
  context,
}: {
  priority: 'high' | 'medium' | 'low'
  title: string
  context: string
}) {
  const priorityColors = {
    high: 'bg-red-500',
    medium: 'bg-amber-500',
    low: 'bg-blue-500',
  }

  return (
    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
      <div className={`w-2 h-2 rounded-full ${priorityColors[priority]}`} />
      <div className="flex-1 min-w-0">
        <p className="font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{context}</p>
      </div>
      <Badge variant="outline" className="capitalize">
        {priority}
      </Badge>
    </div>
  )
}
