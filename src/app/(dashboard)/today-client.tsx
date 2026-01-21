'use client'

import * as React from 'react'
import { useOptimistic, useTransition } from 'react'
import { updateRoutineField } from '@/actions/routine'
import { formatDisplayDate } from '@/lib/utils/date'
import { isDayWin } from '@/lib/utils/day-win'
import { DsaType } from '@/types'
import { cn } from '@/lib/utils'
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/ui/motion'
import { ScrollArea } from '@/components/ui/scroll-area'
import { CheckCircle2, Moon, Dumbbell, Laptop, Trophy } from 'lucide-react'
import type { DailyRoutineWithDayWin, DailyPlannerWithTopic } from '@/types'

// User configuration
const USER_NAME = 'Mudassir'

interface TodayClientProps {
  initialRoutine: DailyRoutineWithDayWin
  initialPlanner: DailyPlannerWithTopic | null
  initialStreak: number
  currentDate: Date
}

// Get greeting based on time of day
function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

export function TodayClient({
  initialRoutine,
  initialPlanner,
  initialStreak,
  currentDate,
}: TodayClientProps) {
  const [, startTransition] = useTransition()
  const greeting = `${getGreeting()}, ${USER_NAME}`
  
  const [optimisticRoutine, setOptimisticRoutine] = useOptimistic(
    initialRoutine,
    (state, update: Partial<DailyRoutineWithDayWin>) => {
      const newState = { ...state, ...update }
      return { ...newState, dayWin: isDayWin(newState) }
    }
  )

  type RoutineFieldName = 'fajrDone' | 'dhuhrDone' | 'asrDone' | 'maghribDone' | 'ishaDone' | 
    'gymDone' | 'dsaType' | 'workDone' | 'instituteDone' | 'freelanceDone' | 'readingPages'

  const handleToggle = (field: RoutineFieldName, value: boolean | number | string) => {
    startTransition(async () => {
      setOptimisticRoutine({ [field]: value } as Partial<DailyRoutineWithDayWin>)
      await updateRoutineField(field, value)
    })
  }

  // Calculate Progress (5 prayers + gym + dsa + work + institute + freelance + reading = 11 tasks)
  const totalTasks = 11
  const completedTasks = [
    optimisticRoutine.fajrDone,
    optimisticRoutine.dhuhrDone,
    optimisticRoutine.asrDone,
    optimisticRoutine.maghribDone,
    optimisticRoutine.ishaDone,
    optimisticRoutine.gymDone,
    optimisticRoutine.dsaType !== DsaType.NONE,
    optimisticRoutine.workDone,
    optimisticRoutine.instituteDone,
    optimisticRoutine.freelanceDone,
    optimisticRoutine.readingPages > 0
  ].filter(Boolean).length
  const progress = Math.round((completedTasks / totalTasks) * 100)
  
  // Count completed prayers for display
  const completedPrayers = [
    optimisticRoutine.fajrDone,
    optimisticRoutine.dhuhrDone,
    optimisticRoutine.asrDone,
    optimisticRoutine.maghribDone,
    optimisticRoutine.ishaDone
  ].filter(Boolean).length

  return (
    <div className="h-full flex flex-col gap-6">
      {/* Header Section */}
      <FadeIn className="flex items-end justify-between px-1">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-1">
            {formatDisplayDate(currentDate)}
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {greeting}
          </h1>
        </div>
        <div className="text-right">
          <div className="flex items-center justify-end gap-2 mb-1">
            <span className="text-2xl font-bold font-mono">{progress}%</span>
          </div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Daily Goal</p>
        </div>
      </FadeIn>

      {/* Timeline Scroll Area */}
      <ScrollArea className="flex-1 -mr-4 pr-4">
        <StaggerContainer className="pb-40 pl-4 border-l-2 border-border/50 ml-4 space-y-10 pt-2">
          
          {/* Daily Prayers Section */}
          <TimelineSection 
            title="Daily Prayers" 
            time={`${completedPrayers}/5 completed`}
            icon={<Moon className="w-4 h-4" />}
            color="violet"
            isLast={false}
          >
            <TimelineTask 
              label="Fajr" 
              sublabel="Dawn prayer (~5:30 AM)"
              checked={optimisticRoutine.fajrDone}
              onChange={(c) => handleToggle('fajrDone', c)}
            />
            <TimelineTask 
              label="Dhuhr" 
              sublabel="Midday prayer (~12:30 PM)"
              checked={optimisticRoutine.dhuhrDone}
              onChange={(c) => handleToggle('dhuhrDone', c)}
            />
            <TimelineTask 
              label="Asr" 
              sublabel="Afternoon prayer (~4:00 PM)"
              checked={optimisticRoutine.asrDone}
              onChange={(c) => handleToggle('asrDone', c)}
            />
            <TimelineTask 
              label="Maghrib" 
              sublabel="Sunset prayer (~6:00 PM)"
              checked={optimisticRoutine.maghribDone}
              onChange={(c) => handleToggle('maghribDone', c)}
            />
            <TimelineTask 
              label="Isha" 
              sublabel="Night prayer (~8:00 PM)"
              checked={optimisticRoutine.ishaDone}
              onChange={(c) => handleToggle('ishaDone', c)}
            />
          </TimelineSection>

          {/* Deep Work Section */}
          <TimelineSection 
            title="Deep Work" 
            time="10:00 - 18:00" 
            icon={<Laptop className="w-4 h-4" />}
            color="blue"
            isLast={false}
          >
            <TimelineTask 
              label="Remote Work" 
              checked={optimisticRoutine.workDone}
              onChange={(c) => handleToggle('workDone', c)}
            />
            <TimelineTask 
              label="Freelance Projects" 
              checked={optimisticRoutine.freelanceDone}
              onChange={(c) => handleToggle('freelanceDone', c)}
            />
          </TimelineSection>

          {/* Discipline/Evening Section */}
          <TimelineSection 
            title="Discipline & Growth" 
            time="19:00 - 23:00" 
            icon={<Dumbbell className="w-4 h-4" />}
            color="emerald"
            isLast={true}
          >
            <TimelineTask 
              label="Gym Session" 
              checked={optimisticRoutine.gymDone}
              onChange={(c) => handleToggle('gymDone', c)}
            />
            <TimelineTask 
              label="DSA / System Design" 
              sublabel={initialPlanner?.roadmapTopic?.title ?? 'Daily Topic'}
              checked={optimisticRoutine.dsaType !== DsaType.NONE}
              onChange={(c) => handleToggle('dsaType', c ? DsaType.DSA : DsaType.NONE)}
            />
            <TimelineTask 
              label="Coding Institute" 
              checked={optimisticRoutine.instituteDone}
              onChange={(c) => handleToggle('instituteDone', c)}
            />
            <TimelineTask 
              label="Reading" 
              sublabel={`${optimisticRoutine.readingPages} pages read`}
              checked={optimisticRoutine.readingPages > 0}
              onChange={(c) => handleToggle('readingPages', c ? 10 : 0)}
            />
          </TimelineSection>

          {/* Day Win Goal - Final Node */}
          <div className="relative pl-8 pb-10">
            {/* Final Trophy Node */}
            <div className={cn(
              "absolute -left-[29px] top-0 w-6 h-6 rounded-full border-4 flex items-center justify-center transition-all z-10",
              optimisticRoutine.dayWin 
                ? "bg-emerald-500 border-emerald-500 scale-125" 
                : "bg-background border-muted scale-100"
            )}>
              {optimisticRoutine.dayWin && <Trophy className="w-3 h-3 text-white" />}
            </div>

            <div className={cn(
              "p-6 rounded-2xl border transition-all duration-500",
              optimisticRoutine.dayWin 
                ? "bg-emerald-500/10 border-emerald-500/20 shadow-lg shadow-emerald-500/10" 
                : "bg-card/50 border-border/50 border-dashed"
            )}>
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-all shadow-sm",
                  optimisticRoutine.dayWin ? "bg-emerald-500 text-white animate-bounce" : "bg-secondary text-muted-foreground opacity-50"
                )}>
                  {optimisticRoutine.dayWin ? "🔥" : "🏆"}
                </div>
                <div>
                   <h3 className="font-bold text-lg tracking-tight">
                     {optimisticRoutine.dayWin ? "Day Won!" : "Win the Day"}
                   </h3>
                   <p className="text-sm text-muted-foreground">
                     {optimisticRoutine.dayWin 
                       ? `Streak: ${initialStreak + 1} days. Amazing work!` 
                       : "Complete Fajr, all prayers, Gym, and DSA to unlock."}
                   </p>
                </div>
              </div>
            </div>
          </div>

        </StaggerContainer>
      </ScrollArea>

    </div>
  )
}

