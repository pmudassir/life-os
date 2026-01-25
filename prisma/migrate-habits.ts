import { PrismaClient, FrequencyType } from '@prisma/client'

const prisma = new PrismaClient()
const TEMP_USER_ID = 'temp-user-001'

async function migrate() {
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
    // Specific Handling needed for DSA and Reading
  ]

  const habitMap = new Map<string, string>() // key -> habitId

  for (const h of standardHabits) {
    const habit = await prisma.habit.create({
      data: {
        userId: TEMP_USER_ID,
        title: h.title,
        section: h.section,
        icon: h.icon,
        color: h.color,
        frequency: h.freq,
      }
    })
    habitMap.set(h.key, habit.id)
    console.log(`Created habit: ${h.title}`)
  }

  // 2. Migrate Data
  const routines = await prisma.dailyRoutine.findMany({
    where: { userId: TEMP_USER_ID }
  })

  console.log(`Found ${routines.length} routines to migrate.`)

  for (const routine of routines) {
    for (const [key, habitId] of habitMap.entries()) {
      // @ts-expect-error accessing dynamic property
      const isDone = routine[key] === true
      if (isDone) {
        await prisma.habitLog.upsert({
            where: { habitId_date: { habitId, date: routine.date } },
            create: { habitId, date: routine.date, completed: true },
            update: { completed: true }
        })
      }
    }
  }

  console.log('Migration complete.')
}

migrate()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
