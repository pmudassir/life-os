import { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { ContactType } from '@prisma/client'
import { auth } from '@/lib/auth'
import { createContact } from '@/actions/network'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

export const metadata: Metadata = {
  title: 'New Contact | Career Tracker',
  description: 'Add a new contact to your network',
}

async function createContactAction(formData: FormData) {
  'use server'

  const name = String(formData.get('name') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim()
  const linkedIn = String(formData.get('linkedIn') ?? '').trim()
  const company = String(formData.get('company') ?? '').trim()
  const role = String(formData.get('role') ?? '').trim()
  const type = String(formData.get('type') ?? '').trim() as ContactType
  const howWeMet = String(formData.get('howWeMet') ?? '').trim()
  const lastContactRaw = String(formData.get('lastContact') ?? '').trim()
  const notes = String(formData.get('notes') ?? '').trim()

  if (!name || !Object.values(ContactType).includes(type)) {
    redirect('/network/new')
  }

  try {
    await createContact({
      name,
      email: email || undefined,
      linkedIn: linkedIn || undefined,
      company: company || undefined,
      role: role || undefined,
      type,
      howWeMet: howWeMet || undefined,
      lastContact: lastContactRaw ? new Date(lastContactRaw) : undefined,
      notes: notes || undefined,
    })
  } catch {
    redirect('/network/new')
  }

  redirect('/network')
}

export default async function NewContactPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/')
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add Contact</h1>
          <p className="text-muted-foreground mt-1">Grow your network and track meaningful relationships.</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/network">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Link>
        </Button>
      </div>

      <form action={createContactAction} className="space-y-5 bg-card border rounded-2xl p-6">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium">
            Name
          </label>
          <Input id="name" name="name" placeholder="Jane Doe" required />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <Input id="email" name="email" type="email" placeholder="jane@company.com" />
          </div>
          <div className="space-y-2">
            <label htmlFor="linkedIn" className="text-sm font-medium">
              LinkedIn URL
            </label>
            <Input id="linkedIn" name="linkedIn" type="url" placeholder="https://linkedin.com/in/..." />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="company" className="text-sm font-medium">
              Company
            </label>
            <Input id="company" name="company" placeholder="Acme Inc." />
          </div>
          <div className="space-y-2">
            <label htmlFor="role" className="text-sm font-medium">
              Role
            </label>
            <Input id="role" name="role" placeholder="Engineering Manager" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="type" className="text-sm font-medium">
              Relationship Type
            </label>
            <select
              id="type"
              name="type"
              defaultValue={ContactType.PEER}
              className="h-12 w-full border-b bg-transparent px-0 text-base outline-none focus:border-black"
            >
              {Object.values(ContactType).map((value) => (
                <option key={value} value={value}>
                  {value.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label htmlFor="lastContact" className="text-sm font-medium">
              Last Contact Date
            </label>
            <Input id="lastContact" name="lastContact" type="date" />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="howWeMet" className="text-sm font-medium">
            How You Met
          </label>
          <Input id="howWeMet" name="howWeMet" placeholder="Conference, LinkedIn, referral..." />
        </div>

        <div className="space-y-2">
          <label htmlFor="notes" className="text-sm font-medium">
            Notes
          </label>
          <Textarea id="notes" name="notes" placeholder="Topics discussed, follow-up ideas, context..." />
        </div>

        <div className="pt-2">
          <Button type="submit">Save Contact</Button>
        </div>
      </form>
    </div>
  )
}
