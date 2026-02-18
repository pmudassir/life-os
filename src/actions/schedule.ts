'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireUserId } from '@/lib/auth'

const createTimeBlockSchema = z.object({
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().max(500).optional(),
  date: z.coerce.date(),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
  category: z.string().trim().min(1).max(50),
  color: z.string().trim().max(40).optional(),
})

export type CreateTimeBlockInput = z.infer<typeof createTimeBlockSchema>

const categoryColorMap: Record<string, string> = {
  deep_work: 'purple',
  learning: 'blue',
  meetings: 'orange',
  exercise: 'green',
  break: 'gray',
  work: 'indigo',
  content: 'pink',
}

function timeToMinutes(value: string): number {
  const [hour, minute] = value.split(':').map(Number)
  return hour * 60 + minute
}

export async function createTimeBlock(input: CreateTimeBlockInput) {
  const userId = await requireUserId()
  const parsed = createTimeBlockSchema.parse(input)

  const startMinutes = timeToMinutes(parsed.startTime)
  const endMinutes = timeToMinutes(parsed.endTime)
  const duration = endMinutes - startMinutes
  if (duration <= 0) {
    throw new Error('End time must be after start time')
  }

  const normalizedCategory = parsed.category.toLowerCase().replace(/\s+/g, '_')
  const color = parsed.color || categoryColorMap[normalizedCategory] || 'blue'

  const block = await prisma.timeBlock.create({
    data: {
      userId,
      title: parsed.title,
      description: parsed.description,
      date: parsed.date,
      startTime: parsed.startTime,
      endTime: parsed.endTime,
      duration,
      category: normalizedCategory,
      color,
    },
  })

  revalidatePath('/schedule')
  return block
}
