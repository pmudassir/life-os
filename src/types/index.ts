import { 
  DailyRoutine, RoadmapTopic, DailyPlanner, WeeklyReflection, 
  DsaType, TopicStatus, TopicCategory, Difficulty, PlannedTime,
  LearningResource, LearningSession, LearningNote, Skill, SkillProgress,
  Project, ProjectGoal, ProjectMetric, TimeEntry,
  ContentIdea, ContentPiece, ContentType, ContentStatus, ContentPlatform,
  WeeklyPlan, TimeBlock, DailyFocus,
  Goal, GoalTimeframe, GoalStatus, Checkpoint,
  Resource, ResourceCategoryType,
  Contact, Conversation, ConversationType, Opportunity, OpportunityType, OpportunityStatus,
  MetricSnapshot,
  AIConversation, AIRecommendation, AgentTask,
  Habit, HabitLog, FrequencyType,
  ResourceType, ResourceStatus, ProficiencyLevel,
  ProjectType, ProjectStatus,
  ContactType
} from '@prisma/client'

// ============================================================================
// Re-export Prisma enums for client components
// ============================================================================
export { 
  DsaType, TopicStatus, TopicCategory, Difficulty, PlannedTime,
  ResourceType, ResourceStatus, ProficiencyLevel,
  ProjectType, ProjectStatus,
  ContentType, ContentStatus, ContentPlatform,
  GoalTimeframe, GoalStatus,
  ResourceCategoryType,
  ContactType, ConversationType, OpportunityType, OpportunityStatus,
  FrequencyType
}

// ============================================================================
// Legacy Types (to be migrated)
// ============================================================================

export interface DailyRoutineWithDayWin extends DailyRoutine {
  dayWin: boolean
}

export interface DailyPlannerWithTopic extends DailyPlanner {
  roadmapTopic: RoadmapTopic
}

export interface TodayViewData {
  routine: DailyRoutineWithDayWin | null
  planner: DailyPlannerWithTopic | null
  streak: number
  currentDate: Date
}

export interface WeekDayData {
  date: Date
  routine: DailyRoutineWithDayWin | null
  isToday: boolean
  isFuture: boolean
}

export interface WeekViewData {
  days: WeekDayData[]
  streak: number
  weekRange: string
  reflection: WeeklyReflection | null
}

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

export interface MissedDayData {
  date: Date
  routine: DailyRoutineWithDayWin
  missingPrayers: boolean
  missingDsa: boolean
}

// ============================================================================
// Learning Types
// ============================================================================

export interface LearningResourceWithProgress extends LearningResource {
  progressPercentage: number
  sessionsCount: number
  totalTimeSpent: number
  sessions: Array<{ duration: number }>
}

export interface LearningSessionWithResource extends LearningSession {
  resource: {
    title: string
    type: string
  }
}

export interface SkillWithProgress extends Skill {
  latestProgress: SkillProgress | null
  progressHistory: SkillProgress[]
  progress: SkillProgress[]
}

export interface LearningDashboardData {
  activeResources: LearningResourceWithProgress[]
  completedResources: LearningResource[]
  recentSessions: LearningSessionWithResource[]
  skills: SkillWithProgress[]
  weeklyLearningTime: number
  monthlyLearningTime: number
}

// ============================================================================
// Project Types
// ============================================================================

export interface ProjectWithStats extends Project {
  goalsCount: number
  completedGoalsCount: number
  recentMetrics: ProjectMetric[]
  thisWeekHours: number
  goals: ProjectGoal[]
  metrics: ProjectMetric[]
}

export interface ProjectDashboardData {
  activeProjects: ProjectWithStats[]
  completedProjects: Project[]
  totalHoursThisMonth: number
  timeByCategory: Record<string, number>
  recentTimeEntries: TimeEntry[]
}

// ============================================================================
// Content Types
// ============================================================================

export interface ContentPieceWithMetrics extends ContentPiece {
  totalEngagement: number
}

export interface ContentDashboardData {
  ideas: ContentIdea[]
  scheduledContent: ContentPiece[]
  publishedContent: ContentPieceWithMetrics[]
  thisMonthStats: {
    published: number
    totalViews: number
    totalLikes: number
    totalShares: number
  }
  platformDistribution: Record<ContentPlatform, number>
}

