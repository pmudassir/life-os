import { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { GoalTimeframe } from '@prisma/client'
import { auth, requireUserId } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

export const metadata: Metadata = {
  title: 'New Goal | Career Tracker',
  description: 'Create a new goal',
}

async function createGoalAction(formData: FormData) {
  'use server'

  const userId = await requireUserId()

  const title = String(formData.get('title') ?? '').trim()
  const timeframe = String(formData.get('timeframe') ?? '').trim() as GoalTimeframe
  const targetDateRaw = String(formData.get('targetDate') ?? '').trim()
  const description = String(formData.get('description') ?? '').trim()
  const successCriteria = String(formData.get('successCriteria') ?? '').trim()
  const unit = String(formData.get('unit') ?? '').trim()

  const targetValueRaw = String(formData.get('targetValue') ?? '').trim()
  const targetValue = targetValueRaw ? Number.parseFloat(targetValueRaw) : undefined

  if (!title || !Object.values(GoalTimeframe).includes(timeframe) || !targetDateRaw) {
    redirect('/goals/new')
  }

  await prisma.goal.create({
    data: {
      userId,
      title,
      timeframe,
      targetDate: new Date(targetDateRaw),
      description: description || undefined,
      successCriteria: successCriteria || undefined,
      targetValue: Number.isFinite(targetValue as number) ? targetValue : undefined,
      unit: unit || undefined,
    },
  })

  redirect('/goals')
}

export default async function NewGoalPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/')
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Goal</h1>
          <p className="text-muted-foreground mt-1">Add a measurable target and track your progress.</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/goals">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Link>
        </Button>
      </div>

      <form action={createGoalAction} className="space-y-5 bg-card border rounded-2xl p-6">
        <div className="space-y-2">
          <label htmlFor="title" className="text-sm font-medium">
            Title
          </label>
          <Input id="title" name="title" placeholder="Publish 12 technical posts" required />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="timeframe" className="text-sm font-medium">
              Timeframe
            </label>
            <select
              id="timeframe"
              name="timeframe"
              defaultValue={GoalTimeframe.MONTHLY}
              className="h-12 w-full border-b bg-transparent px-0 text-base outline-none focus:border-black"
            >
              {Object.values(GoalTimeframe).map((value) => (
                <option key={value} value={value}>
                  {value.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="targetDate" className="text-sm font-medium">
              Target Date
            </label>
            <Input id="targetDate" name="targetDate" type="date" required />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="description" className="text-sm font-medium">
            Description
          </label>
          <Textarea id="description" name="description" placeholder="Why this goal matters and what success looks like." />
        </div>

        <div className="space-y-2">
          <label htmlFor="successCriteria" className="text-sm font-medium">
            Success Criteria
          </label>
          <Textarea id="successCriteria" name="successCriteria" placeholder="Clear criteria to evaluate completion." />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="targetValue" className="text-sm font-medium">
              Target Value (optional)
            </label>
            <Input id="targetValue" name="targetValue" type="number" min="0" step="0.01" placeholder="12" />
          </div>

          <div className="space-y-2">
            <label htmlFor="unit" className="text-sm font-medium">
              Unit (optional)
            </label>
            <Input id="unit" name="unit" placeholder="posts, hours, users..." />
          </div>
        </div>

        <div className="pt-2">
          <Button type="submit">Create Goal</Button>
        </div>
      </form>
    </div>
  )
}
