'use client'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { TrendSparkline } from '@/components/shared/charts/TrendSparkline'
import { formatKPIValue } from '@/lib/utils/format'
import { RAG_COLORS } from '@/lib/utils/rag'
import { cn } from '@/lib/utils'
import type { KPI } from '@/lib/types'

interface KPICardProps {
  kpi:        KPI
  onClick?:   () => void
  className?: string
  compact?:   boolean
}

const formatTrendPct = (pct: number): string => {
  const abs = Math.round(Math.abs(pct))
  if (abs === 0) return '—'
  if (abs > 99)  return '>99%'
  return `${abs}%`
}

const TrendIcon = ({ dir }: { dir: string }) => {
  if (dir === 'up')   return <TrendingUp   className="size-3" />
  if (dir === 'down') return <TrendingDown className="size-3" />
  return <Minus className="size-3" />
}

const trendColor = (dir: string, inverted?: boolean) => {
  if (dir === 'flat') return 'text-slate-400'
  const isPositive = inverted ? dir === 'down' : dir === 'up'
  return isPositive ? 'text-green-400' : 'text-red-400'
}

export function KPICard({ kpi, onClick, className, compact = false }: KPICardProps) {
  const borderColor = RAG_COLORS[kpi.status]
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: onClick ? 1.01 : 1 }}
      onClick={onClick}
      className={cn(
        'relative flex flex-col justify-between overflow-hidden rounded-xl border border-border bg-card p-4',
        'border-l-[3px]',
        onClick && 'cursor-pointer',
        className,
      )}
      style={{ borderLeftColor: borderColor }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium text-muted-foreground leading-tight">{kpi.label}</p>
        <span className={cn('flex items-center gap-0.5 text-[11px] font-medium', trendColor(kpi.trend.direction, kpi.inverted))}>
          <TrendIcon dir={kpi.trend.direction} />
          {formatTrendPct(kpi.trend.percentage)}
        </span>
      </div>

      {/* Value */}
      <div className="mt-2">
        <p className="text-2xl font-bold tracking-tight text-foreground leading-none">
          {formatKPIValue(kpi.value, kpi.unit)}
        </p>
        {kpi.sublabel && (
          <p className="mt-0.5 text-[11px] text-muted-foreground">{kpi.sublabel}</p>
        )}
      </div>

      {/* Sparkline */}
      {!compact && kpi.sparklineData.length > 0 && (
        <div className="mt-3 -mx-1">
          <TrendSparkline data={kpi.sparklineData} status={kpi.status} height={32} />
        </div>
      )}

      {/* Yesterday delta */}
      {kpi.vsYesterday && (
        <div className="mt-1.5 flex items-center gap-1">
          <span className={cn(
            'text-[10px] font-medium tabular-nums',
            kpi.vsYesterday.direction === 'flat' ? 'text-slate-400'
              : (kpi.inverted
                  ? kpi.vsYesterday.direction === 'down' ? 'text-green-400' : 'text-red-400'
                  : kpi.vsYesterday.direction === 'up'   ? 'text-green-400' : 'text-red-400'),
          )}>
            {kpi.vsYesterday.direction === 'up' ? '▲' : kpi.vsYesterday.direction === 'down' ? '▼' : '—'}
            {' '}{formatKPIValue(kpi.vsYesterday.value, kpi.unit)} vs yesterday
          </span>
        </div>
      )}

      {/* Footer */}
      <div className="mt-2 flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground/60">
          {kpi.trend.period}
        </span>
        <span
          className="rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
          style={{
            color: borderColor,
            backgroundColor: `${borderColor}18`,
          }}
        >
          {kpi.status}
        </span>
      </div>
    </motion.div>
  )
}
