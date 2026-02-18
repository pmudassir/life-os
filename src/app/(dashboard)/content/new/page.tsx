import { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { ContentPlatform, ContentStatus, ContentType } from '@prisma/client'
import { auth, requireUserId } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

export const metadata: Metadata = {
  title: 'New Content | Career Tracker',
  description: 'Create a new content draft',
}

async function createContentAction(formData: FormData) {
  'use server'

  const userId = await requireUserId()

  const title = String(formData.get('title') ?? '').trim()
  const type = String(formData.get('type') ?? '').trim() as ContentType
  const platform = String(formData.get('platform') ?? '').trim() as ContentPlatform
  const content = String(formData.get('content') ?? '').trim()
  const scheduledDateRaw = String(formData.get('scheduledDate') ?? '').trim()

  if (!title || !Object.values(ContentType).includes(type) || !Object.values(ContentPlatform).includes(platform)) {
    redirect('/content/new')
  }

  await prisma.contentPiece.create({
    data: {
      userId,
      title,
      type,
      platform,
      content: content || undefined,
      status: scheduledDateRaw ? ContentStatus.SCHEDULED : ContentStatus.DRAFT,
      scheduledDate: scheduledDateRaw ? new Date(scheduledDateRaw) : undefined,
    },
  })

  redirect('/content')
}

export default async function NewContentPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/')
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Content</h1>
          <p className="text-muted-foreground mt-1">Create a draft or schedule your next piece.</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/content">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Link>
        </Button>
      </div>

      <form action={createContentAction} className="space-y-5 bg-card border rounded-2xl p-6">
        <div className="space-y-2">
          <label htmlFor="title" className="text-sm font-medium">
            Title
          </label>
          <Input id="title" name="title" placeholder="How I built my weekly learning system" required />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="type" className="text-sm font-medium">
              Content Type
            </label>
            <select
              id="type"
              name="type"
              defaultValue={ContentType.LINKEDIN_POST}
              className="h-12 w-full border-b bg-transparent px-0 text-base outline-none focus:border-black"
            >
              {Object.values(ContentType).map((value) => (
                <option key={value} value={value}>
                  {value.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="platform" className="text-sm font-medium">
              Platform
            </label>
            <select
              id="platform"
              name="platform"
              defaultValue={ContentPlatform.LINKEDIN}
              className="h-12 w-full border-b bg-transparent px-0 text-base outline-none focus:border-black"
            >
              {Object.values(ContentPlatform).map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="content" className="text-sm font-medium">
            Draft Content
          </label>
          <Textarea id="content" name="content" placeholder="Write your draft outline or full content..." className="min-h-32" />
        </div>

        <div className="space-y-2">
          <label htmlFor="scheduledDate" className="text-sm font-medium">
            Scheduled Date (optional)
          </label>
          <Input id="scheduledDate" name="scheduledDate" type="date" />
        </div>

        <div className="pt-2">
          <Button type="submit">Save Content</Button>
        </div>
      </form>
    </div>
  )
}
