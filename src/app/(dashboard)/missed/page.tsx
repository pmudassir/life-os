import { Header } from '@/components/layout/header'
import { Card, CardContent } from '@/components/ui/card'
import { getMissedDays } from '@/actions/routine'
import { format } from 'date-fns'

export default async function MissedPage() {
  const missedDays = await getMissedDays(30)

  return (
    <div className="space-y-6">
      <Header
        title="Missed Days"
        subtitle="Days with gaps to reflect on"
      />

      {/* Encouraging Message */}
      <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
        <CardContent className="py-4">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            💡 This view helps you identify patterns, not to shame. 
            Each day is a new opportunity.
          </p>
        </CardContent>
      </Card>

      {missedDays.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <span className="text-4xl mb-4 block">🎉</span>
            <p className="text-lg font-medium text-slate-700 dark:text-slate-300">
              No missed days in the last 30 days!
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              Keep up the excellent work.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {missedDays.map(({ date, routine, missingPrayers, missingDsa }) => (
            <Card
              key={routine.id}
              className="border-l-4 border-l-amber-400 dark:border-l-amber-500"
            >
              <CardContent className="py-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-slate-800 dark:text-slate-200">
                      {format(new Date(date), 'EEEE, MMM d')}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {missingPrayers && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          🕌 Prayers incomplete
                        </span>
                      )}
                      {missingDsa && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          🧠 DSA skipped
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    {routine.dayRating && (
                      <p className="text-amber-500">
                        {'★'.repeat(routine.dayRating)}
                        {'☆'.repeat(5 - routine.dayRating)}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Summary Stats */}
      {missedDays.length > 0 && (
        <Card>
          <CardContent className="py-6">
            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-4">
              Pattern Summary (Last 30 Days)
            </h3>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-slate-700 dark:text-slate-300">
                  {missedDays.filter((d) => d.missingPrayers).length}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Days with prayer gaps
                </p>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-700 dark:text-slate-300">
                  {missedDays.filter((d) => d.missingDsa).length}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Days without DSA
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
