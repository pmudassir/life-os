import { getMissedHabitDays } from '@/actions/habit'
import { format } from 'date-fns'
import { Circle } from 'lucide-react'

// Prevent static prerendering - this page needs database access
export const dynamic = 'force-dynamic'

export default async function MissedPage() {
  const missedDays = await getMissedHabitDays(30)

  return (
    <div className="h-full flex flex-col gap-12 pt-12">
      {/* Header Section */}
      <div className="flex flex-col gap-4 px-2">
        <span className="px-4 py-1.5 rounded-full border border-kawkab-stroke text-xs font-bold uppercase tracking-widest text-kawkab-gray bg-white/50 backdrop-blur-sm w-fit">
            History &amp; Reflection
        </span>
        <h1 className="text-6xl md:text-8xl font-bold tracking-tighter leading-[0.9] text-foreground">
          Gaps to <br/> reflect on
        </h1>
        <p className="text-lg text-muted-foreground mt-4 max-w-md leading-relaxed">
          Patterns aren&apos;t meant for shame. They are clues for growth. Each gap is an invitation to start fresh.
        </p>
      </div>

      {missedDays.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-6">
          <div className="w-24 h-24 rounded-full bg-kawkab-accent flex items-center justify-center text-4xl border border-kawkab-stroke shadow-xl">
            🏆
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Perfection!</h2>
            <p className="text-muted-foreground mt-2">No missed habits in the last 30 days. You&apos;re unstoppable.</p>
          </div>
        </div>
      ) : (
        <div className="grid gap-8 pb-40">
          {missedDays.map(({ date, missedHabits }) => (
            <div key={date.toISOString()} className="group relative">
               <div className="flex items-center gap-4 mb-4 ml-6">
                  <div className="h-px bg-kawkab-stroke flex-1"></div>
                  <span className="text-sm font-bold uppercase tracking-widest text-kawkab-gray">
                    {format(date, 'EEEE, MMM d')}
                  </span>
               </div>
               
               <div className="p-8 rounded-4xl border border-kawkab-stroke bg-white/50 hover:bg-white transition-all duration-500 hover:shadow-2xl hover:shadow-black/5 hover:-translate-y-1">
                  <div className="flex flex-wrap gap-2 mb-6">
                    {Array.from(new Set(missedHabits.map(h => h.section))).map(section => (
                       <span key={section} className="px-3 py-1 rounded-full border border-kawkab-stroke text-[10px] font-bold uppercase tracking-wider bg-white">
                          {section}
                       </span>
                    ))}
                  </div>

                  <div className="grid gap-4">
                    {missedHabits.map((habit, idx) => (
                       <div key={idx} className="flex items-center justify-between p-4 rounded-3xl bg-kawkab-off-white border border-transparent hover:border-kawkab-stroke transition-all">
                          <div className="flex items-center gap-4">
                             <Circle className="w-4 h-4 text-kawkab-gray opacity-30" />
                             <span className="text-lg font-bold tracking-tight text-foreground/80">{habit.title}</span>
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-50">Missed</span>
                       </div>
                    ))}
                  </div>
               </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats Card */}
      {missedDays.length > 0 && (
         <div className="p-10 rounded-4xl bg-black text-white flex flex-col items-center text-center gap-6 mb-20 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-kawkab-accent/20 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/20 blur-[80px] rounded-full -translate-x-1/2 translate-y-1/2" />
            
            <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-xl bg-white/5">
                📊
            </div>
            <div>
                <h3 className="text-4xl font-bold tracking-tighter mb-2">30-Day Pulse</h3>
                <p className="text-white/50 text-base max-w-xs">You encountered gaps on {missedDays.length} days this month.</p>
            </div>
            
            <div className="w-full h-1 bg-white/10 rounded-full mt-4 overflow-hidden">
                <div 
                    className="h-full bg-white transition-all duration-1000" 
                    style={{ width: `${Math.max(10, 100 - (missedDays.length / 30 * 100))}%` }}
                />
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-white/30">Consistency Score</p>
         </div>
      )}
    </div>
  )
}
