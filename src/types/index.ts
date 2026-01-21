import { DailyRoutine, RoadmapTopic, DailyPlanner, WeeklyReflection, DsaType, TopicStatus, TopicCategory, Difficulty, PlannedTime } from '@prisma/client'

// Re-export enums for client components (to avoid bundling the full Prisma client)
export { DsaType, TopicStatus, TopicCategory, Difficulty, PlannedTime }

/**
 * Extended DailyRoutine with computed Day Win status
 */
export interface DailyRoutineWithDayWin extends DailyRoutine {
  dayWin: boolean
}

/**
 * Extended DailyPlanner with its associated roadmap topic
 */
export interface DailyPlannerWithTopic extends DailyPlanner {
  roadmapTopic: RoadmapTopic
}

/**
 * Today's view data
 */
export interface TodayViewData {
  routine: DailyRoutineWithDayWin | null
  planner: DailyPlannerWithTopic | null
  streak: number
  currentDate: Date
}

/**
 * Week overview data for each day
 */
export interface WeekDayData {
  date: Date
  routine: DailyRoutineWithDayWin | null
  isToday: boolean
  isFuture: boolean
}

/**
 * Weekly view data
 */
export interface WeekViewData {
  days: WeekDayData[]
  streak: number
  weekRange: string
  reflection: WeeklyReflection | null
}

/**
 * Roadmap view with grouped topics by phase
 */
export interface RoadmapViewData {
  topics: RoadmapTopic[]
  byPhase: {
    phase1: RoadmapTopic[]
    phase2: RoadmapTopic[]
    phase3: RoadmapTopic[]
  }
  progress: {
    total: number
    done: number
    inProgress: number
    notStarted: number
  }
}

/**
 * Missed days view data
 */
export interface MissedDayData {
  date: Date
  routine: DailyRoutineWithDayWin
  missingPrayers: boolean
  missingDsa: boolean
}
