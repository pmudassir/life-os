import { z } from 'zod'
import { DsaType, TopicCategory, Difficulty, TopicStatus, PlannedTime } from '@prisma/client'

// ============================================================================
// DAILY ROUTINE
// ============================================================================

export const createDailyRoutineSchema = z.object({
  date: z.coerce.date(),
})

export const updateDailyRoutineSchema = z.object({
  fajrDone: z.boolean().optional(),
  gymDone: z.boolean().optional(),
  dsaType: z.nativeEnum(DsaType).optional(),
  workDone: z.boolean().optional(),
  instituteDone: z.boolean().optional(),
  freelanceDone: z.boolean().optional(),
  readingPages: z.number().int().min(0).optional(),
  footballDone: z.boolean().optional(),
  allPrayersDone: z.boolean().optional(),
  dayRating: z.number().int().min(1).max(5).optional().nullable(),
  notes: z.string().optional().nullable(),
})

export type CreateDailyRoutineInput = z.infer<typeof createDailyRoutineSchema>
export type UpdateDailyRoutineInput = z.infer<typeof updateDailyRoutineSchema>

// ============================================================================
// ROADMAP TOPIC
// ============================================================================

export const createRoadmapTopicSchema = z.object({
  title: z.string().min(1).max(200),
  category: z.nativeEnum(TopicCategory),
  difficulty: z.nativeEnum(Difficulty),
  phase: z.number().int().min(1).max(3),
  notes: z.string().optional().nullable(),
  order: z.number().int().optional(),
})

export const updateRoadmapTopicSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  category: z.nativeEnum(TopicCategory).optional(),
  difficulty: z.nativeEnum(Difficulty).optional(),
  phase: z.number().int().min(1).max(3).optional(),
  status: z.nativeEnum(TopicStatus).optional(),
  notes: z.string().optional().nullable(),
  order: z.number().int().optional(),
})

export type CreateRoadmapTopicInput = z.infer<typeof createRoadmapTopicSchema>
export type UpdateRoadmapTopicInput = z.infer<typeof updateRoadmapTopicSchema>

// ============================================================================
// DAILY PLANNER
// ============================================================================

export const createDailyPlannerSchema = z.object({
  date: z.coerce.date(),
  roadmapTopicId: z.string().cuid(),
  plannedTime: z.nativeEnum(PlannedTime).optional(),
})

export const updateDailyPlannerSchema = z.object({
  plannedTime: z.nativeEnum(PlannedTime).optional(),
  completed: z.boolean().optional(),
  reflection: z.string().optional().nullable(),
})

export type CreateDailyPlannerInput = z.infer<typeof createDailyPlannerSchema>
export type UpdateDailyPlannerInput = z.infer<typeof updateDailyPlannerSchema>

// ============================================================================
// WEEKLY REFLECTION
// ============================================================================

export const createWeeklyReflectionSchema = z.object({
  weekStartDate: z.coerce.date(), // Should be a Monday
})

export const updateWeeklyReflectionSchema = z.object({
  wins: z.string().optional().nullable(),
  misses: z.string().optional().nullable(),
  nextWeekFocus: z.string().optional().nullable(),
  faithReflection: z.string().optional().nullable(),
})

export type CreateWeeklyReflectionInput = z.infer<typeof createWeeklyReflectionSchema>
export type UpdateWeeklyReflectionInput = z.infer<typeof updateWeeklyReflectionSchema>
