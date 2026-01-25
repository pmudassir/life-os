'use client'

import * as React from 'react'
import { useOptimistic, useTransition, useEffect } from 'react'
import { formatDisplayDate } from '@/lib/utils/date'

import { cn } from '@/lib/utils'
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/ui/motion'
import { ScrollArea } from '@/components/ui/scroll-area'
import { CheckCircle2, Moon, Sun, CloudSun, Sunset, Laptop, Briefcase, Dumbbell, School, Trophy, Circle } from 'lucide-react'
import { HabitManager } from '@/components/habits/habit-manager'
import { toggleHabit } from '@/actions/habit'
import { Habit } from '@prisma/client'

// Mapping icon names to components
const IconMap: Record<string, React.ElementType> = {
  Moon, Sun, CloudSun, Sunset, Laptop, Briefcase, Dumbbell, School, Circle, Trophy
}

type HabitWithCompletion = Habit & { completed: boolean }

interface TodayClientProps {
  initialHabits: HabitWithCompletion[]
  initialStreak: number
  currentDate: Date
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

export function TodayClient({
  initialHabits,
  initialStreak,
  currentDate,
}: TodayClientProps) {
  const [, startTransition] = useTransition()
  const greeting = `${getGreeting()}, Mudassir`
  
  const [optimisticHabits, setOptimisticHabits] = useOptimistic(
    initialHabits,
    (state, { id, completed }: { id: string, completed: boolean }) => {
      return state.map(h => h.id === id ? { ...h, completed } : h)
    }
  )

  const handleToggle = (id: string, completed: boolean) => {
    startTransition(async () => {
      setOptimisticHabits({ id, completed })
      await toggleHabit(id, currentDate, completed)
    })
  }

  // Calculate Progress
  const totalTasks = optimisticHabits.length
  const completedTasks = optimisticHabits.filter(h => h.completed).length
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
  
  // Day Win Logic (All habits done)
  const isDayWon = totalTasks > 0 && completedTasks === totalTasks

  // Group by section
  const sections = React.useMemo(() => {
    const groups: Record<string, typeof optimisticHabits> = {}
    optimisticHabits.forEach(h => {
      if (!groups[h.section]) groups[h.section] = []
      groups[h.section].push(h)
    })
    return groups
  }, [optimisticHabits])

  // Notification Check
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission()
    }
  }, [])

  return (
    <div className="h-full flex flex-col gap-12 pt-12">
      {/* Header Section */}
      <FadeIn className="flex flex-col gap-6 px-2">
        <div className="flex items-center justify-between">
            <span className="px-4 py-1.5 rounded-full border border-kawkab-stroke text-xs font-bold uppercase tracking-widest text-kawkab-gray bg-white/50 backdrop-blur-sm">
                {formatDisplayDate(currentDate)}
            </span>
            <div className="flex items-center gap-4">
                 <HabitManager />
                 <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold font-mono tracking-tighter">{progress}%</span>
                      <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Done</span>
                 </div>
            </div>
        </div>
        
        <h1 className="text-6xl md:text-8xl font-bold tracking-tighter leading-[0.9] text-foreground">
          {greeting}
        </h1>
      </FadeIn>

      {/* Timeline Scroll Area */}
      <ScrollArea className="flex-1 -mr-4 pr-4">
        <StaggerContainer className="pb-40 pl-4 border-l border-kawkab-stroke ml-4 space-y-16 pt-4">
          
          {Object.entries(sections).map(([sectionName, habits], idx) => (
             <TimelineSection 
                key={sectionName}
                title={sectionName}
                time={`${habits.filter(h => h.completed).length}/${habits.length}`}
                color={idx % 2 === 0 ? "violet" : "blue"}
             >
                {habits.map((habit) => (
                    <TimelineTask
                        key={habit.id}
                        label={habit.title}
                        sublabel={habit.description}
                        checked={habit.completed}
                        onChange={(c) => handleToggle(habit.id, c)}
                        icon={habit.icon}
                    />
                ))}
             </TimelineSection>
          ))}

          {/* Day Win Goal - Final Node */}
          <div className="relative pl-8 pb-10">
            {/* Final Trophy Node */}
            <div className={cn(
              "absolute -left-[29px] top-0 w-6 h-6 rounded-full border border-kawkab-stroke flex items-center justify-center transition-all z-10 bg-white",
              isDayWon 
                ? "bg-kawkab-accent border-transparent scale-125" 
                : "bg-white border-kawkab-stroke scale-100"
            )}>
              {isDayWon && <Trophy className="w-3 h-3 text-black" />}
            </div>

            <div className={cn(
              "p-8 rounded-4xl border transition-all duration-500",
              isDayWon 
                ? "bg-kawkab-accent/10 border-kawkab-accent/20 shadow-xl" 
                : "bg-white/50 border-kawkab-stroke border-dashed"
            )}>
              <div className="flex items-center gap-6">
                <div className={cn(
                  "w-16 h-16 rounded-full flex items-center justify-center text-3xl transition-all shadow-sm border border-kawkab-stroke",
                  isDayWon ? "bg-kawkab-accent text-black animate-bounce border-transparent" : "bg-white text-muted-foreground opacity-50"
                )}>
                  {isDayWon ? "🔥" : "🏆"}
                </div>
                <div>
                   <h3 className="font-bold text-2xl tracking-tight mb-1">
                     {isDayWon ? "Day Won!" : "Win the Day"}
                   </h3>
                   <p className="text-base text-muted-foreground leading-relaxed">
                     {isDayWon 
                       ? `Streak: ${initialStreak + 1} days. Amazing work!` 
                       : "Complete all scheduled habits to unlock."}
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
  color,
}: { 
  children: React.ReactNode, 
  title: string, 
  time: string, 
  color: 'violet' | 'blue' | 'emerald' | 'amber',
}) {
  const colorClasses = {
    violet: "bg-violet-500",
    blue: "bg-blue-500",
    emerald: "bg-emerald-500",
    amber: "bg-amber-500",
  }

  return (
    <StaggerItem className="relative pl-8">
      {/* Node */}
      <div className={cn(
        "absolute -left-[19px] top-2 w-4 h-4 rounded-full border border-white shadow-sm z-10 transition-colors",
        colorClasses[color] // Dot color
      )} />

      <div className="flex items-center gap-4 mb-6">
        <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">{title}</h3>
        <div className="h-px bg-kawkab-stroke flex-1"></div>
        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full border border-kawkab-stroke text-muted-foreground bg-white">{time}</span>
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
  onChange,
  icon 
}: { 
  label: string, 
  sublabel?: string | null, 
  checked: boolean, 
  onChange: (c: boolean) => void,
  icon?: string | null
}) {
  const Icon = (icon && IconMap[icon]) || Circle

  return (
    <div 
      onClick={() => onChange(!checked)}
      className={cn(
        "group flex items-center justify-between p-5 rounded-3xl border transition-all duration-300 cursor-pointer",
        checked 
          ? "bg-kawkab-off-white border-transparent opacity-50 hover:opacity-100" 
          : "bg-white border-kawkab-stroke hover:border-kawkab-black hover:shadow-lg hover:-translate-y-0.5"
      )}
    >
      <div className="flex items-center gap-4">
         <div className={cn("p-2 rounded-full border border-kawkab-stroke text-muted-foreground transition-colors", checked && "bg-transparent border-transparent opacity-0 w-0 p-0 overflow-hidden")}>
            <Icon className="w-5 h-5" />
         </div>
         <div>
            <h4 className={cn("text-lg font-bold tracking-tight transition-all", checked && "line-through text-muted-foreground")}>{label}</h4>
            {sublabel && <p className="text-sm text-muted-foreground mt-1 font-medium">{sublabel}</p>}
         </div>
      </div>

      <div className={cn(
        "w-8 h-8 rounded-full border flex items-center justify-center transition-all duration-300",
        checked 
          ? "border-black bg-black text-white" 
          : "border-kawkab-stroke group-hover:border-black"
      )}>
        <CheckCircle2 className={cn("w-5 h-5 transition-transform duration-300", checked ? "scale-100" : "scale-0 opacity-0")} />
      </div>
    </div>
  )
}
