'use client'

import { useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createHabit } from '@/actions/habit'
import { migrateLegacyData } from '@/actions/migrate'
import { Plus, RefreshCcw } from 'lucide-react'
import { FrequencyType } from '@prisma/client'

export function HabitManager() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  
  // Form State
  const [title, setTitle] = useState('')
  const [section, setSection] = useState('Morning')
  const [frequency, setFrequency] = useState<FrequencyType>(FrequencyType.DAILY)
  // const [icon, setIcon] = useState('Circle')
  const icon = 'Circle'
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      await createHabit({
        title,
        section,
        frequency,
        icon,
        color: 'violet'
      })
      setOpen(false)
      // Reset form
      setTitle('')
      setFrequency(FrequencyType.DAILY)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 rounded-full">
          <Plus className="w-4 h-4" />
          Add Habit
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-[425px]">
        <SheetHeader>
          <SheetTitle>Add New Habit</SheetTitle>
          <SheetDescription>
            Create a new habit to track in your daily routine.
          </SheetDescription>
        </SheetHeader>
        
        <form onSubmit={handleSubmit} className="grid gap-6 py-6 transition-all">
          <div className="grid gap-2">
            <label className="text-sm font-medium">Habit Title</label>
            <Input 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Drink Water"
              required
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">Section</label>
            <Select value={section} onValueChange={setSection}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Daily Prayers">Daily Prayers</SelectItem>
                <SelectItem value="Morning">Morning</SelectItem>
                <SelectItem value="Deep Work">Deep Work</SelectItem>
                <SelectItem value="Discipline & Growth">Discipline & Growth</SelectItem>
                <SelectItem value="Evening">Evening</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">Frequency</label>
            <Select 
              value={frequency} 
              onValueChange={(v) => setFrequency(v as FrequencyType)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={FrequencyType.DAILY}>Every Day</SelectItem>
                <SelectItem value={FrequencyType.WEEKDAYS}>Weekdays (Mon-Fri)</SelectItem>
                <SelectItem value={FrequencyType.WEEKENDS}>Weekends (Sat-Sun)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" disabled={loading} className="w-full rounded-full">
            {loading ? 'Creating...' : 'Create Habit'}
          </Button>

            <div className="pt-6 border-t mt-4">
                <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleMigrate} 
                    disabled={migrating}
                    className="w-full text-xs text-muted-foreground hover:text-foreground"
                >
                    <RefreshCcw className={`w-3 h-3 mr-2 ${migrating ? 'animate-spin' : ''}`} />
                    {migrating ? 'Migrating...' : 'Migrate Legacy Data'}
                </Button>
            </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
