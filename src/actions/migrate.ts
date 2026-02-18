'use server'

import { prisma } from '@/lib/prisma'
import { FrequencyType } from '@prisma/client'
import { requireUserId } from '@/lib/auth'

export async function migrateLegacyData() {
  const userId = await requireUserId()
  console.log('Starting migration...')

  // 1. Create Standard Habits if they don't exist
  const standardHabits = [
    { key: 'fajrDone', title: 'Fajr', section: 'Daily Prayers', icon: 'Moon', color: 'violet', freq: FrequencyType.DAILY },
    { key: 'dhuhrDone', title: 'Dhuhr', section: 'Daily Prayers', icon: 'Sun', color: 'violet', freq: FrequencyType.DAILY },
    { key: 'asrDone', title: 'Asr', section: 'Daily Prayers', icon: 'CloudSun', color: 'violet', freq: FrequencyType.DAILY },
    { key: 'maghribDone', title: 'Maghrib', section: 'Daily Prayers', icon: 'Sunset', color: 'violet', freq: FrequencyType.DAILY },
    { key: 'ishaDone', title: 'Isha', section: 'Daily Prayers', icon: 'Moon', color: 'violet', freq: FrequencyType.DAILY },
    { key: 'workDone', title: 'Remote Work', section: 'Deep Work', icon: 'Laptop', color: 'blue', freq: FrequencyType.WEEKDAYS },
    { key: 'freelanceDone', title: 'Freelance Projects', section: 'Deep Work', icon: 'Briefcase', color: 'blue', freq: FrequencyType.DAILY },
    { key: 'gymDone', title: 'Gym Session', section: 'Discipline & Growth', icon: 'Dumbbell', color: 'emerald', freq: FrequencyType.DAILY },
    { key: 'instituteDone', title: 'Coding Institute', section: 'Discipline & Growth', icon: 'School', color: 'emerald', freq: FrequencyType.WEEKDAYS },
  ]

  const habitMap = new Map<string, string>() // key -> habitId

  for (const h of standardHabits) {
    // Check if habit exists
    const existing = await prisma.habit.findFirst({
        where: { userId, title: h.title }
    })

    if (existing) {
        habitMap.set(h.key, existing.id)
        continue
    }

    const habit = await prisma.habit.create({
      data: {
        userId,
        title: h.title,
        section: h.section,
        icon: h.icon,
        color: h.color,
        frequency: h.freq,
      }
    })
    habitMap.set(h.key, habit.id)
  }

  // 2. Migrate Data
  const routines = await prisma.dailyRoutine.findMany({
    where: { userId }
  })

  let migratedCount = 0

  for (const routine of routines) {
    for (const [key, habitId] of habitMap.entries()) {
      // @ts-expect-error dynamic access
      const isDone = routine[key] === true
      if (isDone) {
        await prisma.habitLog.upsert({
            where: { habitId_date: { habitId, date: routine.date } },
            create: { habitId, date: routine.date, completed: true },
            update: { completed: true }
        })
      }
    }
    migratedCount++
  }

  return { success: true, count: migratedCount }
}
