import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ContentDashboard } from '@/components/content/content-dashboard'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Content | Career Tracker',
  description: 'Manage your content calendar and track publishing',
}

interface ContentPieceData {
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
}

interface ContentIdeaData {
  id: string
  title: string
  description: string | null
  type: string
  status: string
  createdAt: Date
}

async function getContentData(userId: string) {
  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const [ideas, scheduled, published] = await Promise.all([
    prisma.contentIdea.findMany({
      where: { userId, status: 'idea' },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.contentPiece.findMany({
      where: { userId, status: 'SCHEDULED' },
      orderBy: { scheduledDate: 'asc' },
    }),
    prisma.contentPiece.findMany({
      where: { 
        userId, 
        status: 'PUBLISHED',
        publishedDate: { gte: thirtyDaysAgo }
      },
      orderBy: { publishedDate: 'desc' },
    }),
  ])

  // Calculate stats
  const publishedTyped = published as ContentPieceData[]
  const thisMonthStats = {
    published: published.length,
    totalViews: publishedTyped.reduce((acc: number, p: ContentPieceData) => acc + p.views, 0),
    totalLikes: publishedTyped.reduce((acc: number, p: ContentPieceData) => acc + p.likes, 0),
    totalShares: publishedTyped.reduce((acc: number, p: ContentPieceData) => acc + p.shares, 0),
  }

  // Platform distribution
  const platformDistribution = publishedTyped.reduce((acc: Record<string, number>, p: ContentPieceData) => {
    acc[p.platform] = (acc[p.platform] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return {
    ideas: ideas as ContentIdeaData[],
    scheduledContent: scheduled as ContentPieceData[],
    publishedContent: publishedTyped.map((p: ContentPieceData) => ({
      ...p,
      totalEngagement: p.views + p.likes + p.shares + p.comments,
    })),
    thisMonthStats,
    platformDistribution,
  }
}

export default async function ContentPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/')
  }

  const data = await getContentData(session.user.id)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Content</h1>
          <p className="text-muted-foreground mt-1">
            Plan, create, and track your content across platforms
          </p>
        </div>
        <Button asChild>
          <Link href="/content/new">
            <Plus className="w-4 h-4 mr-2" />
            New Content
          </Link>
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          label="Ideas"
          value={data.ideas.length}
          description="Content ideas"
        />
        <StatCard
          label="Scheduled"
          value={data.scheduledContent.length}
          description="Ready to publish"
        />
        <StatCard
          label="Published"
          value={data.thisMonthStats.published}
          description="This month"
        />
        <StatCard
          label="Engagement"
          value={data.thisMonthStats.totalViews + data.thisMonthStats.totalLikes}
          description="Total interactions"
        />
      </div>

      {/* Main Dashboard */}
      <ContentDashboard data={data} />
    </div>
  )
}

function StatCard({
  label,
  value,
  description,
}: {
  label: string
  value: string | number
  description: string
}) {
  return (
    <div className="bg-card border rounded-2xl p-6">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-3xl font-bold mt-1">{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{description}</p>
    </div>
  )
}
