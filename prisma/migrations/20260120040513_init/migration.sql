-- CreateEnum
CREATE TYPE "DsaType" AS ENUM ('NONE', 'DSA', 'SYSTEM');

-- CreateEnum
CREATE TYPE "TopicCategory" AS ENUM ('DSA', 'SYSTEM');

-- CreateEnum
CREATE TYPE "Difficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- CreateEnum
CREATE TYPE "TopicStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'DONE');

-- CreateEnum
CREATE TYPE "PlannedTime" AS ENUM ('30', '45', '60');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyRoutine" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "userId" TEXT NOT NULL,
    "fajrDone" BOOLEAN NOT NULL DEFAULT false,
    "gymDone" BOOLEAN NOT NULL DEFAULT false,
    "dsaType" "DsaType" NOT NULL DEFAULT 'NONE',
    "workDone" BOOLEAN NOT NULL DEFAULT false,
    "instituteDone" BOOLEAN NOT NULL DEFAULT false,
    "freelanceDone" BOOLEAN NOT NULL DEFAULT false,
    "readingPages" INTEGER NOT NULL DEFAULT 0,
    "footballDone" BOOLEAN NOT NULL DEFAULT false,
    "allPrayersDone" BOOLEAN NOT NULL DEFAULT false,
    "dayRating" SMALLINT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyRoutine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoadmapTopic" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" "TopicCategory" NOT NULL,
    "difficulty" "Difficulty" NOT NULL,
    "phase" SMALLINT NOT NULL,
    "status" "TopicStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "notes" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoadmapTopic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyPlanner" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "userId" TEXT NOT NULL,
    "roadmapTopicId" TEXT NOT NULL,
    "plannedTime" "PlannedTime" NOT NULL DEFAULT '30',
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "reflection" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "dailyRoutineId" TEXT,

    CONSTRAINT "DailyPlanner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeeklyReflection" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "weekStartDate" DATE NOT NULL,
    "wins" TEXT,
    "misses" TEXT,
    "nextWeekFocus" TEXT,
    "faithReflection" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WeeklyReflection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "DailyRoutine_userId_date_idx" ON "DailyRoutine"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "DailyRoutine_userId_date_key" ON "DailyRoutine"("userId", "date");

-- CreateIndex
CREATE INDEX "RoadmapTopic_userId_category_phase_idx" ON "RoadmapTopic"("userId", "category", "phase");

-- CreateIndex
CREATE INDEX "DailyPlanner_userId_date_idx" ON "DailyPlanner"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "DailyPlanner_userId_date_roadmapTopicId_key" ON "DailyPlanner"("userId", "date", "roadmapTopicId");

-- CreateIndex
CREATE INDEX "WeeklyReflection_userId_weekStartDate_idx" ON "WeeklyReflection"("userId", "weekStartDate");

-- CreateIndex
CREATE UNIQUE INDEX "WeeklyReflection_userId_weekStartDate_key" ON "WeeklyReflection"("userId", "weekStartDate");

-- AddForeignKey
ALTER TABLE "DailyRoutine" ADD CONSTRAINT "DailyRoutine_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoadmapTopic" ADD CONSTRAINT "RoadmapTopic_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyPlanner" ADD CONSTRAINT "DailyPlanner_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyPlanner" ADD CONSTRAINT "DailyPlanner_roadmapTopicId_fkey" FOREIGN KEY ("roadmapTopicId") REFERENCES "RoadmapTopic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyPlanner" ADD CONSTRAINT "DailyPlanner_dailyRoutineId_fkey" FOREIGN KEY ("dailyRoutineId") REFERENCES "DailyRoutine"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeeklyReflection" ADD CONSTRAINT "WeeklyReflection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
