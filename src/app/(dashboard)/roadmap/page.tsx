import { Header } from '@/components/layout/header'
import { getRoadmapTopics } from '@/actions/roadmap'
import { RoadmapClient } from './roadmap-client'

// Prevent static prerendering - this page needs database access
export const dynamic = 'force-dynamic'

export default async function RoadmapPage() {
  const { byPhase, progress } = await getRoadmapTopics()

  return (
    <div className="space-y-6 h-full">
      <Header
        title="Mastery Path"
        subtitle="DSA & System Design"
      />

      <RoadmapClient 
        progress={progress} 
        byPhase={byPhase} 
      />
    </div>
  )
}
