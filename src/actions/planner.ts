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
import { requireUserId } from '@/lib/auth'

/**
 * Get today's planner entry with its roadmap topic
 */
export async function getTodayPlanner() {
  const userId = await requireUserId()
  const today = startOfDay(new Date())

  const planner = await prisma.dailyPlanner.findFirst({
    where: {
      userId,
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
  const userId = await requireUserId()
  const targetDate = startOfDay(date)

  const planner = await prisma.dailyPlanner.findFirst({
    where: {
      userId,
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
  const userId = await requireUserId()
  const validated = createDailyPlannerSchema.parse(data)

  const topic = await prisma.roadmapTopic.findFirst({
    where: { id: validated.roadmapTopicId, userId },
    select: { id: true },
  })
  if (!topic) {
    throw new Error('Roadmap topic not found')
  }

  const planner = await prisma.dailyPlanner.create({
    data: {
      ...validated,
      date: startOfDay(validated.date),
      userId,
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
  const userId = await requireUserId()
  const validated = updateDailyPlannerSchema.parse(data)

  const existing = await prisma.dailyPlanner.findFirst({
    where: { id, userId },
    select: { id: true },
  })
  if (!existing) {
    throw new Error('Planner entry not found')
  }

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
  const userId = await requireUserId()
  const existing = await prisma.dailyPlanner.findFirst({
    where: { id, userId },
    select: { id: true },
  })
  if (!existing) {
    throw new Error('Planner entry not found')
  }

  await prisma.dailyPlanner.delete({
    where: { id },
  })

  revalidatePath('/')
}
