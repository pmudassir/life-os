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

/**
 * Get days with incomplete habits (last 30 days)
 */
export async function getMissedHabitDays(limit: number = 30) {
  const endDate = startOfDay(new Date())
  const startDate = new Date(endDate)
  startDate.setDate(startDate.getDate() - limit)

  // Fetch all habits and their logs for the range
  const habits = await prisma.habit.findMany({
    where: { userId: TEMP_USER_ID, archived: false },
    include: {
      logs: {
        where: {
          date: { gte: startDate, lt: endDate },
          completed: true
        }
      }
    }
  })

  const missedDaysMap = new Map<string, { date: Date, missedHabits: { title: string, section: string }[] }>()

  // Iterate over each day in the range
  for (let d = new Date(startDate); d < endDate; d.setDate(d.getDate() + 1)) {
    const dayDate = new Date(d)
    const dayStr = dayDate.toISOString().split('T')[0]
    const dayOfWeek = getDay(dayDate)

    const scheduledForDay = habits.filter(habit => {
      if (habit.frequency === FrequencyType.DAILY) return true
      if (habit.frequency === FrequencyType.WEEKDAYS) return dayOfWeek >= 1 && dayOfWeek <= 5
      if (habit.frequency === FrequencyType.WEEKENDS) return dayOfWeek === 0 || dayOfWeek === 6
      if (habit.frequency === FrequencyType.CUSTOM) return habit.customDays.includes(dayOfWeek)
      return false
    })

    const missed = scheduledForDay.filter(habit => {
        const log = habit.logs.find(l => startOfDay(new Date(l.date)).getTime() === startOfDay(dayDate).getTime())
        return !log || !log.completed
    })

    if (missed.length > 0) {
      missedDaysMap.set(dayStr, {
        date: dayDate,
        missedHabits: missed.map(m => ({ title: m.title, section: m.section }))
      })
    }
  }

  return Array.from(missedDaysMap.values()).sort((a, b) => b.date.getTime() - a.date.getTime())
}
