'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Target, 
  Calendar, 
  TrendingUp,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Clock
} from 'lucide-react'
import { GoalWithProgress, GoalTimeframe, GoalStatus } from '@/types'

interface GoalCardProps {
  goal: GoalWithProgress
  compact?: boolean
}

const timeframeLabels: Record<GoalTimeframe, string> = {
  WEEKLY: 'Weekly',
  MONTHLY: 'Monthly',
  SIX_MONTH: '6-Month',
  TWELVE_MONTH: '12-Month',
}

const statusColors: Record<GoalStatus, string> = {
  NOT_STARTED: 'bg-slate-500',
  IN_PROGRESS: 'bg-blue-500',
  ACHIEVED: 'bg-emerald-500',
  PARTIALLY_ACHIEVED: 'bg-amber-500',
  MISSED: 'bg-red-500',
}

const statusLabels: Record<GoalStatus, string> = {
  NOT_STARTED: 'Not Started',
  IN_PROGRESS: 'In Progress',
  ACHIEVED: 'Achieved',
  PARTIALLY_ACHIEVED: 'Partially Achieved',
  MISSED: 'Missed',
}

export function GoalCard({ goal, compact = false }: GoalCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const isCompleted = goal.status === 'ACHIEVED' || goal.status === 'PARTIALLY_ACHIEVED'
  const daysUntilTarget = Math.ceil(
    (new Date(goal.targetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  )

  if (compact) {
    return (
      <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${statusColors[goal.status]}`} />
          <span className="font-medium">{goal.title}</span>
        </div>
        <div className="flex items-center gap-2">
          {goal.targetValue && (
            <span className="text-sm text-muted-foreground">
              {goal.currentValue || 0} / {goal.targetValue} {goal.unit}
            </span>
          )}
          {daysUntilTarget > 0 && !isCompleted && (
            <span className="text-xs text-muted-foreground">
              {daysUntilTarget} days left
            </span>
          )}
        </div>
      </div>
    )
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className="p-2 bg-primary/10 rounded-lg mt-0.5">
              <Target className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-medium">{goal.title}</h3>
                <Badge variant="secondary" className="text-xs">
                  {timeframeLabels[goal.timeframe]}
                </Badge>
                <span className={`w-2 h-2 rounded-full ${statusColors[goal.status]}`} />
              </div>
              
              {goal.description && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {goal.description}
                </p>
              )}

              {/* Progress */}
              {(goal.targetValue || goal.progressPercentage > 0) && (
                <div className="mt-3 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{goal.progressPercentage}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full ${statusColors[goal.status]} transition-all duration-500`}
                      style={{ width: `${goal.progressPercentage}%` }}
                    />
                  </div>
                  {goal.targetValue && (
                    <p className="text-xs text-muted-foreground">
                      {goal.currentValue || 0} / {goal.targetValue} {goal.unit}
                    </p>
                  )}
                </div>
              )}

              {/* Meta */}
              <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  Target: {new Date(goal.targetDate).toLocaleDateString()}
                </span>
                {daysUntilTarget > 0 && !isCompleted && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {daysUntilTarget} days left
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t space-y-3">
            {goal.successCriteria && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  Success Criteria
                </p>
                <p className="text-sm">{goal.successCriteria}</p>
              </div>
            )}

            {goal.aiSuggestions && (
              <div className="bg-muted p-3 rounded-lg">
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  AI Suggestions
                </p>
                <p className="text-sm">{goal.aiSuggestions}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              {!isCompleted && (
                <Button size="sm" variant="outline">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  Update Progress
                </Button>
              )}
              {!isCompleted && (
                <Button size="sm" variant="outline">
                  <CheckCircle2 className="w-4 h-4 mr-1" />
                  Mark Complete
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
