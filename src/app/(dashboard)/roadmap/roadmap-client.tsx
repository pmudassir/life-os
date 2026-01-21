'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { FadeIn } from '@/components/ui/motion'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { TopicStatus } from '@/types'
import { Lock } from 'lucide-react'

interface RoadmapClientProps {
  progress: {
    total: number
    done: number
    inProgress: number
    notStarted: number
  }
  byPhase: {
    phase1: any[]
    phase2: any[]
    phase3: any[]
  }
}

export function RoadmapClient({ progress, byPhase }: RoadmapClientProps) {
  const [selectedPhase, setSelectedPhase] = React.useState<1 | 2 | 3>(1)
  const progressPercent = Math.round((progress.done / progress.total) * 100) || 0

  return (
    <div className="h-[calc(100vh-12rem)] flex flex-col gap-6">
      {/* Header Stats */}
      <FadeIn className="flex items-center justify-between bg-card/50 px-6 py-4 rounded-2xl border border-border/50 backdrop-blur-sm">
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Progress</span>
          <span className="text-3xl font-bold font-mono text-foreground">{progressPercent}%</span>
        </div>
        <div className="flex gap-4">
          <div className="text-right">
            <span className="block text-2xl font-bold text-emerald-500">{progress.done}</span>
            <span className="text-xs text-muted-foreground">Mastered</span>
          </div>
          <div className="text-right">
            <span className="block text-2xl font-bold text-amber-500">{progress.inProgress}</span>
            <span className="text-xs text-muted-foreground">Learning</span>
          </div>
        </div>
      </FadeIn>

      {/* Phase Selector */}
      <div className="flex p-1 bg-secondary/50 rounded-xl relative">
        {[1, 2, 3].map((phase) => (
          <button
            key={phase}
            onClick={() => setSelectedPhase(phase as 1 | 2 | 3)}
            className={cn(
              "flex-1 py-2 text-sm font-medium rounded-lg transition-all z-10",
              selectedPhase === phase ? "text-foreground shadow-sm bg-background" : "text-muted-foreground hover:text-foreground"
            )}
          >
            Phase {phase}
          </button>
        ))}
      </div>

      {/* Timeline View */}
      <ScrollArea className="flex-1 pr-4 -mr-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedPhase}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-4 pb-20 pl-4 border-l-2 border-border/50 ml-4"
          >
            <PhaseTimeline topics={byPhase[`phase${selectedPhase}` as keyof typeof byPhase]} />
          </motion.div>
        </AnimatePresence>
      </ScrollArea>
    </div>
  )
}

function PhaseTimeline({ topics }: { topics: any[] }) {
  if (topics.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
        <Lock className="w-8 h-8 mb-2 opacity-20" />
        <p>Phase locked or empty</p>
      </div>
    )
  }

  // Sort: Done -> In Progress -> Not Started
  const sortedTopics = [...topics].sort((a, b) => {
    const statusMap = { 'IN_PROGRESS': 0, 'NOT_STARTED': 1, 'DONE': 2 }
    return statusMap[a.status as TopicStatus] - statusMap[b.status as TopicStatus]
  })

  return (
    <div className="space-y-6">
      {sortedTopics.map((topic, index) => (
        <TimelineNode key={topic.id} topic={topic} index={index} />
      ))}
    </div>
  )
}

function TimelineNode({ topic, index }: { topic: any, index: number }) {
  const isDone = topic.status === 'DONE'
  const isActive = topic.status === 'IN_PROGRESS'
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="relative pl-8"
    >
      {/* Node Marker */}
      <div className={cn(
        "absolute -left-[29px] top-1 w-6 h-6 rounded-full border-4 flex items-center justify-center transition-colors bg-background z-10",
        isDone ? "border-emerald-500" : isActive ? "border-amber-500" : "border-muted"
      )}>
        {isDone && <div className="w-2 h-2 bg-emerald-500 rounded-full" />}
        {isActive && <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />}
      </div>

      {/* Card Content */}
      <div className={cn(
        "p-4 rounded-xl border transition-all duration-300 backdrop-blur-sm",
        isActive 
          ? "bg-amber-500/5 border-amber-500/30 shadow-lg shadow-amber-500/5" 
          : isDone 
            ? "bg-emerald-500/5 border-emerald-500/20 opacity-70 hover:opacity-100" 
            : "bg-card/50 border-border/50 hover:bg-card/80"
      )}>
        <div className="flex justify-between items-start mb-2">
          <div>
             <h4 className={cn(
               "font-semibold text-base",
               isDone && "line-through text-muted-foreground"
             )}>
               {topic.title}
             </h4>
             <span className="text-xs text-muted-foreground font-mono mt-1 block">
               {index + 1}. {topic.category}
             </span>
          </div>
          <Badge variant="outline" className={cn(
            "text-[10px] uppercase tracking-wider",
            topic.difficulty === 'EASY' && "text-emerald-500 border-emerald-500/20",
            topic.difficulty === 'MEDIUM' && "text-amber-500 border-amber-500/20",
            topic.difficulty === 'HARD' && "text-rose-500 border-rose-500/20",
          )}>
            {topic.difficulty}
          </Badge>
        </div>
        
        {isActive && (
          <div className="mt-3 flex items-center gap-2 text-xs font-medium text-amber-600 dark:text-amber-400">
            <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" />
            Current Focus
          </div>
        )}
      </div>
    </motion.div>
  )
}
