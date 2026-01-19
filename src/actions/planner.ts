'use server'

import { prisma } from '@/lib/prisma'
import { 
  createDailyPlannerSchema, 
  updateDailyPlannerSchema,
  CreateDailyPlannerInput,
  UpdateDailyPlannerInput 
} from '@/lib/validators'
import { startOfDay } from 'date-fns'
import { revalidatePath } from 'next/cache'

// Temporary user ID until auth is set up
const TEMP_USER_ID = 'temp-user-001'

/**
 * Get today's planner entry with its roadmap topic
 */
export async function getTodayPlanner() {
  const today = startOfDay(new Date())

  const planner = await prisma.dailyPlanner.findFirst({
    where: {
      userId: TEMP_USER_ID,
      date: today,
    },
    include: {
      roadmapTopic: true,
    },
  })

  return planner
}

/**
 * Get planner for a specific date
 */
export async function getPlannerByDate(date: Date) {
  const targetDate = startOfDay(date)

  const planner = await prisma.dailyPlanner.findFirst({
    where: {
      userId: TEMP_USER_ID,
      date: targetDate,
    },
    include: {
      roadmapTopic: true,
    },
  })

  return planner
}

/**
 * Create a daily planner entry
 */
export async function createDailyPlanner(data: CreateDailyPlannerInput) {
  const validated = createDailyPlannerSchema.parse(data)

  const planner = await prisma.dailyPlanner.create({
    data: {
      ...validated,
      date: startOfDay(validated.date),
      userId: TEMP_USER_ID,
    },
    include: {
      roadmapTopic: true,
    },
  })

  revalidatePath('/')
  return planner
}

/**
 * Update a daily planner entry
 */
export async function updateDailyPlanner(id: string, data: UpdateDailyPlannerInput) {
  const validated = updateDailyPlannerSchema.parse(data)

  const planner = await prisma.dailyPlanner.update({
    where: { id },
    data: validated,
    include: {
      roadmapTopic: true,
    },
  })

  revalidatePath('/')
  return planner
}

/**
 * Mark today's planner as completed
 */
export async function completeTodayPlanner() {
  const planner = await getTodayPlanner()
  if (!planner) return null

  return updateDailyPlanner(planner.id, { completed: true })
}

/**
 * Delete a daily planner entry
 */
export async function deleteDailyPlanner(id: string) {
  await prisma.dailyPlanner.delete({
    where: { id },
  })

  revalidatePath('/')
}
