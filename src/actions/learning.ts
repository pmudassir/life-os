'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { requireUserId } from '@/lib/auth'

interface LogLearningSessionInput {
  resourceId: string
  pagesRead?: number
  chaptersCompleted?: number
  notes?: string
  duration?: number // in minutes
}

export async function logLearningSession(input: LogLearningSessionInput) {
  try {
    const userId = await requireUserId()

    // Get the resource to calculate new progress
    const resource = await prisma.learningResource.findFirst({
      where: { id: input.resourceId, userId },
    })

    if (!resource) {
      throw new Error('Resource not found')
    }

    // Create the session
    const session = await prisma.learningSession.create({
      data: {
        resourceId: input.resourceId,
        userId,
        pagesRead: input.pagesRead,
        chaptersCompleted: input.chaptersCompleted,
        notes: input.notes,
        duration: input.duration || 0,
        endTime: new Date(),
      },
    })

    // Update resource progress
    const newPage = input.pagesRead 
      ? resource.currentPage + input.pagesRead 
      : resource.currentPage
    const newChapter = input.chaptersCompleted
      ? resource.currentChapter + input.chaptersCompleted
      : resource.currentChapter

    // Determine if completed
    const isCompleted = resource.totalPages 
      ? newPage >= resource.totalPages
      : resource.totalChapters
      ? newChapter >= resource.totalChapters
      : false

    await prisma.learningResource.update({
      where: { id: input.resourceId },
      data: {
        currentPage: newPage,
        currentChapter: newChapter,
        status: isCompleted ? 'COMPLETED' : 'IN_PROGRESS',
        completedDate: isCompleted ? new Date() : null,
      },
    })

    revalidatePath('/learning')
    return { success: true, session }
  } catch (error) {
    console.error('Failed to log learning session:', error)
    throw error
  }
}

interface CreateLearningResourceInput {
  title: string
  author?: string
  type: 'BOOK' | 'COURSE' | 'VIDEO' | 'ARTICLE' | 'DOCUMENTATION' | 'PODCAST'
  totalPages?: number
  totalChapters?: number
  totalDuration?: number
  description?: string
  targetCompletionDate?: Date
  isFocusResource?: boolean
}

export async function createLearningResource(input: CreateLearningResourceInput) {
  try {
    const userId = await requireUserId()
    const resource = await prisma.learningResource.create({
      data: {
        userId,
        title: input.title,
        author: input.author,
        type: input.type,
        totalPages: input.totalPages,
        totalChapters: input.totalChapters,
        totalDuration: input.totalDuration,
        description: input.description,
        targetCompletionDate: input.targetCompletionDate,
        isFocusResource: input.isFocusResource || false,
        status: 'NOT_STARTED',
      },
    })

    revalidatePath('/learning')
    return { success: true, resource }
  } catch (error) {
    console.error('Failed to create learning resource:', error)
    throw error
  }
}

interface UpdateResourceProgressInput {
  resourceId: string
  currentPage?: number
  currentChapter?: number
  status?: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD'
}

export async function updateResourceProgress(input: UpdateResourceProgressInput) {
  try {
    const userId = await requireUserId()
    const existing = await prisma.learningResource.findFirst({
      where: { id: input.resourceId, userId },
      select: { id: true },
    })
    if (!existing) {
      throw new Error('Resource not found')
    }

    const resource = await prisma.learningResource.update({
      where: { id: input.resourceId },
      data: {
        currentPage: input.currentPage,
        currentChapter: input.currentChapter,
        status: input.status,
        completedDate: input.status === 'COMPLETED' ? new Date() : undefined,
      },
    })

    revalidatePath('/learning')
    return { success: true, resource }
  } catch (error) {
    console.error('Failed to update resource progress:', error)
    throw error
  }
}

interface CreateSkillInput {
  name: string
  category: string
  description?: string
  currentLevel?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT'
  targetLevel?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT'
}

export async function createSkill(input: CreateSkillInput) {
  try {
    const userId = await requireUserId()
    const skill = await prisma.skill.create({
      data: {
        userId,
        name: input.name,
        category: input.category,
        description: input.description,
        currentLevel: input.currentLevel || 'BEGINNER',
        targetLevel: input.targetLevel || 'INTERMEDIATE',
      },
    })

    revalidatePath('/learning')
    return { success: true, skill }
  } catch (error) {
    console.error('Failed to create skill:', error)
    throw error
  }
}

interface UpdateSkillProgressInput {
  skillId: string
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT'
  notes?: string
  evidence?: string
}

export async function updateSkillProgress(input: UpdateSkillProgressInput) {
  try {
    const userId = await requireUserId()
    const existingSkill = await prisma.skill.findFirst({
      where: { id: input.skillId, userId },
      select: { id: true },
    })
    if (!existingSkill) {
      throw new Error('Skill not found')
    }

    // Create progress record
    await prisma.skillProgress.create({
      data: {
        skillId: input.skillId,
        userId,
        level: input.level,
        notes: input.notes,
        evidence: input.evidence,
      },
    })

    // Update skill current level
    const skill = await prisma.skill.update({
      where: { id: input.skillId },
      data: {
        currentLevel: input.level,
      },
    })

    revalidatePath('/learning')
    return { success: true, skill }
  } catch (error) {
    console.error('Failed to update skill progress:', error)
    throw error
  }
}

// Pre-populate DDIA structure
export async function createDDIAStructure(userId?: string) {
  const chapters = [
    { number: 1, title: 'Reliable, Scalable, and Maintainable Applications', pages: 25 },
    { number: 2, title: 'Data Models and Query Languages', pages: 35 },
    { number: 3, title: 'Storage and Retrieval', pages: 40 },
    { number: 4, title: 'Encoding and Evolution', pages: 30 },
    { number: 5, title: 'Replication', pages: 35 },
    { number: 6, title: 'Partitioning', pages: 30 },
    { number: 7, title: 'Transactions', pages: 45 },
    { number: 8, title: 'The Trouble with Distributed Systems', pages: 40 },
    { number: 9, title: 'Consistency and Consensus', pages: 50 },
    { number: 10, title: 'Batch Processing', pages: 40 },
    { number: 11, title: 'Stream Processing', pages: 45 },
    { number: 12, title: 'The Future of Data Systems', pages: 30 },
  ]

  try {
    const currentUserId = await requireUserId()
    if (userId && userId !== currentUserId) {
      throw new Error('Unauthorized')
    }

    // Create main DDIA resource
    const ddia = await prisma.learningResource.create({
      data: {
        userId: currentUserId,
        title: 'Designing Data-Intensive Applications',
        author: 'Martin Kleppmann',
        type: 'BOOK',
        totalPages: 611,
        totalChapters: 12,
        description: 'The big ideas behind reliable, scalable, and maintainable systems',
        isFocusResource: true,
        status: 'NOT_STARTED',
      },
    })

    // Create learning notes for each chapter
    for (const chapter of chapters) {
      await prisma.learningNote.create({
        data: {
          userId: currentUserId,
          resourceId: ddia.id,
          chapter: chapter.number,
          content: `# Chapter ${chapter.number}: ${chapter.title}\n\n## Key Concepts\n\n## Summary\n\n## How to Apply\n\n## Questions\n`,
          isKeyIdea: false,
        },
      })
    }

    revalidatePath('/learning')
    return { success: true, resource: ddia }
  } catch (error) {
    console.error('Failed to create DDIA structure:', error)
    throw error
  }
}
