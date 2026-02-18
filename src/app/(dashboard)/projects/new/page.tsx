import { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { ProjectStatus, ProjectType } from '@prisma/client'
import { auth, requireUserId } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

export const metadata: Metadata = {
  title: 'New Project | Career Tracker',
  description: 'Create a new project',
}

async function createProjectAction(formData: FormData) {
  'use server'

  const userId = await requireUserId()

  const name = String(formData.get('name') ?? '').trim()
  const type = String(formData.get('type') ?? '').trim() as ProjectType
  const status = String(formData.get('status') ?? '').trim() as ProjectStatus
  const description = String(formData.get('description') ?? '').trim()
  const estimatedHoursRaw = String(formData.get('estimatedHours') ?? '').trim()
  const targetEndDateRaw = String(formData.get('targetEndDate') ?? '').trim()

  const estimatedHours = estimatedHoursRaw ? Number.parseInt(estimatedHoursRaw, 10) : undefined

  if (!name || !Object.values(ProjectType).includes(type) || !Object.values(ProjectStatus).includes(status)) {
    redirect('/projects/new')
  }

  await prisma.project.create({
    data: {
      userId,
      name,
      type,
      status,
      description: description || undefined,
      estimatedHours: Number.isFinite(estimatedHours as number) ? estimatedHours : undefined,
      targetEndDate: targetEndDateRaw ? new Date(targetEndDateRaw) : undefined,
    },
  })

  redirect('/projects')
}

export default async function NewProjectPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/')
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Project</h1>
          <p className="text-muted-foreground mt-1">Track a project with goals, metrics, and time.</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/projects">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Link>
        </Button>
      </div>

      <form action={createProjectAction} className="space-y-5 bg-card border rounded-2xl p-6">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium">
            Project Name
          </label>
          <Input id="name" name="name" placeholder="AI Interview Assistant" required />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="type" className="text-sm font-medium">
              Type
            </label>
            <select
              id="type"
              name="type"
              defaultValue={ProjectType.PERSONAL}
              className="h-12 w-full border-b bg-transparent px-0 text-base outline-none focus:border-black"
            >
              {Object.values(ProjectType).map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="status" className="text-sm font-medium">
              Status
            </label>
            <select
              id="status"
              name="status"
              defaultValue={ProjectStatus.PLANNING}
              className="h-12 w-full border-b bg-transparent px-0 text-base outline-none focus:border-black"
            >
              {Object.values(ProjectStatus).map((value) => (
                <option key={value} value={value}>
                  {value.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="description" className="text-sm font-medium">
            Description
          </label>
          <Textarea id="description" name="description" placeholder="What are you building and why?" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="estimatedHours" className="text-sm font-medium">
              Estimated Hours (optional)
            </label>
            <Input id="estimatedHours" name="estimatedHours" type="number" min="0" step="1" placeholder="80" />
          </div>

          <div className="space-y-2">
            <label htmlFor="targetEndDate" className="text-sm font-medium">
              Target End Date (optional)
            </label>
            <Input id="targetEndDate" name="targetEndDate" type="date" />
          </div>
        </div>

        <div className="pt-2">
          <Button type="submit">Create Project</Button>
        </div>
      </form>
    </div>
  )
}
