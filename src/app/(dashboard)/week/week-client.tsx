'use client'

import * as React from 'react'
import { format, isSameDay } from 'date-fns'
import { cn } from '@/lib/utils'
import { FadeIn } from '@/components/ui/motion'
import { motion } from 'framer-motion'
import type { DailyRoutineWithDayWin } from '@/types'

interface WeekClientProps {
  days: {
    date: Date
    routine: DailyRoutineWithDayWin | null
    isToday: boolean
    isFuture: boolean
  }[]
  stats: {
    wins: number
    misses: number
    pending: number
  }
  streak: number
}

export function WeekClient({ days, stats, streak }: WeekClientProps) {
  const [selectedDay, setSelectedDay] = React.useState<Date>(new Date())

  // Find data for selected day
  const selectedDayData = days.find(d => isSameDay(d.date, selectedDay))

  return (
    <div className="space-y-8 pb-20">
      {/* Premium Stats Row */}
      <FadeIn>
        <div className="grid grid-cols-3 gap-4">
          <StatCard label="Wins" value={stats.wins} type="win" />
          <StatCard label="Review" value={stats.misses} type="miss" />
          <StatCard label="Streak" value={streak} type="neutral" isStreak />
        </div>
      </FadeIn>

      {/* Interactive Week Heatmap */}
      <FadeIn delay={0.1}>
        <div className="bg-card/50 glass border border-border/50 rounded-2xl p-4 overflow-hidden">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Weekly Overview</h3>
          </div>
          <div className="flex justify-between gap-2">
            {days.map((day, i) => (
              <WeekDayColumn 
                key={day.date.toISOString()} 
                day={day} 
                isSelected={isSameDay(day.date, selectedDay)}
                onClick={() => setSelectedDay(day.date)}
                index={i}
              />
            ))}
          </div>
        </div>
      </FadeIn>

      {/* Selected Day Detail */}
      <div className="min-h-[200px]">
        {selectedDayData && (
          <FadeIn key={selectedDay.toISOString()} className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold tracking-tight">
                {format(selectedDay, 'EEEE, MMM d')}
              </h2>
              {selectedDayData.isToday && (
                <span className="text-xs font-bold px-2 py-1 bg-primary text-background rounded-full">TODAY</span>
              )}
            </div>

            <DailyBreakdownCard day={selectedDayData} />
          </FadeIn>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value, type, isStreak }: { label: string, value: number, type: 'win' | 'miss' | 'neutral', isStreak?: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center p-4 bg-card rounded-2xl border border-border/50 shadow-sm">
      <span className={cn(
        "text-3xl font-bold font-mono tracking-tighter",
        type === 'win' && "text-emerald-500",
        type === 'miss' && "text-rose-500",
        type === 'neutral' && "text-amber-500"
      )}>
        {value}
        {isStreak && <span className="text-sm ml-1 opacity-50">🔥</span>}
      </span>
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide mt-1">{label}</span>
    </div>
  )
}

function WeekDayColumn({ day, isSelected, onClick }: { day: any, isSelected: boolean, onClick: () => void, index: number }) {
  const statusColor = (() => {
    if (day.isFuture) return 'bg-secondary'
    if (day.routine?.dayWin) return 'bg-emerald-500'
    if (!day.routine) return 'bg-amber-500/50' // Pending
    return 'bg-rose-500' // Miss
  })()

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={cn(
        "group flex-1 flex flex-col items-center gap-3 py-3 rounded-xl transition-all duration-300",
        isSelected ? "bg-accent shadow-sm" : "hover:bg-secondary/50"
      )}
    >
      <span className={cn(
        "text-xs font-medium uppercase",
        isSelected ? "text-foreground" : "text-muted-foreground"
      )}>
        {format(day.date, 'EEE')}
      </span>
      
      {/* Geometric Status Indicator */}
      <div className={cn(
        "w-8 h-12 rounded-lg transition-all duration-500 relative overflow-hidden",
        statusColor,
        day.isFuture && "opacity-30",
        isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-background"
      )}>
        {day.routine?.dayWin && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white/90"
          >
            ✓
          </motion.div>
        )}
      </div>
    </motion.button>
  )
}

function DailyBreakdownCard({ day }: { day: any }) {
  if (day.isFuture) {
    return (
      <div className="flex flex-col items-center justify-center p-8 border border-dashed border-border rounded-xl text-muted-foreground">
        <span className="text-2xl mb-2">🔭</span>
        <p>Focus on today. The future is waiting.</p>
      </div>
    )
  }

  if (!day.routine) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-amber-500/5 border border-amber-500/20 rounded-xl text-amber-700 dark:text-amber-400">
        <span className="text-2xl mb-2">📝</span>
        <p>No routine log found for this day.</p>
      </div>
    )
  }

  const { routine } = day

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <StatusRow label="Prayer" done={routine.allPrayersDone} icon="🌙" />
      <StatusRow label="Workout" done={routine.gymDone} icon="💪" />
      <StatusRow label="Work" done={routine.workDone} icon="💻" />
      <StatusRow label="Study" done={routine.dsaType !== 'NONE'} icon="🧠" />
    </div>
  )
}

function StatusRow({ label, done, icon }: { label: string, done: boolean, icon: string }) {
  return (
    <div className={cn(
      "flex items-center justify-between p-4 rounded-xl border transition-all",
      done 
        ? "bg-emerald-500/5 border-emerald-500/20" 
        : "bg-rose-500/5 border-rose-500/20"
    )}>
      <div className="flex items-center gap-3">
        <span className="text-xl">{icon}</span>
        <span className="font-medium">{label}</span>
      </div>
      <div className={cn(
        "px-3 py-1 rounded-full text-xs font-bold uppercase",
        done ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300" : "bg-rose-500/20 text-rose-700 dark:text-rose-300"
      )}>
        {done ? 'Done' : 'Missed'}
      </div>
    </div>
  )
}
