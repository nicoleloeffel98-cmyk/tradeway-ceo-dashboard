'use client'
import { usePeriodFilter } from '@/lib/hooks/usePeriodFilter'

export function ScorecardTimeline() {
  const { label } = usePeriodFilter()
  return (
    <div className="flex items-center gap-2">
      <span className="size-1.5 rounded-full bg-green-500 animate-pulse" />
      <p className="text-xs text-muted-foreground">
        Showing performance for:{' '}
        <span className="font-semibold text-foreground">{label}</span>
      </p>
    </div>
  )
}
