import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NetworkDashboard } from '@/components/network/network-dashboard'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Network | Career Tracker',
  description: 'Manage your professional network and conversations',
}

interface Contact {
  id: string
  name: string
  company: string | null
  role: string | null
  email: string | null
  linkedIn: string | null
  type: string
  lastContact: Date | null
  notes: string | null
}

interface Conversation {
  id: string
  contactId: string
  date: Date
  type: string
  notes: string | null
  followUpDate: Date | null
  followUpNeeded: boolean
  contact: { name: string; company: string | null }
}

async function getNetworkData(userId: string) {
  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

  const [contacts, recentConversations, pendingFollowUps] = await Promise.all([
    prisma.contact.findMany({
      where: { userId },
      orderBy: { lastContact: 'desc' },
    }),
    prisma.conversation.findMany({
      where: {
        userId,
        date: { gte: thirtyDaysAgo },
      },
      include: { contact: { select: { name: true, company: true } } },
      orderBy: { date: 'desc' },
      take: 10,
    }),
    prisma.conversation.findMany({
      where: {
        userId,
        followUpDate: { lte: sevenDaysFromNow },
        followUpNeeded: true,
      },
      include: { contact: { select: { name: true, company: true } } },
      orderBy: { followUpDate: 'asc' },
    }),
  ])

  // Calculate stats
  const typedContacts = contacts as Contact[]
  const relationshipBreakdown = typedContacts.reduce((acc: Record<string, number>, c: Contact) => {
    acc[c.type] = (acc[c.type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return {
    contacts: typedContacts,
    recentConversations: recentConversations as Conversation[],
    pendingFollowUps: pendingFollowUps as Conversation[],
    stats: {
      totalContacts: contacts.length,
      conversationsThisMonth: recentConversations.length,
      pendingFollowUps: pendingFollowUps.length,
    },
    relationshipBreakdown,
  }
}

export default async function NetworkPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/')
  }

  const data = await getNetworkData(session.user.id)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Network</h1>
          <p className="text-muted-foreground mt-1">
            Manage connections and track conversations
          </p>
        </div>
        <Button asChild>
          <Link href="/network/new">
            <Plus className="w-4 h-4 mr-2" />
            Add Contact
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Contacts"
          value={data.stats.totalContacts}
          description="In your network"
        />
        <StatCard
          label="Conversations"
          value={data.stats.conversationsThisMonth}
          description="This month"
        />
        <StatCard
          label="Follow-ups"
          value={data.stats.pendingFollowUps}
          description="Pending"
        />
        <StatCard
          label="Mentors"
          value={data.relationshipBreakdown['MENTOR'] || data.relationshipBreakdown['mentor'] || 0}
          description="Key relationships"
        />
      </div>

      {/* Main Dashboard */}
      <NetworkDashboard data={data} />
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
