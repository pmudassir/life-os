'use client'

import * as React from 'react'
import { useOptimistic, useTransition, useState, useEffect } from 'react'
import { Header } from '@/components/layout/header'
import { RoutineItem } from '@/components/routine/routine-item'
import { Card, CardContent } from '@/components/ui/card'
import { updateRoutineField } from '@/actions/routine'
import { formatDisplayDate } from '@/lib/utils/date'
import { isDayWin } from '@/lib/utils/day-win'
import { DsaType } from '@prisma/client'
import { cn } from '@/lib/utils'
import { Moon, Sunrise, Dumbbell, Laptop, GraduationCap, Book } from 'lucide-react'
import type { DailyRoutineWithDayWin, DailyPlannerWithTopic } from '@/types'

// ... existing interfaces ...
interface TodayClientProps {
  initialRoutine: DailyRoutineWithDayWin
  initialPlanner: DailyPlannerWithTopic | null
  initialStreak: number
  currentDate: Date
}

type RoutineField = 
  | 'fajrDone' 
  | 'gymDone' 
  | 'workDone' 
  | 'instituteDone' 
  | 'freelanceDone' 
  | 'footballDone' 
  | 'allPrayersDone'
  | 'readingPages'
  | 'dsaType'
  | 'dayRating'

export function TodayClient({
  initialRoutine,
  initialPlanner,
  initialStreak,
  currentDate,
}: TodayClientProps) {
  /* eslint-disable @typescript-eslint/no-unused-vars */
  const [isPending, startTransition] = useTransition()
  /* eslint-enable @typescript-eslint/no-unused-vars */
  const [greeting, setGreeting] = useState('')
  const [optimisticRoutine, setOptimisticRoutine] = useOptimistic(
    initialRoutine,
    (state, update: Partial<DailyRoutineWithDayWin>) => {
      const newState = { ...state, ...update }
      return {
        ...newState,
        dayWin: isDayWin(newState),
      }
    }
  )

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('Good morning')
    else if (hour < 18) setGreeting('Good afternoon')
    else setGreeting('Good evening')
  }, [])

  const handleToggle = (field: RoutineField, value: boolean | number | DsaType | null) => {
    startTransition(async () => {
      setOptimisticRoutine({ [field]: value })
      await updateRoutineField(field, value)
    })
  }

  const handleBooleanToggle = (field: RoutineField) => (checked: boolean) => {
    handleToggle(field, checked)
  }

  // Calculate progress for the subtle ring or bar
  const totalTasks = 8 // Hardcoded for this specific user persona
  const completedTasks = [
    optimisticRoutine.fajrDone,
    optimisticRoutine.allPrayersDone,
    optimisticRoutine.gymDone,
    optimisticRoutine.dsaType !== DsaType.NONE,
    optimisticRoutine.workDone,
    optimisticRoutine.instituteDone,
    optimisticRoutine.freelanceDone,
    optimisticRoutine.readingPages > 0
  ].filter(Boolean).length
  
  const progressPercentage = Math.round((completedTasks / totalTasks) * 100)

  return (
    <div className="space-y-8 pb-8 animate-in fade-in duration-500">
      {/* Premium Header Section */}
      <div className="relative">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1 tracking-wide uppercase">
              {formatDisplayDate(currentDate)}
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              {greeting}
            </h1>
          </div>
          
          {/* Subtle Progress Indicator */}
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl font-bold font-mono">
                {progressPercentage}%
              </span>
            </div>
            <div className="h-1.5 w-24 bg-secondary rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-500 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid Layout - Bento Style */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* FAITH - Large Card */}
        <BentoCard 
          title="Faith" 
          icon={<Moon className="h-4 w-4 text-violet-500" />}
          className="col-span-1 md:row-span-2 border-l-4 border-l-violet-500/50"
        >
          <div className="space-y-3 mt-4">
            <PremiumCheckItem
              id="fajr"
              label="Fajr Prayer"
              sublabel="Start the day right"
              checked={optimisticRoutine.fajrDone}
              onChange={handleBooleanToggle('fajrDone')}
              colorClass="text-violet-600 dark:text-violet-400"
            />
            <PremiumCheckItem
              id="all-prayers"
              label="5 Prayers"
              sublabel="Complete connection"
              checked={optimisticRoutine.allPrayersDone}
              onChange={handleBooleanToggle('allPrayersDone')}
              colorClass="text-violet-600 dark:text-violet-400"
            />
            <div className="mt-6 pt-6 border-t border-border/50">
               <p className="text-xs text-muted-foreground italic text-center">
                 "Consistency is more beloved to Allah, even if small."
               </p>
            </div>
          </div>
        </BentoCard>

        {/* WORK - Standard Card */}
        <BentoCard 
          title="Deep Work" 
          icon={<Laptop className="h-4 w-4 text-blue-500" />}
          className="border-l-4 border-l-blue-500/50"
        >
          <div className="space-y-3 mt-4">
            <PremiumCheckItem
              id="work"
              label="Remote Work"
              sublabel="10:00 AM - 7:00 PM"
              checked={optimisticRoutine.workDone}
              onChange={handleBooleanToggle('workDone')}
              colorClass="text-blue-600 dark:text-blue-400"
            />
            <PremiumCheckItem
              id="freelance"
              label="Freelance"
              checked={optimisticRoutine.freelanceDone}
              onChange={handleBooleanToggle('freelanceDone')}
              colorClass="text-blue-600 dark:text-blue-400"
            />
          </div>
        </BentoCard>

        {/* DISCIPLINE - Standard Card */}
        <BentoCard 
          title="Discipline" 
          icon={<Dumbbell className="h-4 w-4 text-emerald-500" />}
          className="border-l-4 border-l-emerald-500/50"
        >
          <div className="space-y-3 mt-4">
            <PremiumCheckItem
              id="gym"
              label="Gym Session"
              checked={optimisticRoutine.gymDone}
              onChange={handleBooleanToggle('gymDone')}
              colorClass="text-emerald-600 dark:text-emerald-400"
            />
            <PremiumCheckItem
              id="dsa"
              label="DSA / System Design"
              sublabel={initialPlanner?.roadmapTopic?.title ?? 'Daily Topic'}
              checked={optimisticRoutine.dsaType !== DsaType.NONE}
              onChange={(c) => handleToggle('dsaType', c ? DsaType.DSA : DsaType.NONE)}
              colorClass="text-emerald-600 dark:text-emerald-400"
            />
          </div>
        </BentoCard>

        {/* EVENING & INSTITUTE - Horizontal Split */}
        <BentoCard 
          title="Evening & Growth" 
          icon={<Sunrise className="h-4 w-4 text-amber-500" />}
          className="col-span-1 md:col-span-2 border-l-4 border-l-amber-500/50"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
            <PremiumCheckItem
              id="institute"
              label="Coding Institute"
              icon={<GraduationCap className="h-4 w-4 opacity-70" />}
              checked={optimisticRoutine.instituteDone}
              onChange={handleBooleanToggle('instituteDone')}
              colorClass="text-amber-600 dark:text-amber-400"
            />
            <PremiumCheckItem
              id="reading"
              label="Reading"
              sublabel={`${optimisticRoutine.readingPages} pages`}
              icon={<Book className="h-4 w-4 opacity-70" />}
              checked={optimisticRoutine.readingPages > 0}
              onChange={(c) => handleToggle('readingPages', c ? 10 : 0)}
              colorClass="text-amber-600 dark:text-amber-400"
            />
          </div>
        </BentoCard>

      </div>

      {/* Day Win Status - Premium Banner */}
      <div 
        className={cn(
          "relative overflow-hidden rounded-2xl p-6 transition-all duration-500",
          optimisticRoutine.dayWin 
            ? "bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20" 
            : "bg-secondary/50 border border-border"
        )}
      >
        <div className="flex items-center gap-4">
          <div className={cn(
            "h-12 w-12 rounded-full flex items-center justify-center text-2xl bg-background shadow-sm",
            optimisticRoutine.dayWin ? "animate-bounce" : "opacity-50"
          )}>
            {optimisticRoutine.dayWin ? "🔥" : "⏳"}
          </div>
          <div>
            <h3 className="text-lg font-semibold tracking-tight">
              {optimisticRoutine.dayWin ? "Day Won!" : "Win the Day"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {optimisticRoutine.dayWin 
                ? `Streak: ${initialStreak + 1} days. Keep this momentum.` 
                : "Complete Prayers, Gym, and DSA to secure the win."}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function BentoCard({ children, title, icon, className }: { children: React.ReactNode, title: string, icon: React.ReactNode, className?: string }) {
  return (
    <Card className={cn("overflow-hidden border-0 shadow-sm bg-card/50 backdrop-blur-sm transition-all hover:bg-card/80", className)}>
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-2">
          {icon}
          <h3 className="font-semibold text-sm tracking-wide uppercase text-muted-foreground">{title}</h3>
        </div>
        {children}
      </CardContent>
    </Card>
  )
}

function PremiumCheckItem({ 
  label, 
  sublabel, 
  icon, 
  checked, 
  onChange, 
  colorClass 
}: { 
  id: string
  label: string
  sublabel?: string
  icon?: React.ReactNode
  checked: boolean
  onChange: (checked: boolean) => void
  colorClass?: string
}) {
  return (
    <div 
      onClick={() => onChange(!checked)}
      className={cn(
        "group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-200 border border-transparent",
        checked ? "bg-background shadow-sm border-border/50" : "hover:bg-secondary/50"
      )}
    >
      <div className="flex items-center gap-3">
        <div 
          className={cn(
            "h-6 w-6 rounded-full border-2 flex items-center justify-center transition-colors duration-300",
            checked 
              ? "border-transparent bg-foreground text-background" 
              : "border-muted-foreground/30 group-hover:border-foreground/50",
            colorClass && checked && "bg-current"
          )}
        >
           {checked && <div className="h-2.5 w-2.5 bg-background rounded-full" />}
        </div>
        <div>
          <p className={cn(
            "font-medium text-sm transition-opacity duration-200",
            checked ? "opacity-100" : "opacity-80"
          )}>
            {label}
          </p>
          {sublabel && (
            <p className="text-xs text-muted-foreground">
              {sublabel}
            </p>
          )}
        </div>
      </div>
      {icon && <div className="text-muted-foreground">{icon}</div>}
    </div>
  )
}
