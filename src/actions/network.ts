'use server'

import { z } from 'zod'
import { ContactType } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireUserId } from '@/lib/auth'

const createContactSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().optional(),
  linkedIn: z.string().trim().url().optional(),
  company: z.string().trim().max(120).optional(),
  role: z.string().trim().max(120).optional(),
  type: z.nativeEnum(ContactType),
  howWeMet: z.string().trim().max(250).optional(),
  lastContact: z.coerce.date().optional(),
  notes: z.string().trim().max(1000).optional(),
})

export type CreateContactInput = z.infer<typeof createContactSchema>

export async function createContact(input: CreateContactInput) {
  const userId = await requireUserId()
  const parsed = createContactSchema.parse(input)

  const contact = await prisma.contact.create({
    data: {
      userId,
      name: parsed.name,
      email: parsed.email,
      linkedIn: parsed.linkedIn,
      company: parsed.company,
      role: parsed.role,
      type: parsed.type,
      howWeMet: parsed.howWeMet,
      lastContact: parsed.lastContact,
      notes: parsed.notes,
    },
  })

  revalidatePath('/network')
  return contact
}
