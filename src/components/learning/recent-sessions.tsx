'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Clock, BookOpen, Video, FileText, Headphones } from 'lucide-react'
import { formatDuration } from '@/lib/utils'

interface LearningSession {
  id: string
  startTime: Date
  duration: number
  pagesRead?: number | null
  chaptersCompleted?: number | null
  focusRating?: number | null
  resource?: { title: string; type: string }
}

interface RecentSessionsProps {
  sessions: LearningSession[]
}

const typeIcons: Record<string, React.ReactNode> = {
  BOOK: <BookOpen className="w-4 h-4" />,
  VIDEO: <Video className="w-4 h-4" />,
  ARTICLE: <FileText className="w-4 h-4" />,
  PODCAST: <Headphones className="w-4 h-4" />,
  default: <BookOpen className="w-4 h-4" />,
}

export function RecentSessions({ sessions }: RecentSessionsProps) {
  if (sessions.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="font-medium">No study sessions yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Start logging your learning sessions to see them here.
          </p>
        </CardContent>
      </Card>
    )
  }

  // Group by date
  const grouped = sessions.reduce((acc, session) => {
    const date = new Date(session.startTime).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    })
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(session)
    return acc
  }, {} as Record<string, LearningSession[]>)

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([date, daySessions]) => (
        <div key={date}>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">{date}</h3>
          <div className="space-y-2">
            {daySessions.map((session) => (
              <SessionCard key={session.id} session={session} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function SessionCard({ session }: { session: LearningSession }) {
  const icon = session.resource?.type ? typeIcons[session.resource.type] || typeIcons['default'] : typeIcons['default']

  return (
    <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
      <div className="p-2 bg-primary/10 rounded-lg">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{session.resource?.title || 'Unknown resource'}</p>
        <div className="flex items-center gap-3 text-sm text-muted-foreground mt-0.5">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {formatDuration(session.duration)}
          </span>
          {session.pagesRead && (
            <span>{session.pagesRead} pages</span>
          )}
          {session.chaptersCompleted && (
            <span>{session.chaptersCompleted} chapters</span>
          )}
        </div>
      </div>
      {session.focusRating && (
        <div className="flex items-center gap-1">
          <span className="text-sm font-medium">{session.focusRating}/5</span>
          <span className="text-xs text-muted-foreground">focus</span>
        </div>
      )}
    </div>
  )
}
