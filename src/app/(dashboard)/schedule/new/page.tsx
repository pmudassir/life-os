import { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { auth } from '@/lib/auth'
import { createTimeBlock } from '@/actions/schedule'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

export const metadata: Metadata = {
  title: 'New Time Block | Career Tracker',
  description: 'Schedule a focused time block for your week',
}

type NewSchedulePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

async function createTimeBlockAction(formData: FormData) {
  'use server'

  const title = String(formData.get('title') ?? '').trim()
  const dateRaw = String(formData.get('date') ?? '').trim()
  const startTime = String(formData.get('startTime') ?? '').trim()
  const endTime = String(formData.get('endTime') ?? '').trim()
  const category = String(formData.get('category') ?? '').trim()
  const color = String(formData.get('color') ?? '').trim()
  const description = String(formData.get('description') ?? '').trim()

  if (!title || !dateRaw || !startTime || !endTime || !category) {
    redirect('/schedule/new')
  }

  try {
    await createTimeBlock({
      title,
      date: new Date(dateRaw),
      startTime,
      endTime,
      category,
      color: color || undefined,
      description: description || undefined,
    })
  } catch {
    redirect('/schedule/new')
  }

  redirect('/schedule')
}

export default async function NewSchedulePage({ searchParams }: NewSchedulePageProps) {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/')
  }

  const params = await searchParams
  const defaultCategory =
    typeof params.category === 'string' && params.category.trim() ? params.category.trim() : 'deep_work'
  const defaultTitle =
    typeof params.title === 'string' && params.title.trim() ? params.title.trim() : ''
  const defaultDate = new Date().toISOString().slice(0, 10)

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add Time Block</h1>
          <p className="text-muted-foreground mt-1">Create a focused block and keep your week intentional.</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/schedule">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Link>
        </Button>
      </div>

      <form action={createTimeBlockAction} className="space-y-5 bg-card border rounded-2xl p-6">
        <div className="space-y-2">
          <label htmlFor="title" className="text-sm font-medium">
            Block Title
          </label>
          <Input id="title" name="title" defaultValue={defaultTitle} placeholder="Deep Work - System Design" required />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="date" className="text-sm font-medium">
              Date
            </label>
            <Input id="date" name="date" type="date" defaultValue={defaultDate} required />
          </div>

          <div className="space-y-2">
            <label htmlFor="category" className="text-sm font-medium">
              Category
            </label>
            <select
              id="category"
              name="category"
              defaultValue={defaultCategory}
              className="h-12 w-full border-b bg-transparent px-0 text-base outline-none focus:border-black"
            >
              <option value="deep_work">Deep Work</option>
              <option value="learning">Learning</option>
              <option value="meetings">Meetings</option>
              <option value="work">Work</option>
              <option value="exercise">Exercise</option>
              <option value="break">Break</option>
              <option value="content">Content</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="startTime" className="text-sm font-medium">
              Start Time
            </label>
            <Input id="startTime" name="startTime" type="time" defaultValue="09:00" required />
          </div>

          <div className="space-y-2">
            <label htmlFor="endTime" className="text-sm font-medium">
              End Time
            </label>
            <Input id="endTime" name="endTime" type="time" defaultValue="10:30" required />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="color" className="text-sm font-medium">
              Color (optional)
            </label>
            <Input id="color" name="color" placeholder="purple" />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="description" className="text-sm font-medium">
            Description (optional)
          </label>
          <Textarea id="description" name="description" placeholder="Context or objective for this block." />
        </div>

        <div className="pt-2">
          <Button type="submit">Save Block</Button>
        </div>
      </form>
    </div>
  )
}
