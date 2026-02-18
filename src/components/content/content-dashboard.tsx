'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  FileText,
  Video,
  Image,
  Calendar,
  Eye,
  Heart,
  Share2,
  MessageCircle,
  Lightbulb,
  Clock,
  CheckCircle,
  PenTool,
} from 'lucide-react'

interface ContentPiece {
  id: string
  title: string
  type: string
  status: string
  platform: string
  scheduledDate: Date | null
  publishedDate: Date | null
  views: number
  likes: number
  shares: number
  comments: number
  totalEngagement?: number
}

interface ContentIdea {
  id: string
  title: string
  description: string | null
  type: string
  status: string
  createdAt: Date
}

interface ContentDashboardProps {
  data: {
    ideas: ContentIdea[]
    scheduledContent: ContentPiece[]
    publishedContent: (ContentPiece & { totalEngagement: number })[]
    thisMonthStats: {
      published: number
      totalViews: number
      totalLikes: number
      totalShares: number
    }
    platformDistribution: Record<string, number>
  }
}

const typeIcons: Record<string, React.ReactNode> = {
  article: <FileText className="w-4 h-4" />,
  video: <Video className="w-4 h-4" />,
  thread: <MessageCircle className="w-4 h-4" />,
  image: <Image className="w-4 h-4" />,
}

const platformColors: Record<string, string> = {
  twitter: 'bg-blue-500',
  linkedin: 'bg-blue-700',
  youtube: 'bg-red-500',
  blog: 'bg-green-500',
  instagram: 'bg-pink-500',
}

export function ContentDashboard({ data }: ContentDashboardProps) {
  const [activeTab, setActiveTab] = useState('calendar')

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
      <TabsList className="grid w-full grid-cols-4 max-w-xl">
        <TabsTrigger value="calendar">
          <Calendar className="w-4 h-4 mr-2" />
          Calendar
        </TabsTrigger>
        <TabsTrigger value="ideas">
          <Lightbulb className="w-4 h-4 mr-2" />
          Ideas
        </TabsTrigger>
        <TabsTrigger value="drafts">
          <PenTool className="w-4 h-4 mr-2" />
          Scheduled
        </TabsTrigger>
        <TabsTrigger value="published">
          <CheckCircle className="w-4 h-4 mr-2" />
          Published
        </TabsTrigger>
      </TabsList>

      {/* Calendar View */}
      <TabsContent value="calendar" className="space-y-6">
        <ContentCalendar scheduled={data.scheduledContent} />
      </TabsContent>

      {/* Ideas */}
      <TabsContent value="ideas" className="space-y-4">
        {data.ideas.length === 0 ? (
          <EmptyState
            icon={<Lightbulb className="w-12 h-12 text-muted-foreground" />}
            title="No content ideas yet"
            description="Start capturing your content ideas to build your pipeline"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.ideas.map((idea) => (
              <IdeaCard key={idea.id} idea={idea} />
            ))}
          </div>
        )}
      </TabsContent>

      {/* Scheduled */}
      <TabsContent value="drafts" className="space-y-4">
        {data.scheduledContent.length === 0 ? (
          <EmptyState
            icon={<Clock className="w-12 h-12 text-muted-foreground" />}
            title="No scheduled content"
            description="Schedule your content to maintain a consistent posting rhythm"
          />
        ) : (
          <div className="space-y-4">
            {data.scheduledContent.map((piece) => (
              <ScheduledCard key={piece.id} piece={piece} />
            ))}
          </div>
        )}
      </TabsContent>

      {/* Published */}
      <TabsContent value="published" className="space-y-4">
        {data.publishedContent.length === 0 ? (
          <EmptyState
            icon={<CheckCircle className="w-12 h-12 text-muted-foreground" />}
            title="No published content"
            description="Your published content and performance metrics will appear here"
          />
        ) : (
          <div className="space-y-4">
            {data.publishedContent.map((piece) => (
              <PublishedCard key={piece.id} piece={piece} />
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  )
}

function ContentCalendar({ scheduled }: { scheduled: ContentPiece[] }) {
  // Get current week dates
  const today = new Date()
  const startOfWeek = new Date(today)
  startOfWeek.setDate(today.getDate() - today.getDay())
  
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(startOfWeek)
    date.setDate(startOfWeek.getDate() + i)
    return date
  })

  const getContentForDate = (date: Date) => {
    return scheduled.filter((piece) => {
      if (!piece.scheduledDate) return false
      const scheduledDate = new Date(piece.scheduledDate)
      return scheduledDate.toDateString() === date.toDateString()
    })
  }

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <Card>
      <CardHeader>
        <CardTitle>This Week</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((date, index) => {
            const content = getContentForDate(date)
            const isToday = date.toDateString() === today.toDateString()
            
            return (
              <div
                key={index}
                className={`min-h-[120px] border rounded-xl p-2 ${
                  isToday ? 'border-primary bg-primary/5' : 'border-border'
                }`}
              >
                <div className="text-xs text-muted-foreground mb-1">
                  {dayNames[index]}
                </div>
                <div className={`text-lg font-semibold ${isToday ? 'text-primary' : ''}`}>
                  {date.getDate()}
                </div>
                <div className="space-y-1 mt-2">
                  {content.map((piece) => (
                    <div
                      key={piece.id}
                      className={`text-xs p-1 rounded ${platformColors[piece.platform] || 'bg-gray-500'} text-white truncate`}
                    >
                      {piece.title}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

function IdeaCard({ idea }: { idea: ContentIdea }) {
  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-amber-100 text-amber-700 rounded-lg">
            {typeIcons[idea.type] || <FileText className="w-4 h-4" />}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium truncate">{idea.title}</h4>
            {idea.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                {idea.description}
              </p>
            )}
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary" className="text-xs">
                {idea.type}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {new Date(idea.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ScheduledCard({ piece }: { piece: ContentPiece }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className={`p-2 rounded-lg ${platformColors[piece.platform] || 'bg-gray-500'} text-white`}>
            {typeIcons[piece.type] || <FileText className="w-4 h-4" />}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium">{piece.title}</h4>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline">{piece.platform}</Badge>
              <span className="text-sm text-muted-foreground">
                <Calendar className="w-3 h-3 inline mr-1" />
                {piece.scheduledDate
                  ? new Date(piece.scheduledDate).toLocaleDateString()
                  : 'No date'}
              </span>
            </div>
          </div>
          <Button variant="outline" size="sm">
            Edit
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function PublishedCard({ piece }: { piece: ContentPiece & { totalEngagement: number } }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className={`p-2 rounded-lg ${platformColors[piece.platform] || 'bg-gray-500'} text-white`}>
            {typeIcons[piece.type] || <FileText className="w-4 h-4" />}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium">{piece.title}</h4>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {piece.views}
              </span>
              <span className="flex items-center gap-1">
                <Heart className="w-3 h-3" />
                {piece.likes}
              </span>
              <span className="flex items-center gap-1">
                <Share2 className="w-3 h-3" />
                {piece.shares}
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle className="w-3 h-3" />
                {piece.comments}
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{piece.totalEngagement}</div>
            <div className="text-xs text-muted-foreground">engagement</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function EmptyState({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="text-center py-12">
      <div className="flex justify-center mb-4">{icon}</div>
      <h3 className="text-lg font-medium">{title}</h3>
      <p className="text-muted-foreground mt-1">{description}</p>
    </div>
  )
}
