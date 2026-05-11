'use client'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus, AlertTriangle, ArrowRight, Calendar } from 'lucide-react'
import Link from 'next/link'
import { useTrackerStore } from '@/lib/stores/useTrackerStore'
import { cn } from '@/lib/utils'

function M(n: number) { return `R${(Math.abs(n) / 1_000_000).toFixed(1)}M` }
function pct(n: number) { return `${(n * 100).toFixed(1)}%` }

export function WeeklyChangeBrief() {
  const latest  = useTrackerStore((s) => s.latest)
  const wowDelta = useTrackerStore((s) => s.wowDelta)

  if (!latest) return null

  const actualPct = latest.derived.pctToAnnualTarget
  const isWoW     = !!wowDelta

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="rounded-xl border border-border bg-card/60 p-4 space-y-3"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="rounded-lg bg-[#e8640c]/10 p-1.5">
            <Calendar className="size-4 text-[#e8640c]" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">
              {isWoW ? 'Weekly Change Brief' : 'Tracker Brief'}
            </p>
            <p className="text-[10px] text-muted-foreground">
              {isWoW
                ? `${wowDelta.fromDate} → ${wowDelta.toDate}`
                : latest.reportingWeek
              }
            </p>
          </div>
        </div>

        {/* Overall GP indicator */}
        <div className="text-right shrink-0">
          <p className="text-xs font-mono font-semibold text-foreground">{M(latest.derived.totalForecastGP)}</p>
          <p className="text-[10px] text-muted-foreground">forecast of {M(latest.derived.annualTarget)}</p>
          <p className={cn('text-[10px] font-medium mt-0.5',
            actualPct >= 0.7 ? 'text-green-400' : actualPct >= 0.5 ? 'text-amber-400' : 'text-red-400'
          )}>
            {pct(actualPct)} to annual target
          </p>
        </div>
      </div>

      {/* WoW bullets or single-snapshot bullets */}
      <div className="space-y-1.5">
        {isWoW ? (
          wowDelta.executiveBullets.map((bullet, i) => {
            const Icon = i === 0 ? (wowDelta.totalActualDelta > 0 ? TrendingUp : TrendingDown)
                       : i === 1 ? AlertTriangle
                       : i === 2 ? TrendingUp
                       : Minus
            const iconColor = i === 0 ? (wowDelta.totalActualDelta > 0 ? 'text-green-400' : 'text-red-400')
                            : i === 1 ? 'text-amber-400'
                            : i === 2 ? 'text-green-400'
                            : 'text-muted-foreground'
            return (
              <div key={i} className="flex items-start gap-2">
                <Icon className={cn('mt-0.5 size-3.5 shrink-0', iconColor)} />
                <p className="text-[11px] text-muted-foreground leading-relaxed">{bullet}</p>
              </div>
            )
          })
        ) : (
          // Single snapshot: generate on-the-fly bullets
          <>
            <div className="flex items-start gap-2">
              <TrendingUp className={cn('mt-0.5 size-3.5 shrink-0',
                actualPct >= 0.6 ? 'text-green-400' : 'text-amber-400'
              )} />
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                YTD GP: <strong className="text-foreground">{M(latest.derived.totalActualGP)}</strong> actual,{' '}
                <strong className="text-foreground">{M(latest.derived.totalForecastGP)}</strong> forecast —{' '}
                {pct(actualPct)} of the <strong className="text-foreground">{M(latest.derived.annualTarget)}</strong> annual target.
              </p>
            </div>
            {latest.derived.atRiskReps.length > 0 && (
              <div className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-amber-400" />
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  <strong className="text-amber-300">{latest.derived.atRiskReps.length} rep{latest.derived.atRiskReps.length > 1 ? 's' : ''}</strong> below 60% annual attainment:{' '}
                  {latest.derived.atRiskReps.map((r) => `${r.name.split(' ')[0]} (${pct(r.pct)})`).join(', ')}.
                </p>
              </div>
            )}
            {latest.derived.onTrackReps.length > 0 && (
              <div className="flex items-start gap-2">
                <TrendingUp className="mt-0.5 size-3.5 shrink-0 text-green-400" />
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  <strong className="text-green-300">{latest.derived.onTrackReps.length} rep{latest.derived.onTrackReps.length > 1 ? 's' : ''}</strong> on track (≥80%):{' '}
                  {latest.derived.onTrackReps.map((r) => `${r.name.split(' ')[0]} (${pct(r.pct)})`).join(', ')}.
                </p>
              </div>
            )}
            {latest.quarterly.q2.forecast < latest.quarterly.q2.budget * 0.65 && (
              <div className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-amber-400" />
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Q2 forecast at{' '}
                  <strong className="text-amber-300">{pct(latest.quarterly.q2.budget > 0 ? latest.quarterly.q2.forecast / latest.quarterly.q2.budget : 0)}</strong>{' '}
                  of target — June–August pipeline needs acceleration.
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* WoW alerts */}
      {isWoW && wowDelta.alerts.length > 0 && (
        <div className="space-y-1 border-t border-border/40 pt-2.5">
          {wowDelta.alerts.slice(0, 2).map((alert, i) => (
            <div key={i} className={cn(
              'flex items-start gap-2 rounded px-2 py-1.5 text-[10px]',
              alert.severity === 'critical'
                ? 'bg-red-950/30 border border-red-900/30 text-red-300'
                : 'bg-amber-950/25 border border-amber-900/30 text-amber-300',
            )}>
              <AlertTriangle className="mt-0.5 size-3 shrink-0" />
              <span>{alert.message}</span>
            </div>
          ))}
        </div>
      )}

      {/* CEO actions */}
      {isWoW && wowDelta.recommendedActions.length > 0 && (
        <div className="border-t border-border/40 pt-2.5">
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
            CEO recommended actions
          </p>
          {wowDelta.recommendedActions.slice(0, 2).map((action, i) => (
            <div key={i} className="flex items-start gap-2 mb-1">
              <span className="shrink-0 text-[10px] font-mono text-[#e8640c] mt-0.5">{i + 1}.</span>
              <p className="text-[11px] text-muted-foreground">{action}</p>
            </div>
          ))}
        </div>
      )}

      {/* Footer CTA */}
      <div className="flex items-center justify-between border-t border-border/40 pt-2.5">
        <p className="text-[10px] text-muted-foreground/50">
          {isWoW ? `Comparing ${wowDelta.fromDate} to ${wowDelta.toDate}` : `From ${latest.fileName}`}
        </p>
        <Link
          href="/admin/import"
          className="flex items-center gap-1 text-[10px] text-[#e8640c] hover:underline"
        >
          {isWoW ? 'Upload next week' : 'Upload comparison week'}
          <ArrowRight className="size-3" />
        </Link>
      </div>
    </motion.div>
  )
}
