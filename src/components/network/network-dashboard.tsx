'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import {
  Users,
  MessageSquare,
  Calendar,
  AlertCircle,
  Mail,
  Linkedin,
  Building,
  Search,
  Phone,
  Video,
  Coffee,
} from 'lucide-react'

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

interface NetworkDashboardProps {
  data: {
    contacts: Contact[]
    recentConversations: Conversation[]
    pendingFollowUps: Conversation[]
    stats: {
      totalContacts: number
      conversationsThisMonth: number
      pendingFollowUps: number
    }
    relationshipBreakdown: Record<string, number>
  }
}

const relationshipColors: Record<string, string> = {
  MENTOR: 'bg-purple-500',
  mentor: 'bg-purple-500',
  COLLEAGUE: 'bg-blue-500',
  colleague: 'bg-blue-500',
  RECRUITER: 'bg-green-500',
  recruiter: 'bg-green-500',
  FRIEND: 'bg-pink-500',
  friend: 'bg-pink-500',
  acquaintance: 'bg-gray-400',
  OTHER: 'bg-gray-400',
}

const conversationTypeIcons: Record<string, React.ReactNode> = {
  call: <Phone className="w-4 h-4" />,
  video: <Video className="w-4 h-4" />,
  email: <Mail className="w-4 h-4" />,
  coffee: <Coffee className="w-4 h-4" />,
  message: <MessageSquare className="w-4 h-4" />,
}

export function NetworkDashboard({ data }: NetworkDashboardProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('contacts')

  const filteredContacts = data.contacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.role?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
      <TabsList className="grid w-full grid-cols-3 max-w-md">
        <TabsTrigger value="contacts">
          <Users className="w-4 h-4 mr-2" />
          Contacts
        </TabsTrigger>
        <TabsTrigger value="conversations">
          <MessageSquare className="w-4 h-4 mr-2" />
          Recent
        </TabsTrigger>
        <TabsTrigger value="followups">
          <AlertCircle className="w-4 h-4 mr-2" />
          Follow-ups
        </TabsTrigger>
      </TabsList>

      {/* Contacts Tab */}
      <TabsContent value="contacts" className="space-y-4">
        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Contacts Grid */}
        {filteredContacts.length === 0 ? (
          <EmptyState
            icon={<Users className="w-12 h-12 text-muted-foreground" />}
            title={searchQuery ? 'No contacts found' : 'No contacts yet'}
            description={
              searchQuery
                ? 'Try a different search term'
                : 'Start building your network by adding contacts'
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredContacts.map((contact) => (
              <ContactCard key={contact.id} contact={contact} />
            ))}
          </div>
        )}
      </TabsContent>

      {/* Recent Conversations Tab */}
      <TabsContent value="conversations" className="space-y-4">
        {data.recentConversations.length === 0 ? (
          <EmptyState
            icon={<MessageSquare className="w-12 h-12 text-muted-foreground" />}
            title="No recent conversations"
            description="Log conversations with your contacts to track relationships"
          />
        ) : (
          <div className="space-y-3">
            {data.recentConversations.map((conversation) => (
              <ConversationCard key={conversation.id} conversation={conversation} />
            ))}
          </div>
        )}
      </TabsContent>

      {/* Follow-ups Tab */}
      <TabsContent value="followups" className="space-y-4">
        {data.pendingFollowUps.length === 0 ? (
          <EmptyState
            icon={<Calendar className="w-12 h-12 text-muted-foreground" />}
            title="No pending follow-ups"
            description="You're all caught up! Schedule follow-ups when logging conversations."
          />
        ) : (
          <div className="space-y-3">
            {data.pendingFollowUps.map((followUp) => (
              <FollowUpCard key={followUp.id} followUp={followUp} />
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  )
}

function ContactCard({ contact }: { contact: Contact }) {
  const daysSinceContact = contact.lastContact
    ? Math.floor(
        (new Date().getTime() - new Date(contact.lastContact).getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : null

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium ${
              relationshipColors[contact.type] || 'bg-gray-500'
            }`}
          >
            {contact.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium truncate">{contact.name}</h4>
            {contact.role && (
              <p className="text-sm text-muted-foreground truncate">
                {contact.role}
              </p>
            )}
            {contact.company && (
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <Building className="w-3 h-3" />
                {contact.company}
              </p>
            )}
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary" className="text-xs capitalize">
                {contact.type}
              </Badge>
              {daysSinceContact !== null && (
                <span className="text-xs text-muted-foreground">
                  {daysSinceContact === 0
                    ? 'Today'
                    : `${daysSinceContact}d ago`}
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-1">
            {contact.email && (
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Mail className="w-4 h-4" />
              </Button>
            )}
            {contact.linkedIn && (
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Linkedin className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ConversationCard({ conversation }: { conversation: Conversation }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-muted rounded-lg">
            {conversationTypeIcons[conversation.type] || (
              <MessageSquare className="w-4 h-4" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-medium">{conversation.contact.name}</h4>
              {conversation.contact.company && (
                <span className="text-sm text-muted-foreground">
                  @ {conversation.contact.company}
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {conversation.notes || 'No notes'}
            </p>
            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
              <Calendar className="w-3 h-3" />
              {new Date(conversation.date).toLocaleDateString()}
              <Badge variant="outline" className="text-xs capitalize ml-2">
                {conversation.type}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function FollowUpCard({ followUp }: { followUp: Conversation }) {
  const daysUntil = followUp.followUpDate
    ? Math.ceil(
        (new Date(followUp.followUpDate).getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : 0

  const isOverdue = daysUntil < 0

  return (
    <Card className={isOverdue ? 'border-red-200 bg-red-50/50' : ''}>
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div
            className={`p-2 rounded-lg ${
              isOverdue ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
            }`}
          >
            <AlertCircle className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium">{followUp.contact.name}</h4>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
              {followUp.notes || 'No notes'}
            </p>
          </div>
          <div className="text-right">
            <div
              className={`font-medium ${isOverdue ? 'text-red-600' : 'text-amber-600'}`}
            >
              {isOverdue
                ? `${Math.abs(daysUntil)}d overdue`
                : daysUntil === 0
                ? 'Today'
                : `${daysUntil}d`}
            </div>
            <Button variant="outline" size="sm" className="mt-1">
              Mark Done
            </Button>
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
