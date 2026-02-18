'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { 
  BookOpen, 
  Clock, 
  ChevronDown, 
  ChevronUp,
  Play,
  CheckCircle2,
  MoreHorizontal
} from 'lucide-react'
import { formatDuration } from '@/lib/utils'

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
  author?: string | null
  description?: string | null
  targetCompletionDate?: Date | null
  summary?: string | null
  keyConcepts?: string[]
}

interface BookTrackerProps {
  resource: LearningResource
}

export function BookTracker({ resource }: BookTrackerProps) {
  const [isExpanded, setIsExpanded] = useState(resource.isFocusResource)
  const [isLogging, setIsLogging] = useState(false)
  const [pagesRead, setPagesRead] = useState('')
  const [sessionNotes, setSessionNotes] = useState('')

  const handleLogSession = async () => {
    if (!pagesRead) return
    
    setIsLogging(true)
    try {
      // TODO: Implement logLearningSession action
      console.log('Logging session:', {
        resourceId: resource.id,
        pagesRead: parseInt(pagesRead),
        notes: sessionNotes,
      })
      setPagesRead('')
      setSessionNotes('')
    } finally {
      setIsLogging(false)
    }
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 75) return 'bg-emerald-500'
    if (percentage >= 50) return 'bg-blue-500'
    if (percentage >= 25) return 'bg-amber-500'
    return 'bg-slate-500'
  }

  return (
    <Card className={resource.isFocusResource ? 'border-lime-500 border-2' : ''}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">{resource.title}</CardTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                <span>{resource.type}</span>
                {resource.author && (
                  <>
                    <span>•</span>
                    <span>{resource.author}</span>
                  </>
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
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{resource.progressPercentage}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${getProgressColor(resource.progressPercentage)}`}
              style={{ width: `${resource.progressPercentage}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>
              {resource.totalPages
                ? `Page ${resource.currentPage} of ${resource.totalPages}`
                : resource.totalChapters
                ? `Chapter ${resource.currentChapter} of ${resource.totalChapters}`
                : 'In progress'}
            </span>
            <span>{formatDuration(resource.totalTimeSpent)} spent</span>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>{resource.sessionsCount} sessions</span>
          </div>
          {resource.targetCompletionDate && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <CheckCircle2 className="w-4 h-4" />
              <span>Due {new Date(resource.targetCompletionDate).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="pt-4 border-t space-y-4">
            {/* Log Session Form */}
            <div className="space-y-3">
              <p className="font-medium text-sm">Log Study Session</p>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Pages read"
                  value={pagesRead}
                  onChange={(e) => setPagesRead(e.target.value)}
                  className="w-32"
                />
                <Input
                  placeholder="Notes (optional)"
                  value={sessionNotes}
                  onChange={(e) => setSessionNotes(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  onClick={handleLogSession} 
                  disabled={isLogging || !pagesRead}
                  size="sm"
                >
                  <Play className="w-4 h-4 mr-1" />
                  Log
                </Button>
              </div>
            </div>

            {/* AI Summary if available */}
            {resource.summary && (
              <div className="bg-muted p-3 rounded-lg">
                <p className="text-xs font-medium text-muted-foreground mb-1">AI Summary</p>
                <p className="text-sm">{resource.summary}</p>
              </div>
            )}

            {/* Key Concepts */}
            {resource.keyConcepts && resource.keyConcepts.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Key Concepts</p>
                <div className="flex flex-wrap gap-1.5">
                  {resource.keyConcepts?.map((concept: string, i: number) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full"
                    >
                      {concept}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
