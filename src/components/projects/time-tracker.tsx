'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Clock, Play, Square } from 'lucide-react'
import { formatDuration } from '@/lib/utils'

interface TimeEntryData {
  id: string
  description?: string
  startTime: Date
  duration: number
  category: string | null
}

interface TimeTrackerProps {
  timeEntries: TimeEntryData[]
  timeByCategory: Record<string, number>
}

const categories = [
  { value: 'coding', label: 'Coding', color: 'bg-blue-500' },
  { value: 'learning', label: 'Learning', color: 'bg-purple-500' },
  { value: 'meeting', label: 'Meetings', color: 'bg-amber-500' },
  { value: 'planning', label: 'Planning', color: 'bg-emerald-500' },
  { value: 'content', label: 'Content', color: 'bg-pink-500' },
  { value: 'other', label: 'Other', color: 'bg-slate-500' },
]

export function TimeTracker({ timeEntries, timeByCategory }: TimeTrackerProps) {
  const [isTracking, setIsTracking] = useState(false)
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('coding')
  const [startTime, setStartTime] = useState<Date | null>(null)

  const handleStart = () => {
    setIsTracking(true)
    setStartTime(new Date())
  }

  const handleStop = () => {
    setIsTracking(false)
    // Here you would save the time entry
    setDescription('')
    setStartTime(null)
  }

  // Group entries by date
  const grouped = timeEntries.reduce((acc, entry) => {
    const date = new Date(entry.startTime).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    })
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(entry)
    return acc
  }, {} as Record<string, TimeEntryData[]>)

  const totalTracked = Object.values(timeByCategory).reduce((a, b) => a + b, 0)

  return (
    <div className="space-y-6">
      {/* Time Distribution */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Time Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          {totalTracked === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No time tracked yet
            </p>
          ) : (
            <div className="space-y-3">
              {Object.entries(timeByCategory)
                .sort(([, a], [, b]) => b - a)
                .map(([cat, minutes]) => {
                  const percentage = (minutes / totalTracked) * 100
                  const categoryInfo = categories.find(c => c.value === cat) || categories[5]
                  return (
                    <div key={cat} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="capitalize">{cat}</span>
                        <span className="text-muted-foreground">
                          {formatDuration(minutes)} ({Math.round(percentage)}%)
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full ${categoryInfo.color} transition-all duration-500`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Timer */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Quick Timer</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="What are you working on?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isTracking}
              className="flex-1"
            />
            <Select
              value={category}
              onValueChange={setCategory}
              disabled={isTracking}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={isTracking ? handleStop : handleStart}
            variant={isTracking ? 'destructive' : 'default'}
            className="w-full"
          >
            {isTracking ? (
              <>
                <Square className="w-4 h-4 mr-2" />
                Stop Tracking
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Start Tracking
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Recent Entries */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Recent Entries</CardTitle>
        </CardHeader>
        <CardContent>
          {Object.entries(grouped).slice(0, 3).map(([date, entries]) => (
            <div key={date} className="mb-4 last:mb-0">
              <h4 className="text-sm font-medium text-muted-foreground mb-2">
                {date}
              </h4>
              <div className="space-y-2">
                {entries.slice(0, 5).map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between p-3 bg-muted rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{entry.description || 'No description'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs capitalize text-muted-foreground">
                        {entry.category}
                      </span>
                      <span className="text-sm font-medium">
                        {formatDuration(entry.duration)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
