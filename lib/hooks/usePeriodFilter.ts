'use client'
import { useDashboardStore } from '@/lib/stores/useDashboardStore'
import type { Period } from '@/lib/types'

export const PERIOD_LABELS: Record<Period, string> = {
  WTD: 'Week to Date',
  MTD: 'Month to Date',
  QTD: 'Quarter to Date',
  YTD: 'Year to Date',
}

export const PERIODS: Period[] = ['WTD', 'MTD', 'QTD', 'YTD']

export function usePeriodFilter() {
  const period    = useDashboardStore((s) => s.period)
  const setPeriod = useDashboardStore((s) => s.setPeriod)
  return { period, setPeriod, label: PERIOD_LABELS[period] }
}
