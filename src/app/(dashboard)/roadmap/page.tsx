import { Header } from '@/components/layout/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getRoadmapTopics } from '@/actions/roadmap'
import { TopicCategory, TopicStatus, Difficulty } from '@prisma/client'
import { cn } from '@/lib/utils'

// Prevent static prerendering - this page needs database access
export const dynamic = 'force-dynamic'

const difficultyColors: Record<Difficulty, string> = {
  EASY: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  MEDIUM: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  HARD: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
}

const statusIcons: Record<TopicStatus, string> = {
  NOT_STARTED: '○',
  IN_PROGRESS: '◐',
  DONE: '●',
}

const statusColors: Record<TopicStatus, string> = {
  NOT_STARTED: 'text-slate-400',
  IN_PROGRESS: 'text-amber-500',
  DONE: 'text-emerald-500',
}

export default async function RoadmapPage() {
  const { topics, byPhase, progress } = await getRoadmapTopics()

  const progressPercent = progress.total > 0 
    ? Math.round((progress.done / progress.total) * 100) 
    : 0

  return (
    <div className="space-y-6">
      <Header
        title="Learning Roadmap"
        subtitle="DSA & System Design Progress"
      />

      {/* Progress Overview */}
      <Card>
        <CardContent className="py-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Overall Progress
            </span>
            <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
              {progress.done}/{progress.total} ({progressPercent}%)
            </span>
          </div>
          <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between mt-4 text-xs text-slate-500 dark:text-slate-400">
            <span>● {progress.done} Done</span>
            <span>◐ {progress.inProgress} In Progress</span>
            <span>○ {progress.notStarted} Not Started</span>
          </div>
        </CardContent>
      </Card>

      {/* Category Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="dsa">DSA</TabsTrigger>
          <TabsTrigger value="system">System Design</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4 space-y-6">
          <PhaseSection title="Phase 1: Foundations" topics={byPhase.phase1} />
          <PhaseSection title="Phase 2: Intermediate" topics={byPhase.phase2} />
          <PhaseSection title="Phase 3: Advanced" topics={byPhase.phase3} />
        </TabsContent>

        <TabsContent value="dsa" className="mt-4 space-y-6">
          <PhaseSection 
            title="Phase 1: Foundations" 
            topics={byPhase.phase1.filter(t => t.category === TopicCategory.DSA)} 
          />
          <PhaseSection 
            title="Phase 2: Intermediate" 
            topics={byPhase.phase2.filter(t => t.category === TopicCategory.DSA)} 
          />
          <PhaseSection 
            title="Phase 3: Advanced" 
            topics={byPhase.phase3.filter(t => t.category === TopicCategory.DSA)} 
          />
        </TabsContent>

        <TabsContent value="system" className="mt-4 space-y-6">
          <PhaseSection 
            title="Phase 1: Foundations" 
            topics={byPhase.phase1.filter(t => t.category === TopicCategory.SYSTEM)} 
          />
          <PhaseSection 
            title="Phase 2: Intermediate" 
            topics={byPhase.phase2.filter(t => t.category === TopicCategory.SYSTEM)} 
          />
          <PhaseSection 
            title="Phase 3: Advanced" 
            topics={byPhase.phase3.filter(t => t.category === TopicCategory.SYSTEM)} 
          />
        </TabsContent>
      </Tabs>

      {/* Empty State */}
      {topics.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <span className="text-4xl mb-4 block">📚</span>
            <p className="text-lg font-medium text-slate-700 dark:text-slate-300">
              No topics yet
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              Add your first DSA or System Design topic to get started.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function PhaseSection({ 
  title, 
  topics 
}: { 
  title: string
  topics: Awaited<ReturnType<typeof getRoadmapTopics>>['topics']
}) {
  if (topics.length === 0) return null

  return (
    <div>
      <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-wide">
        {title}
      </h3>
      <div className="space-y-2">
        {topics.map((topic) => (
          <Card key={topic.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className={cn('text-xl mt-0.5', statusColors[topic.status])}>
                    {statusIcons[topic.status]}
                  </span>
                  <div>
                    <p className={cn(
                      'font-medium',
                      topic.status === TopicStatus.DONE && 'line-through text-slate-400'
                    )}>
                      {topic.title}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant="secondary" className="text-xs">
                        {topic.category}
                      </Badge>
                      <Badge 
                        variant="secondary" 
                        className={cn('text-xs', difficultyColors[topic.difficulty])}
                      >
                        {topic.difficulty}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
              {topic.notes && (
                <p className="mt-3 text-sm text-slate-500 dark:text-slate-400 pl-8">
                  {topic.notes}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
