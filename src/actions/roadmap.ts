'use server'

import { prisma } from '@/lib/prisma'
import { 
  createRoadmapTopicSchema, 
  updateRoadmapTopicSchema,
  CreateRoadmapTopicInput,
  UpdateRoadmapTopicInput 
} from '@/lib/validators'
import { revalidatePath } from 'next/cache'
import { TopicCategory, TopicStatus } from '@prisma/client'

// Temporary user ID until auth is set up
const TEMP_USER_ID = 'temp-user-001'

/**
 * Get all roadmap topics grouped by phase
 */
export async function getRoadmapTopics(category?: TopicCategory) {
  const where = category 
    ? { userId: TEMP_USER_ID, category } 
    : { userId: TEMP_USER_ID }

  const topics = await prisma.roadmapTopic.findMany({
    where,
    orderBy: [{ phase: 'asc' }, { order: 'asc' }, { createdAt: 'asc' }],
  })

  const phase1 = topics.filter((t) => t.phase === 1)
  const phase2 = topics.filter((t) => t.phase === 2)
  const phase3 = topics.filter((t) => t.phase === 3)

  const total = topics.length
  const done = topics.filter((t) => t.status === TopicStatus.DONE).length
  const inProgress = topics.filter((t) => t.status === TopicStatus.IN_PROGRESS).length
  const notStarted = topics.filter((t) => t.status === TopicStatus.NOT_STARTED).length

  return {
    topics,
    byPhase: { phase1, phase2, phase3 },
    progress: { total, done, inProgress, notStarted },
  }
}

/**
 * Get a single roadmap topic
 */
export async function getRoadmapTopic(id: string) {
  return prisma.roadmapTopic.findUnique({
    where: { id },
  })
}

/**
 * Create a new roadmap topic
 */
export async function createRoadmapTopic(data: CreateRoadmapTopicInput) {
  const validated = createRoadmapTopicSchema.parse(data)

  const topic = await prisma.roadmapTopic.create({
    data: {
      ...validated,
      userId: TEMP_USER_ID,
    },
  })

  revalidatePath('/roadmap')
  return topic
}

/**
 * Update a roadmap topic
 */
export async function updateRoadmapTopic(id: string, data: UpdateRoadmapTopicInput) {
  const validated = updateRoadmapTopicSchema.parse(data)

  const topic = await prisma.roadmapTopic.update({
    where: { id },
    data: validated,
  })

  revalidatePath('/roadmap')
  return topic
}

/**
 * Mark a topic as in progress
 */
export async function startTopic(id: string) {
  return updateRoadmapTopic(id, { status: TopicStatus.IN_PROGRESS })
}

/**
 * Mark a topic as done
 */
export async function completeTopic(id: string) {
  return updateRoadmapTopic(id, { status: TopicStatus.DONE })
}

/**
 * Delete a roadmap topic
 */
export async function deleteRoadmapTopic(id: string) {
  await prisma.roadmapTopic.delete({
    where: { id },
  })

  revalidatePath('/roadmap')
}

/**
 * Get the next topic to work on (first in-progress, then first not-started)
 */
export async function getNextTopic(category?: TopicCategory) {
  // First, check for in-progress topics
  const inProgress = await prisma.roadmapTopic.findFirst({
    where: {
      userId: TEMP_USER_ID,
      status: TopicStatus.IN_PROGRESS,
      ...(category ? { category } : {}),
    },
    orderBy: [{ phase: 'asc' }, { order: 'asc' }],
  })

  if (inProgress) return inProgress

  // Otherwise, get the first not-started topic
  return prisma.roadmapTopic.findFirst({
    where: {
      userId: TEMP_USER_ID,
      status: TopicStatus.NOT_STARTED,
      ...(category ? { category } : {}),
    },
    orderBy: [{ phase: 'asc' }, { order: 'asc' }],
  })
}
