'use client'
import { useDashboardStore } from '@/lib/stores/useDashboardStore'

// Period selector is rendered as a static indicator in the TopNav.
// Interactive period filtering is reserved for Phase 3.
// This component is kept for future wiring; it exports the current period value.
export function usePeriodLabel() {
  const period = useDashboardStore((s) => s.period)
  const labels: Record<string, string> = {
    WTD: 'Week to Date',
    MTD: 'Month to Date',
    QTD: 'Quarter to Date',
    YTD: 'Year to Date',
  }
  return labels[period] ?? period
}
