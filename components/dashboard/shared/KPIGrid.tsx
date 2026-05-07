import { KPICard } from './KPICard'
import { cn } from '@/lib/utils'
import type { KPI } from '@/lib/types'

interface KPIGridProps {
  kpis:       KPI[]
  columns?:   number
  compact?:   boolean
  className?: string
}

const GRID_COLS: Record<number, string> = {
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-4',
  6: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6',
}

export function KPIGrid({ kpis, columns = 6, compact = false, className }: KPIGridProps) {
  const gridClass = GRID_COLS[columns] ?? GRID_COLS[6]
  return (
    <div className={cn('grid gap-4', gridClass, className)}>
      {kpis.map((kpi) => (
        <KPICard key={kpi.id} kpi={kpi} compact={compact} />
      ))}
    </div>
  )
}
