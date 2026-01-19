'use client'

import * as React from 'react'
import { useOptimistic, useTransition } from 'react'
import { Header } from '@/components/layout/header'
import { RoutineItem } from '@/components/routine/routine-item'
import { DayRating } from '@/components/routine/day-rating'
import { DayWinBadge } from '@/components/dashboard/day-win-badge'
import { StreakIndicator } from '@/components/dashboard/streak-indicator'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { updateRoutineField } from '@/actions/routine'
import { formatDisplayDate } from '@/lib/utils/date'
import { isDayWin } from '@/lib/utils/day-win'
import { DsaType } from '@prisma/client'
import type { DailyRoutineWithDayWin, DailyPlannerWithTopic } from '@/types'

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
  const [isPending, startTransition] = useTransition()
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

  const handleToggle = (field: RoutineField, value: boolean | number | DsaType | null) => {
    startTransition(async () => {
      setOptimisticRoutine({ [field]: value })
      await updateRoutineField(field, value)
    })
  }

  const handleBooleanToggle = (field: RoutineField) => (checked: boolean) => {
    handleToggle(field, checked)
  }

  const handleDsaToggle = (completed: boolean) => {
    // If checking, mark as DSA completed. If unchecking, mark as NONE
    const value = completed ? DsaType.DSA : DsaType.NONE
    handleToggle('dsaType', value)
  }

  const handleRating = (rating: number) => {
    handleToggle('dayRating', rating)
  }

  return (
    <div className="space-y-6">
      {/* Header with date and day win status */}
      <Header
        title={formatDisplayDate(currentDate)}
        action={<DayWinBadge isWin={optimisticRoutine.dayWin} size="md" />}
      />

      {/* Streak */}
      <StreakIndicator streak={initialStreak} />

      {/* Faith Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <span>☪️</span>
            <span>Faith</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 p-0">
          <RoutineItem
            id="fajr"
            label="Fajr Prayer"
            icon="🌅"
            checked={optimisticRoutine.fajrDone}
            onCheckedChange={handleBooleanToggle('fajrDone')}
            disabled={isPending}
          />
          <RoutineItem
            id="all-prayers"
            label="All 5 Prayers"
            icon="🕌"
            checked={optimisticRoutine.allPrayersDone}
            onCheckedChange={handleBooleanToggle('allPrayersDone')}
            disabled={isPending}
          />
        </CardContent>
      </Card>

      {/* Discipline Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <span>💪</span>
            <span>Discipline</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 p-0">
          <RoutineItem
            id="gym"
            label="Gym / Workout"
            icon="🏋️"
            checked={optimisticRoutine.gymDone}
            onCheckedChange={handleBooleanToggle('gymDone')}
            disabled={isPending}
          />
          <RoutineItem
            id="dsa"
            label={initialPlanner?.roadmapTopic?.title ?? 'DSA / System Design'}
            icon="🧠"
            checked={optimisticRoutine.dsaType !== DsaType.NONE}
            onCheckedChange={handleDsaToggle}
            disabled={isPending}
          />
        </CardContent>
      </Card>

      {/* Work Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <span>💼</span>
            <span>Work</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 p-0">
          <RoutineItem
            id="work"
            label="Remote Work (10-7)"
            icon="💻"
            checked={optimisticRoutine.workDone}
            onCheckedChange={handleBooleanToggle('workDone')}
            disabled={isPending}
          />
          <RoutineItem
            id="institute"
            label="Coding Institute"
            icon="🏫"
            checked={optimisticRoutine.instituteDone}
            onCheckedChange={handleBooleanToggle('instituteDone')}
            disabled={isPending}
          />
          <RoutineItem
            id="freelance"
            label="Freelance"
            icon="🚀"
            checked={optimisticRoutine.freelanceDone}
            onCheckedChange={handleBooleanToggle('freelanceDone')}
            disabled={isPending}
          />
        </CardContent>
      </Card>

      {/* Evening Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <span>🌙</span>
            <span>Evening</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 p-0">
          <RoutineItem
            id="reading"
            label={`Reading (${optimisticRoutine.readingPages} pages)`}
            icon="📖"
            checked={optimisticRoutine.readingPages > 0}
            onCheckedChange={(checked) => handleToggle('readingPages', checked ? 10 : 0)}
            disabled={isPending}
          />
          <RoutineItem
            id="football"
            label="Football"
            icon="⚽"
            checked={optimisticRoutine.footballDone}
            onCheckedChange={handleBooleanToggle('footballDone')}
            disabled={isPending}
          />
        </CardContent>
      </Card>

      {/* Day Rating */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <span>⭐</span>
            <span>Day Rating</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-4">
          <DayRating
            value={optimisticRoutine.dayRating}
            onChange={handleRating}
            disabled={isPending}
          />
        </CardContent>
      </Card>

      {/* Day Win Summary */}
      <Card className={optimisticRoutine.dayWin ? 'border-emerald-300 bg-emerald-50 dark:bg-emerald-950/20' : ''}>
        <CardContent className="py-6 text-center">
          {optimisticRoutine.dayWin ? (
            <div className="space-y-2">
              <span className="text-4xl">🔥</span>
              <p className="text-lg font-semibold text-emerald-700 dark:text-emerald-300">
                Day Win Achieved!
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Prayers ✓ Gym ✓ DSA ✓
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <span className="text-4xl">⏳</span>
              <p className="text-lg font-semibold text-amber-700 dark:text-amber-300">
                Keep going...
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {!optimisticRoutine.allPrayersDone && 'Complete prayers '}
                {!optimisticRoutine.gymDone && '• Gym '}
                {optimisticRoutine.dsaType === DsaType.NONE && '• DSA'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
