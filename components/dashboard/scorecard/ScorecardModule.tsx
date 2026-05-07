import Link from 'next/link'
import { TrendingUp, TrendingDown, Minus, ChevronRight } from 'lucide-react'
import { StatusIndicator } from '@/components/shared/StatusIndicator'
import { RAG_COLORS } from '@/lib/utils/rag'
import { cn } from '@/lib/utils'
import type { ScorecardRow } from '@/lib/types'

interface ScorecardModuleProps {
  row: ScorecardRow
}

const TrendIcon = ({ dir }: { dir: string }) => {
  if (dir === 'up')   return <TrendingUp   className="size-3 text-green-400" />
  if (dir === 'down') return <TrendingDown className="size-3 text-red-400"   />
  return <Minus className="size-3 text-slate-400" />
}

export function ScorecardModuleRow({ row }: ScorecardModuleProps) {
  const color      = RAG_COLORS[row.status]
  const scoreDelta = row.scorePrior !== undefined ? row.score - row.scorePrior : null

  return (
    <Link
      href={row.href}
      className="group flex items-center gap-4 rounded-lg border border-border bg-card px-5 py-3.5 transition-all hover:bg-muted/20"
    >
      {/* Status dot */}
      <StatusIndicator status={row.status} size="md" pulse={row.status === 'red'} />

      {/* Module name + metrics */}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-foreground">{row.label}</p>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <span className="text-xs text-muted-foreground">
            {row.keyMetric}:{' '}
            <span className="font-semibold text-foreground">{row.keyMetricValue}</span>
          </span>
          {row.target && (
            <span className="text-[10px] text-muted-foreground/50">vs {row.target}</span>
          )}
          {row.delta && (
            <span className={cn('text-[10px] font-semibold', row.deltaPositive ? 'text-green-400' : 'text-red-400')}>
              {row.delta}
            </span>
          )}
        </div>
        {row.trendNote && (
          <p className="text-[10px] text-muted-foreground/50 mt-0.5 italic">{row.trendNote}</p>
        )}
      </div>

      {/* Score with trajectory */}
      <div className="hidden sm:flex flex-col items-end gap-0.5 shrink-0 w-24">
        <div className="flex items-center gap-2 w-full">
          <div className="flex-1 h-1.5 rounded-full bg-muted/40 overflow-hidden">
            <div className="h-full rounded-full transition-all" style={{ width: `${row.score}%`, backgroundColor: color }} />
          </div>
          <span className="text-xs font-semibold w-7 text-right tabular-nums" style={{ color }}>
            {row.score}
          </span>
        </div>
        {scoreDelta !== null && (
          <span className={cn('text-[9px] font-medium tabular-nums', scoreDelta > 0 ? 'text-green-400/70' : scoreDelta < 0 ? 'text-red-400/70' : 'text-muted-foreground/40')}>
            {scoreDelta > 0 ? `+${scoreDelta}` : scoreDelta < 0 ? `${scoreDelta}` : '—'} vs last mo
          </span>
        )}
      </div>

      {/* Trend icon */}
      <TrendIcon dir={row.trend} />

      {/* RAG badge */}
      <span
        className="hidden sm:inline rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide shrink-0"
        style={{ color, backgroundColor: `${color}18` }}
      >
        {row.status}
      </span>

      <ChevronRight className="size-4 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors shrink-0" />
    </Link>
  )
}