function TimelineSection({ 
  children, 
  title, 
  time, 
  icon, 
  color,
  isLast 
}: { 
  children: React.ReactNode, 
  title: string, 
  time: string, 
  icon: React.ReactNode,
  color: 'violet' | 'blue' | 'emerald' | 'amber',
  isLast: boolean
}) {
  const colorClasses = {
    violet: "border-violet-500 text-violet-500 bg-violet-500/10",
    blue: "border-blue-500 text-blue-500 bg-blue-500/10",
    emerald: "border-emerald-500 text-emerald-500 bg-emerald-500/10",
    amber: "border-amber-500 text-amber-500 bg-amber-500/10",
  }

  return (
    <StaggerItem className="relative pl-8">
      {/* Node */}
      <div className={cn(
        "absolute -left-[29px] top-0 w-6 h-6 rounded-full border-4 flex items-center justify-center bg-background z-10 transition-colors",
        colorClasses[color].split(' ')[0] // Border color
      )}>
        <div className={cn("w-2 h-2 rounded-full", colorClasses[color].split(' ')[1].replace('text-', 'bg-'))} />
      </div>

      <div className="flex items-center gap-3 mb-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{title}</h3>
        <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground font-mono">{time}</span>
      </div>
      
      <div className="grid gap-3">
        {children}
      </div>
    </StaggerItem>
  )
}

function TimelineTask({ 
  label, 
  sublabel, 
  checked, 
  onChange 
}: { 
  label: string, 
  sublabel?: string, 
  checked: boolean, 
  onChange: (c: boolean) => void 
}) {
  return (
    <div 
      onClick={() => onChange(!checked)}
      className={cn(
        "group flex items-center justify-between p-4 rounded-xl border transition-all duration-200 cursor-pointer",
        checked 
          ? "bg-card/50 border-border opacity-60 hover:opacity-100" 
          : "bg-card border-border/50 hover:bg-accent/50 hover:border-accent shadow-sm"
      )}
    >
      <div>
        <h4 className={cn("font-medium transition-all", checked && "line-through text-muted-foreground")}>{label}</h4>
        {sublabel && <p className="text-xs text-muted-foreground mt-0.5">{sublabel}</p>}
      </div>

      <div className={cn(
        "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
        checked 
          ? "border-emerald-500 bg-emerald-500 text-white" 
          : "border-muted-foreground/30 group-hover:border-emerald-500/50"
      )}>
        {checked && <CheckCircle2 className="w-4 h-4" />}
      </div>
    </div>
  )
}
