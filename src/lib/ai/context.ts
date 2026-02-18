import { prisma } from '@/lib/prisma'

/**
 * Build context for AI interactions based on user's current state
 */
export async function buildUserContext(userId: string, contextType: string = 'general') {
  const [
    activeResources,
    activeProjects,
    thisWeekPlans,
    recentGoals,
    contentStats,
    recentReflection,
  ] = await Promise.all([
    // Active learning resources
    prisma.learningResource.findMany({
      where: { userId, status: 'IN_PROGRESS' },
      orderBy: { updatedAt: 'desc' },
      take: 3,
      select: {
        title: true,
        type: true,
        currentPage: true,
        totalPages: true,
        currentChapter: true,
        totalChapters: true,
      },
    }),

    // Active projects
    prisma.project.findMany({
      where: { userId, status: 'ACTIVE' },
      orderBy: { updatedAt: 'desc' },
      take: 3,
      select: {
        name: true,
        type: true,
        description: true,
        totalHoursLogged: true,
      },
    }),

    // This week's plan
    prisma.weeklyPlan.findFirst({
      where: { userId },
      orderBy: { weekStartDate: 'desc' },
      select: {
        mainFocus: true,
        learningGoal: true,
        projectGoal: true,
        contentGoal: true,
      },
    }),

    // Recent goals
    prisma.goal.findMany({
      where: { userId, status: { in: ['NOT_STARTED', 'IN_PROGRESS'] } },
      orderBy: { targetDate: 'asc' },
      take: 5,
      select: {
        title: true,
        timeframe: true,
        status: true,
        targetDate: true,
      },
    }),

    // Content stats (last 30 days)
    prisma.contentPiece.count({
      where: {
        userId,
        publishedDate: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      },
    }),

    // Most recent reflection
    prisma.weeklyReflection.findFirst({
      where: { userId },
      orderBy: { weekStartDate: 'desc' },
      select: {
        wins: true,
        misses: true,
        nextWeekFocus: true,
      },
    }),
  ])

  // Calculate learning progress
  const learningContext = activeResources.map((r: { title: string; type: string; totalPages: number | null; currentPage: number; totalChapters: number | null; currentChapter: number }) => {
    const progress = r.totalPages 
      ? Math.round((r.currentPage / r.totalPages) * 100)
      : r.totalChapters
      ? Math.round((r.currentChapter / r.totalChapters) * 100)
      : 0
    return `${r.title} (${r.type}): ${progress}% complete`
  })

  // Build context string
  const context = {
    learning: learningContext.length > 0 
      ? `Currently learning:\n${learningContext.join('\n')}`
      : 'No active learning resources.',

    projects: activeProjects.length > 0
      ? `Active projects:\n${activeProjects.map((p: { name: string; type: string; totalHoursLogged: number }) => 
          `- ${p.name} (${p.type}): ${p.totalHoursLogged}h logged`
        ).join('\n')}`
      : 'No active projects.',

    weeklyFocus: thisWeekPlans
      ? `This week's focus:\n- Main: ${thisWeekPlans.mainFocus || 'Not set'}\n- Learning: ${thisWeekPlans.learningGoal || 'Not set'}\n- Project: ${thisWeekPlans.projectGoal || 'Not set'}\n- Content: ${thisWeekPlans.contentGoal || 'Not set'}`
      : 'No weekly plan set.',

    goals: recentGoals.length > 0
      ? `Active goals:\n${recentGoals.map((g: { title: string; timeframe: string; status: string; targetDate: Date }) => 
          `- ${g.title} (${g.timeframe}): ${g.status}, due ${g.targetDate.toISOString().split('T')[0]}`
        ).join('\n')}`
      : 'No active goals.',

    content: `Published ${contentStats} pieces of content in the last 30 days.`,

    reflection: recentReflection
      ? `Last week's reflection:\n- Wins: ${recentReflection.wins || 'None recorded'}\n- Misses: ${recentReflection.misses || 'None recorded'}\n- Focus this week: ${recentReflection.nextWeekFocus || 'Not set'}`
      : 'No recent reflection.',
  }

  return context
}

/**
 * Build context specifically for learning-related queries
 */
export async function buildLearningContext(userId: string, resourceId?: string) {
  const [resource, recentSessions, notes] = await Promise.all([
    resourceId 
      ? prisma.learningResource.findUnique({
          where: { id: resourceId },
          include: { sessions: { orderBy: { startTime: 'desc' }, take: 5 } }
        })
      : null,
    
    prisma.learningSession.findMany({
      where: { userId },
      orderBy: { startTime: 'desc' },
      take: 10,
      include: { resource: { select: { title: true } } }
    }),

    resourceId
      ? prisma.learningNote.findMany({
          where: { resourceId },
          orderBy: { createdAt: 'desc' },
          take: 5
        })
      : Promise.resolve([])
  ])

  return {
    resource,
    recentSessions,
    notes,
    totalLearningTime: recentSessions.reduce((acc: number, s: { duration: number }) => acc + s.duration, 0),
  }
}

/**
 * Build context for project-related queries
 */
export async function buildProjectContext(userId: string, projectId?: string) {
  const [project, allProjects, timeEntries] = await Promise.all([
    projectId
      ? prisma.project.findUnique({
          where: { id: projectId },
          include: {
            goals: { where: { status: { not: 'completed' } } },
            metrics: { orderBy: { recordedAt: 'desc' }, take: 5 }
          }
        })
      : null,

    prisma.project.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    }),

    prisma.timeEntry.findMany({
      where: { userId },
      orderBy: { startTime: 'desc' },
      take: 20,
    })
  ])

  // Calculate time distribution
  const timeByCategory = timeEntries.reduce((acc: Record<string, number>, entry: { category: string | null; duration: number }) => {
    const category = entry.category || 'uncategorized'
    acc[category] = (acc[category] || 0) + entry.duration
    return acc
  }, {} as Record<string, number>)

  return {
    project,
    allProjects,
    recentTimeEntries: timeEntries,
    timeByCategory,
    totalHoursThisWeek: timeEntries
      .filter((e: { startTime: Date }) => e.startTime > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
      .reduce((acc: number, e: { duration: number }) => acc + e.duration, 0) / 60,
  }
}
