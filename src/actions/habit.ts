'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { startOfDay, getDay } from 'date-fns'
import { FrequencyType } from '@prisma/client'

// Use the same temp user ID as routine.ts
const TEMP_USER_ID = 'temp-user-001'

export type CreateHabitInput = {
  title: string
  description?: string
  icon?: string
  color?: string
  frequency: FrequencyType
  customDays?: number[]
  section?: string
}

/**
 * Create a new habit
 */
export async function createHabit(data: CreateHabitInput) {
  const habit = await prisma.habit.create({
    data: {
      userId: TEMP_USER_ID,
      title: data.title,
      description: data.description,
      icon: data.icon,
      color: data.color || 'violet',
      frequency: data.frequency,
      customDays: data.customDays || [],
      section: data.section || 'Morning',
      // Auto-order: append to end of section
      order: 999, 
    },
  })

  revalidatePath('/')
  return habit
}

/**
 * Toggle habit completion for a specific date
 */
export async function toggleHabit(habitId: string, date: Date, completed: boolean) {
  const targetDate = startOfDay(date)

  const log = await prisma.habitLog.upsert({
    where: {
      habitId_date: {
        habitId,
        date: targetDate,
      },
    },
    update: {
      completed,
    },
    create: {
      habitId,
      date: targetDate,
      completed,
    },
  })

  revalidatePath('/')
  return log
}

/**
 * Get all habits for the user, including today's status
 */
export async function getDayHabits(date: Date) {
  const targetDate = startOfDay(date)
  const dayOfWeek = getDay(targetDate) // 0 = Sun, 6 = Sat

  // Fetch all enabled habits
  const allHabits = await prisma.habit.findMany({
    where: {
      userId: TEMP_USER_ID,
      archived: false,
    },
    include: {
      logs: {
        where: {
          date: targetDate,
        },
      },
    },
    orderBy: {
      order: 'asc',
    },
  })

  // Filter based on schedule
  const scheduledHabits = allHabits.filter(habit => {
    if (habit.frequency === FrequencyType.DAILY) return true
    if (habit.frequency === FrequencyType.WEEKDAYS) return dayOfWeek >= 1 && dayOfWeek <= 5
    if (habit.frequency === FrequencyType.WEEKENDS) return dayOfWeek === 0 || dayOfWeek === 6
    if (habit.frequency === FrequencyType.CUSTOM) return habit.customDays.includes(dayOfWeek)
    return false
  })

  return scheduledHabits.map(habit => ({
    ...habit,
    completed: habit.logs[0]?.completed || false,
  }))
}
