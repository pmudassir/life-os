'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Clock,
  BookOpen,
  Briefcase,
  Coffee,
  Dumbbell,
  Code,
  Users,
  Calendar,
} from 'lucide-react'

interface TimeBlock {
  id: string
  date: Date
  startTime: string
  endTime: string
  duration: number
  title: string
  category: string
  color: string
  completed: boolean
  projectId: string | null
  resourceId: string | null
}

interface Goal {
  id: string
  title: string
  status: string
}

interface ScheduleDashboardProps {
  data: {
    timeBlocks: TimeBlock[]
    weeklyGoals: Goal[]
    timeAllocation: Record<string, number>
    totalScheduledHours: number
  }
}

const typeIcons: Record<string, React.ReactNode> = {
  deep_work: <Code className="w-4 h-4" />,
  learning: <BookOpen className="w-4 h-4" />,
  meetings: <Users className="w-4 h-4" />,
  exercise: <Dumbbell className="w-4 h-4" />,
  break: <Coffee className="w-4 h-4" />,
  work: <Briefcase className="w-4 h-4" />,
}

const typeColors: Record<string, string> = {
  deep_work: 'bg-purple-500 border-purple-600',
  learning: 'bg-blue-500 border-blue-600',
  meetings: 'bg-orange-500 border-orange-600',
  exercise: 'bg-green-500 border-green-600',
  break: 'bg-gray-400 border-gray-500',
  work: 'bg-indigo-500 border-indigo-600',
}

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const shortDayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function ScheduleDashboard({ data }: ScheduleDashboardProps) {
  const [selectedDay, setSelectedDay] = useState(new Date().getDay())

  // Get current week dates
  const today = new Date()
  const startOfWeek = new Date(today)
  startOfWeek.setDate(today.getDate() - today.getDay())

  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(startOfWeek)
    date.setDate(startOfWeek.getDate() + i)
    return date
  })

  const getBlocksForDay = (dayOfWeek: number) => {
    return data.timeBlocks.filter((block) => {
      const blockDate = new Date(block.date)
      return blockDate.getDay() === dayOfWeek
    })
  }

  // Hours for the schedule grid
  const hours = Array.from({ length: 17 }, (_, i) => i + 6) // 6 AM to 10 PM

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Weekly Calendar View */}
      <Card className="lg:col-span-3">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Weekly Schedule</CardTitle>
            <div className="flex gap-2">
              {weekDates.map((date, index) => (
                <Button
                  key={index}
                  variant={selectedDay === index ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setSelectedDay(index)}
                  className="flex flex-col h-auto py-2 px-3"
                >
                  <span className="text-xs">{shortDayNames[index]}</span>
                  <span className="text-lg font-bold">{date.getDate()}</span>
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {/* Time labels */}
            <div className="absolute left-0 top-0 w-16 space-y-0">
              {hours.map((hour) => (
                <div
                  key={hour}
                  className="h-16 text-xs text-muted-foreground pr-2 text-right"
                >
                  {hour.toString().padStart(2, '0')}:00
                </div>
              ))}
            </div>

            {/* Schedule grid */}
            <div className="ml-16 relative" style={{ minHeight: hours.length * 64 }}>
              {/* Hour lines */}
              {hours.map((hour) => (
                <div
                  key={hour}
                  className="absolute left-0 right-0 border-t border-border"
                  style={{ top: (hour - 6) * 64 }}
                />
              ))}

              {/* Time blocks */}
              {getBlocksForDay(selectedDay).map((block) => {
                const [startHour, startMin] = block.startTime.split(':').map(Number)
                const [endHour, endMin] = block.endTime.split(':').map(Number)
                const top = (startHour - 6) * 64 + (startMin / 60) * 64
                const height = ((endHour - startHour) * 60 + (endMin - startMin)) * (64 / 60)

                return (
                  <div
                    key={block.id}
                    className={`absolute left-1 right-1 rounded-lg p-2 text-white ${
                      typeColors[block.category] || block.color || 'bg-gray-500'
                    }`}
                    style={{ top, height }}
                  >
                    <div className="flex items-center gap-1 text-sm font-medium">
                      {typeIcons[block.category]}
                      <span className="truncate">{block.title}</span>
                    </div>
                    <div className="text-xs opacity-90">
                      {block.startTime} - {block.endTime}
                    </div>
                  </div>
                )
              })}

              {/* Empty state */}
              {getBlocksForDay(selectedDay).length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No blocks scheduled for {dayNames[selectedDay]}</p>
                    <Button variant="outline" size="sm" className="mt-2">
                      Add Time Block
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Time Allocation */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Time Allocation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(data.timeAllocation).map(([category, hours]) => (
              <div key={category} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`p-1.5 rounded ${
                      typeColors[category]?.split(' ')[0] || 'bg-gray-500'
                    } text-white`}
                  >
                    {typeIcons[category] || <Clock className="w-3 h-3" />}
                  </div>
                  <span className="text-sm capitalize">{category.replace('_', ' ')}</span>
                </div>
                <span className="font-medium">{hours.toFixed(1)}h</span>
              </div>
            ))}
            {Object.keys(data.timeAllocation).length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No time blocks added yet
              </p>
            )}
          </CardContent>
        </Card>

        {/* Weekly Goals */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Active Goals</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.weeklyGoals.map((goal) => (
              <div
                key={goal.id}
                className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg"
              >
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span className="text-sm truncate">{goal.title}</span>
              </div>
            ))}
            {data.weeklyGoals.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No active goals
              </p>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Add</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" className="justify-start">
              <Code className="w-4 h-4 mr-2" />
              Deep Work
            </Button>
            <Button variant="outline" size="sm" className="justify-start">
              <BookOpen className="w-4 h-4 mr-2" />
              Learning
            </Button>
            <Button variant="outline" size="sm" className="justify-start">
              <Users className="w-4 h-4 mr-2" />
              Meeting
            </Button>
            <Button variant="outline" size="sm" className="justify-start">
              <Dumbbell className="w-4 h-4 mr-2" />
              Exercise
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
