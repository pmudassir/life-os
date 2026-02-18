'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Briefcase, 
  Building2, 
  User, 
  GraduationCap,
  ChevronDown,
  ChevronUp,
  Clock,
  Target,
  TrendingUp,
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'

interface ProjectGoal {
  id: string
  title?: string
  status: string
  targetDate?: Date | null
}

interface ProjectMetric {
  id: string
  name?: string
  value?: number
  unit?: string
}

interface ProjectData {
  id: string
  name: string
  description?: string | null
  type: string
  status: string
  goalsCount: number
  completedGoalsCount: number
  thisWeekHours: number
  goals: ProjectGoal[]
  metrics: ProjectMetric[]
  estimatedHours?: number | null
  totalHoursLogged?: number
  riskLevel?: string | null
  aiSummary?: string | null
}

interface ProjectCardProps {
  project: ProjectData
}

const typeIcons: Record<string, React.ReactNode> = {
  JOB: <Briefcase className="w-4 h-4" />,
  BUSINESS: <Building2 className="w-4 h-4" />,
  FREELANCE: <User className="w-4 h-4" />,
  PERSONAL: <GraduationCap className="w-4 h-4" />,
  LEARNING: <GraduationCap className="w-4 h-4" />,
}

const typeLabels: Record<string, string> = {
  JOB: 'Job',
  BUSINESS: 'Business',
  FREELANCE: 'Freelance',
  PERSONAL: 'Personal',
  LEARNING: 'Learning',
}

const statusColors: Record<string, string> = {
  PLANNING: 'bg-amber-500',
  ACTIVE: 'bg-emerald-500',
  ON_HOLD: 'bg-slate-500',
  COMPLETED: 'bg-blue-500',
  CANCELLED: 'bg-red-500',
}

export function ProjectCard({ project }: ProjectCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const progressPercentage = project.estimatedHours && project.totalHoursLogged
    ? Math.round((project.totalHoursLogged / project.estimatedHours) * 100)
    : 0

  const getRiskIndicator = () => {
    if (project.riskLevel === 'high') {
      return <AlertCircle className="w-4 h-4 text-red-500" />
    }
    if (project.riskLevel === 'medium') {
      return <AlertCircle className="w-4 h-4 text-amber-500" />
    }
    return null
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              {typeIcons[project.type] || <Briefcase className="w-4 h-4" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg">{project.name}</CardTitle>
                {getRiskIndicator()}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-xs">
                  {typeLabels[project.type] || project.type}
                </Badge>
                <span className={`w-2 h-2 rounded-full ${statusColors[project.status]}`} />
                <span className="text-xs text-muted-foreground capitalize">
                  {project.status.toLowerCase()}
                </span>
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
        {project.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {project.description}
          </p>
        )}

        {/* Progress */}
        {project.estimatedHours && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{progressPercentage}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-500"
                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{project.totalHoursLogged || 0}h logged</span>
              <span>{project.estimatedHours}h estimated</span>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>{project.thisWeekHours}h this week</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Target className="w-4 h-4" />
            <span>{project.goalsCount} goals</span>
          </div>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="pt-4 border-t space-y-4">
            {/* Goals */}
            {project.goals.length > 0 && (
              <div className="space-y-2">
                <p className="font-medium text-sm">Active Goals</p>
                <div className="space-y-2">
                  {project.goals.slice(0, 3).map((goal) => (
                    <div key={goal.id} className="flex items-center gap-2 text-sm">
                      <div className={`w-2 h-2 rounded-full ${
                        goal.status === 'completed' ? 'bg-emerald-500' : 'bg-amber-500'
                      }`} />
                      <span className="flex-1 truncate">{goal.title || 'Untitled goal'}</span>
                      {goal.targetDate && (
                        <span className="text-xs text-muted-foreground">
                          Due {new Date(goal.targetDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Metrics */}
            {project.metrics.length > 0 && (
              <div className="space-y-2">
                <p className="font-medium text-sm">Recent Metrics</p>
                <div className="grid grid-cols-2 gap-2">
                  {project.metrics.slice(0, 4).map((metric) => (
                    <div key={metric.id} className="bg-muted p-2 rounded-lg">
                      <p className="text-xs text-muted-foreground">{metric.name || 'Metric'}</p>
                      <p className="font-medium">
                        {metric.value || 0} {metric.unit || ''}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI Summary */}
            {project.aiSummary && (
              <div className="bg-muted p-3 rounded-lg">
                <p className="text-xs font-medium text-muted-foreground mb-1">AI Summary</p>
                <p className="text-sm">{project.aiSummary}</p>
              </div>
            )}

            {/* Action */}
            <Button asChild variant="outline" className="w-full">
              <Link href={`/projects/${project.id}`}>
                View Project Details
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
