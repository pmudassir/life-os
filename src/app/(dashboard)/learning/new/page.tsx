import { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { auth } from '@/lib/auth'
import { createLearningResource } from '@/actions/learning'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

export const metadata: Metadata = {
  title: 'New Learning Resource | Career Tracker',
  description: 'Add a book, course, video, or other learning resource',
}

const RESOURCE_TYPES = ['BOOK', 'COURSE', 'VIDEO', 'ARTICLE', 'DOCUMENTATION', 'PODCAST'] as const
type ResourceType = (typeof RESOURCE_TYPES)[number]

function parseOptionalNumber(value: FormDataEntryValue | null): number | undefined {
  if (!value) return undefined
  const normalized = String(value).trim()
  if (!normalized) return undefined

  const parsed = Number.parseInt(normalized, 10)
  if (Number.isNaN(parsed) || parsed < 0) return undefined
  return parsed
}

async function createResourceAction(formData: FormData) {
  'use server'

  const title = String(formData.get('title') ?? '').trim()
  const type = String(formData.get('type') ?? '').trim() as ResourceType
  const author = String(formData.get('author') ?? '').trim()
  const description = String(formData.get('description') ?? '').trim()
  const targetCompletionDateRaw = String(formData.get('targetCompletionDate') ?? '').trim()

  if (!title || !RESOURCE_TYPES.includes(type)) {
    redirect('/learning/new')
  }

  await createLearningResource({
    title,
    type,
    author: author || undefined,
    description: description || undefined,
    totalPages: parseOptionalNumber(formData.get('totalPages')),
    totalChapters: parseOptionalNumber(formData.get('totalChapters')),
    totalDuration: parseOptionalNumber(formData.get('totalDuration')),
    targetCompletionDate: targetCompletionDateRaw ? new Date(targetCompletionDateRaw) : undefined,
    isFocusResource: formData.get('isFocusResource') === 'on',
  })

  redirect('/learning')
}

export default async function NewLearningResourcePage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/')
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add Learning Resource</h1>
          <p className="text-muted-foreground mt-1">Track a new book, course, video, or article.</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/learning">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Link>
        </Button>
      </div>

      <form action={createResourceAction} className="space-y-5 bg-card border rounded-2xl p-6">
        <div className="space-y-2">
          <label htmlFor="title" className="text-sm font-medium">
            Title
          </label>
          <Input id="title" name="title" placeholder="Designing Data-Intensive Applications" required />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="type" className="text-sm font-medium">
              Type
            </label>
            <select
              id="type"
              name="type"
              required
              className="h-12 w-full border-b bg-transparent px-0 text-base outline-none focus:border-black"
              defaultValue="BOOK"
            >
              {RESOURCE_TYPES.map((resourceType) => (
                <option key={resourceType} value={resourceType}>
                  {resourceType}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="author" className="text-sm font-medium">
              Author / Creator
            </label>
            <Input id="author" name="author" placeholder="Martin Kleppmann" />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="description" className="text-sm font-medium">
            Description
          </label>
          <Textarea id="description" name="description" placeholder="What are you trying to learn from this?" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label htmlFor="totalPages" className="text-sm font-medium">
              Total Pages
            </label>
            <Input id="totalPages" name="totalPages" type="number" min={0} placeholder="611" />
          </div>

          <div className="space-y-2">
            <label htmlFor="totalChapters" className="text-sm font-medium">
              Total Chapters
            </label>
            <Input id="totalChapters" name="totalChapters" type="number" min={0} placeholder="12" />
          </div>

          <div className="space-y-2">
            <label htmlFor="totalDuration" className="text-sm font-medium">
              Duration (minutes)
            </label>
            <Input id="totalDuration" name="totalDuration" type="number" min={0} placeholder="600" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="targetCompletionDate" className="text-sm font-medium">
              Target Completion Date
            </label>
            <Input id="targetCompletionDate" name="targetCompletionDate" type="date" />
          </div>

          <label className="flex items-center gap-2 text-sm font-medium pt-8">
            <input type="checkbox" name="isFocusResource" className="h-4 w-4" />
            Mark as focus resource
          </label>
        </div>

        <div className="pt-2">
          <Button type="submit">Create Resource</Button>
        </div>
      </form>
    </div>
  )
}
