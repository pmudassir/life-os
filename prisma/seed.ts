import { PrismaClient, TopicCategory, Difficulty, TopicStatus } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create a default user
  const user = await prisma.user.upsert({
    where: { email: 'user@lifeos.app' },
    update: {},
    create: {
      id: 'temp-user-001',
      email: 'user@lifeos.app',
      name: 'Life OS User',
    },
  })

  console.log('✅ Created user:', user.email)

  // DSA Topics - Phase 1 (Foundations)
  const dsaPhase1 = [
    { title: 'Arrays & Hashing', difficulty: Difficulty.EASY },
    { title: 'Two Pointers', difficulty: Difficulty.EASY },
    { title: 'Sliding Window', difficulty: Difficulty.MEDIUM },
    { title: 'Stack', difficulty: Difficulty.EASY },
    { title: 'Binary Search', difficulty: Difficulty.EASY },
    { title: 'Linked List', difficulty: Difficulty.MEDIUM },
  ]

  // DSA Topics - Phase 2 (Intermediate)
  const dsaPhase2 = [
    { title: 'Trees & BST', difficulty: Difficulty.MEDIUM },
    { title: 'Tries', difficulty: Difficulty.MEDIUM },
    { title: 'Heap / Priority Queue', difficulty: Difficulty.MEDIUM },
    { title: 'Backtracking', difficulty: Difficulty.MEDIUM },
    { title: 'Graphs - BFS/DFS', difficulty: Difficulty.MEDIUM },
    { title: 'Dynamic Programming 1D', difficulty: Difficulty.HARD },
  ]

  // DSA Topics - Phase 3 (Advanced)
  const dsaPhase3 = [
    { title: 'Dynamic Programming 2D', difficulty: Difficulty.HARD },
    { title: 'Greedy Algorithms', difficulty: Difficulty.MEDIUM },
    { title: 'Intervals', difficulty: Difficulty.MEDIUM },
    { title: 'Math & Geometry', difficulty: Difficulty.MEDIUM },
    { title: 'Bit Manipulation', difficulty: Difficulty.MEDIUM },
    { title: 'Advanced Graphs (Dijkstra, Union-Find)', difficulty: Difficulty.HARD },
  ]

  // System Design Topics - Phase 1
  const systemPhase1 = [
    { title: 'Scalability & Load Balancing', difficulty: Difficulty.EASY },
    { title: 'Caching Strategies', difficulty: Difficulty.EASY },
    { title: 'Database Fundamentals (SQL vs NoSQL)', difficulty: Difficulty.EASY },
    { title: 'API Design (REST vs GraphQL)', difficulty: Difficulty.EASY },
  ]

  // System Design Topics - Phase 2
  const systemPhase2 = [
    { title: 'Message Queues & Event-Driven', difficulty: Difficulty.MEDIUM },
    { title: 'Microservices Architecture', difficulty: Difficulty.MEDIUM },
    { title: 'Database Sharding & Replication', difficulty: Difficulty.MEDIUM },
    { title: 'CDN & Edge Computing', difficulty: Difficulty.MEDIUM },
  ]

  // System Design Topics - Phase 3
  const systemPhase3 = [
    { title: 'Design Twitter/X', difficulty: Difficulty.HARD },
    { title: 'Design YouTube', difficulty: Difficulty.HARD },
    { title: 'Design Uber/Lyft', difficulty: Difficulty.HARD },
    { title: 'Design Distributed Search', difficulty: Difficulty.HARD },
  ]

  // Insert DSA topics
  let order = 0
  for (const topic of dsaPhase1) {
    await prisma.roadmapTopic.upsert({
      where: {
        id: `dsa-p1-${order}`,
      },
      update: {},
      create: {
        id: `dsa-p1-${order}`,
        userId: user.id,
        title: topic.title,
        category: TopicCategory.DSA,
        difficulty: topic.difficulty,
        phase: 1,
        order: order++,
        status: TopicStatus.NOT_STARTED,
      },
    })
  }
  
  order = 0
  for (const topic of dsaPhase2) {
    await prisma.roadmapTopic.upsert({
      where: { id: `dsa-p2-${order}` },
      update: {},
      create: {
        id: `dsa-p2-${order}`,
        userId: user.id,
        title: topic.title,
        category: TopicCategory.DSA,
        difficulty: topic.difficulty,
        phase: 2,
        order: order++,
        status: TopicStatus.NOT_STARTED,
      },
    })
  }

  order = 0
  for (const topic of dsaPhase3) {
    await prisma.roadmapTopic.upsert({
      where: { id: `dsa-p3-${order}` },
      update: {},
      create: {
        id: `dsa-p3-${order}`,
        userId: user.id,
        title: topic.title,
        category: TopicCategory.DSA,
        difficulty: topic.difficulty,
        phase: 3,
        order: order++,
        status: TopicStatus.NOT_STARTED,
      },
    })
  }

  // Insert System Design topics
  order = 0
  for (const topic of systemPhase1) {
    await prisma.roadmapTopic.upsert({
      where: { id: `sys-p1-${order}` },
      update: {},
      create: {
        id: `sys-p1-${order}`,
        userId: user.id,
        title: topic.title,
        category: TopicCategory.SYSTEM,
        difficulty: topic.difficulty,
        phase: 1,
        order: order++,
        status: TopicStatus.NOT_STARTED,
      },
    })
  }

  order = 0
  for (const topic of systemPhase2) {
    await prisma.roadmapTopic.upsert({
      where: { id: `sys-p2-${order}` },
      update: {},
      create: {
        id: `sys-p2-${order}`,
        userId: user.id,
        title: topic.title,
        category: TopicCategory.SYSTEM,
        difficulty: topic.difficulty,
        phase: 2,
        order: order++,
        status: TopicStatus.NOT_STARTED,
      },
    })
  }

  order = 0
  for (const topic of systemPhase3) {
    await prisma.roadmapTopic.upsert({
      where: { id: `sys-p3-${order}` },
      update: {},
      create: {
        id: `sys-p3-${order}`,
        userId: user.id,
        title: topic.title,
        category: TopicCategory.SYSTEM,
        difficulty: topic.difficulty,
        phase: 3,
        order: order++,
        status: TopicStatus.NOT_STARTED,
      },
    })
  }

  console.log('✅ Created DSA topics:', dsaPhase1.length + dsaPhase2.length + dsaPhase3.length)
  console.log('✅ Created System Design topics:', systemPhase1.length + systemPhase2.length + systemPhase3.length)
  console.log('🎉 Seed completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
