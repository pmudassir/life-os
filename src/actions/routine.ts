'use server'

import { prisma } from '@/lib/prisma'
import { updateDailyRoutineSchema, UpdateDailyRoutineInput } from '@/lib/validators'
import { isDayWin } from '@/lib/utils/day-win'
import { startOfDay } from 'date-fns'
import { revalidatePath } from 'next/cache'
import { DsaType } from '@prisma/client'
import { requireUserId } from '@/lib/auth'

/**
 * Get or create today's routine entry
 */
export async function getOrCreateTodayRoutine() {
  const today = startOfDay(new Date())
  const userId = await requireUserId()

  // Try to find existing routine for today
  let routine = await prisma.dailyRoutine.findUnique({
    where: {
      userId_date: {
        userId,
        date: today,
      },
    },
  })

  // Create if doesn't exist
  if (!routine) {
    routine = await prisma.dailyRoutine.create({
      data: {
        userId,
        date: today,
      },
    })
  }

  return {
    ...routine,
    dayWin: isDayWin(routine),
  }
}

/**
 * Get routine for a specific date
 */
export async function getRoutineByDate(date: Date) {
  const targetDate = startOfDay(date)
  const userId = await requireUserId()
  
  const routine = await prisma.dailyRoutine.findUnique({
    where: {
      userId_date: {
        userId,
        date: targetDate,
      },
    },
  })

  if (!routine) return null

  return {
    ...routine,
    dayWin: isDayWin(routine),
  }
}

/**
 * Update a single field on today's routine (optimistic updates)
 */
export async function updateRoutineField(
  field: keyof UpdateDailyRoutineInput,
  value: boolean | number | string | DsaType | null
) {
  const today = startOfDay(new Date())
  const userId = await requireUserId()

  const validated = updateDailyRoutineSchema.parse({ [field]: value })

  const routine = await prisma.dailyRoutine.upsert({
    where: {
      userId_date: {
        userId,
        date: today,
      },
    },
    update: validated,
    create: {
      userId,
      date: today,
      ...validated,
    },
  })

  revalidatePath('/')
  revalidatePath('/week')

  return {
    ...routine,
    dayWin: isDayWin(routine),
  }
}

/**
 * Update multiple fields on a routine
 */
export async function updateRoutine(routineId: string, data: UpdateDailyRoutineInput) {
  const userId = await requireUserId()
  const validated = updateDailyRoutineSchema.parse(data)

  const existing = await prisma.dailyRoutine.findFirst({
    where: { id: routineId, userId },
    select: { id: true },
  })
  if (!existing) {
    throw new Error('Routine not found')
  }

  const routine = await prisma.dailyRoutine.update({
    where: { id: routineId },
    data: validated,
  })

  revalidatePath('/')
  revalidatePath('/week')

  return {
    ...routine,
    dayWin: isDayWin(routine),
  }
}

/**
 * Get routines for the current week (for streak calculation)
 */
export async function getRecentRoutines(days: number = 14) {
  const userId = await requireUserId()
  const endDate = startOfDay(new Date())
  const startDate = new Date(endDate)
  startDate.setDate(startDate.getDate() - days)

  const routines = await prisma.dailyRoutine.findMany({
    where: {
      userId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    orderBy: { date: 'desc' },
  })

  return routines.map((r) => ({
    ...r,
    dayWin: isDayWin(r),
  }))
}

/**
 * Get week's routines for the week view
 */
export async function getWeekRoutines(weekStart: Date, weekEnd: Date) {
  const userId = await requireUserId()
  const routines = await prisma.dailyRoutine.findMany({
    where: {
      userId,
      date: {
        gte: startOfDay(weekStart),
        lte: startOfDay(weekEnd),
      },
    },
    orderBy: { date: 'asc' },
  })

  return routines.map((r) => ({
    ...r,
    dayWin: isDayWin(r),
  }))
}

/**
 * Get missed days (prayers incomplete OR DSA skipped)
 */
export async function getMissedDays(limit: number = 30) {
  const userId = await requireUserId()
  const endDate = startOfDay(new Date())
  const startDate = new Date(endDate)
  startDate.setDate(startDate.getDate() - limit)

  const routines = await prisma.dailyRoutine.findMany({
    where: {
      userId,
      date: {
        gte: startDate,
        lt: endDate, // Exclude today
      },
      OR: [
        // Any prayer missed
        { fajrDone: false },
        { dhuhrDone: false },
        { asrDone: false },
        { maghribDone: false },
        { ishaDone: false },
        { dsaType: DsaType.NONE },
      ],
    },
    orderBy: { date: 'desc' },
  })

  return routines.map((r) => {
    const allPrayersDone = r.fajrDone && r.dhuhrDone && r.asrDone && r.maghribDone && r.ishaDone
    return {
      date: r.date,
      routine: {
        ...r,
        dayWin: isDayWin(r),
      },
      missingPrayers: !allPrayersDone,
      missingDsa: r.dsaType === DsaType.NONE,
    }
  })
}