// ============================================================================
// Schedule Types
// ============================================================================

export interface TimeBlockWithRelations extends TimeBlock {
  project?: {
    name: string
  } | null
}

export interface ScheduleDashboardData {
  currentWeekPlan: WeeklyPlan | null
  timeBlocks: TimeBlockWithRelations[]
  dailyFocus: DailyFocus | null
  weekStats: {
    totalScheduledHours: number
    completedHours: number
    byCategory: Record<string, number>
  }
}

// ============================================================================
// Goals Types
// ============================================================================

export interface GoalWithProgress extends Goal {
  progressPercentage: number
}

export interface CheckpointWithScore extends Checkpoint {
  achievedCriteriaCount: number
  totalCriteriaCount: number
}

export interface GoalsDashboardData {
  activeGoals: GoalWithProgress[]
  completedGoals: Goal[]
  upcomingCheckpoints: CheckpointWithScore[]
  goalsByTimeframe: Record<GoalTimeframe, Goal[]>
}

// ============================================================================
// Network Types
// ============================================================================

export interface ContactWithStats extends Contact {
  conversationCount: number
  lastConversationDate: Date | null
}

export interface ConversationWithContact extends Conversation {
  contact: {
    name: string
    type: string
  }
}

export interface NetworkDashboardData {
  contacts: ContactWithStats[]
  recentConversations: ConversationWithContact[]
  activeOpportunities: Opportunity[]
  conversationStats: {
    totalThisMonth: number
    byType: Record<ConversationType, number>
  }
}

// ============================================================================
// Insights Types
// ============================================================================

export interface InsightsDashboardData {
  recentSnapshots: MetricSnapshot[]
  streaks: {
    daily: number
    weekly: number
    learning: number
  }
  trends: {
    learningHours: number[]
    projectHours: number[]
    contentPieces: number[]
  }
  aiRecommendations: AIRecommendation[]
}

// ============================================================================
// AI Types
// ============================================================================

export interface AIChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export interface AIConversationWithMessages extends AIConversation {
  messages: Array<{ role: string; content: string; timestamp: string }>
}

// ============================================================================
// Time Entry Type (for components)
// ============================================================================

export interface TimeEntryData {
  id: string
  description: string
  startTime: Date
  duration: number
  category: string | null
}

// ============================================================================
// Main Dashboard Types
// ============================================================================

export interface MainDashboardData {
  // Overview stats
  todayFocus: DailyFocus | null
  activeLearning: LearningResourceWithProgress | null
  activeProjects: ProjectWithStats[]
  thisWeekContent: ContentPiece[]
  
  // Quick stats
  stats: {
    weeklyLearningHours: number
    weeklyProjectHours: number
    contentPublishedThisMonth: number
    currentStreak: number
  }
  
  // AI insights
  aiRecommendation: AIRecommendation | null
  
  // Upcoming
  upcomingDeadlines: Goal[]
  scheduledToday: TimeBlock[]
}

// ============================================================================
// Form Types
// ============================================================================

export interface CreateLearningResourceInput {
  title: string
  author?: string
  type: ResourceType
  totalPages?: number
  totalChapters?: number
  totalDuration?: number
  description?: string
  targetCompletionDate?: Date
}

export interface CreateProjectInput {
  name: string
  description?: string
  type: ProjectType
  startDate?: Date
  targetEndDate?: Date
  estimatedHours?: number
}

export interface CreateGoalInput {
  title: string
  description?: string
  timeframe: GoalTimeframe
  targetDate: Date
  successCriteria?: string
  targetValue?: number
  unit?: string
}

export interface CreateContentIdeaInput {
  title: string
  description?: string
  type: ContentType
}

export interface CreateContactInput {
  name: string
  email?: string
  type: ContactType
  company?: string
  role?: string
  howWeMet?: string
}

export interface LogConversationInput {
  contactId: string
  type: ConversationType
  notes?: string
  problemDiscussed?: string
  currentSolution?: string
  willingnessToPay?: string
  followUpNeeded?: boolean
  followUpDate?: Date
}
