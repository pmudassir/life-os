'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Trophy, 
  Target, 
  Calendar,
  TrendingUp,
  AlertCircle,
  CheckCircle2
} from 'lucide-react'
import { CheckpointWithScore } from '@/types'

interface CheckpointTrackerProps {
  upcoming: CheckpointWithScore[]
  past: CheckpointWithScore[]
}

export function CheckpointTracker({ upcoming, past }: CheckpointTrackerProps) {
  return (
    <div className="space-y-6">
      {/* Upcoming Checkpoints */}
      {upcoming.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Upcoming Checkpoints</h3>
          {upcoming.map((checkpoint) => (
            <CheckpointCard key={checkpoint.id} checkpoint={checkpoint} />
          ))}
        </div>
      )}

      {/* Past Checkpoints */}
      {past.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Past Checkpoints</h3>
          {past.map((checkpoint) => (
            <CheckpointCard key={checkpoint.id} checkpoint={checkpoint} isPast />
          ))}
        </div>
      )}

      {upcoming.length === 0 && past.length === 0 && (
        <EmptyState />
      )}
    </div>
  )
}

function CheckpointCard({ 
  checkpoint, 
  isPast = false 
}: { 
  checkpoint: CheckpointWithScore
  isPast?: boolean
}) {
  const criteria = checkpoint.criteria as Array<{
    text: string
    achieved: boolean
    evidence?: string
  }>

  const progressPercentage = checkpoint.totalCriteriaCount > 0
    ? Math.round((checkpoint.achievedCriteriaCount / checkpoint.totalCriteriaCount) * 100)
    : 0

  const getStatusColor = () => {
    if (progressPercentage >= 80) return 'bg-emerald-500'
    if (progressPercentage >= 50) return 'bg-amber-500'
    return 'bg-red-500'
  }

  const getStatusIcon = () => {
    if (progressPercentage >= 80) return <CheckCircle2 className="w-5 h-5 text-emerald-500" />
    if (progressPercentage >= 50) return <TrendingUp className="w-5 h-5 text-amber-500" />
    return <AlertCircle className="w-5 h-5 text-red-500" />
  }

  return (
    <Card className={isPast ? 'opacity-75' : ''}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Trophy className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg">{checkpoint.name}</CardTitle>
                {getStatusIcon()}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-xs">
                  {progressPercentage}% Complete
                </Badge>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(checkpoint.checkpointDate).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full ${getStatusColor()} transition-all duration-500`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {checkpoint.achievedCriteriaCount} of {checkpoint.totalCriteriaCount} criteria met
          </p>
        </div>

        {/* Criteria List */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Success Criteria</p>
          <div className="space-y-2">
            {criteria.map((criterion, index) => (
              <div 
                key={index} 
                className="flex items-start gap-3 p-2 rounded-lg bg-muted/50"
              >
                <Checkbox 
                  checked={criterion.achieved} 
                  disabled={isPast}
                  className="mt-0.5"
                />
                <div className="flex-1">
                  <p className={`text-sm ${criterion.achieved ? 'line-through opacity-60' : ''}`}>
                    {criterion.text}
                  </p>
                  {criterion.evidence && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Evidence: {criterion.evidence}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        {checkpoint.summary && (
          <div className="bg-muted p-3 rounded-lg">
            <p className="text-xs font-medium text-muted-foreground mb-1">Summary</p>
            <p className="text-sm">{checkpoint.summary}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function EmptyState() {
  return (
    <div className="text-center py-12 bg-muted rounded-2xl">
      <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
      <p className="font-medium">No checkpoints set up</p>
      <p className="text-sm text-muted-foreground mt-1">
        Create your 6-month and 12-month checkpoints to track your career progress.
      </p>
    </div>
  )
}
