import React from 'react'
import { cn } from '@/lib/utils'

function Pulse({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return <div className={cn('animate-pulse rounded-md bg-muted/30', className)} style={style} />
}

export function KPICardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <Pulse className="h-3 w-24" />
      <Pulse className="h-7 w-32" />
      <Pulse className="h-2 w-16" />
      <Pulse className="h-8 w-full mt-2" />
    </div>
  )
}

export function KPIGridSkeleton({ columns = 4 }: { columns?: number }) {
  return (
    <div className={cn('grid gap-4', {
      'grid-cols-2 sm:grid-cols-4': columns === 4,
      'grid-cols-2 sm:grid-cols-3': columns === 3,
      'grid-cols-1 sm:grid-cols-2': columns === 2,
    })}>
      {Array.from({ length: columns * 2 }).map((_, i) => (
        <KPICardSkeleton key={i} />
      ))}
    </div>
  )
}

export function ChartSkeleton({ height = 220 }: { height?: number }) {
  return (
    <div className="space-y-3 rounded-xl border border-border bg-card p-5">
      <Pulse className="h-4 w-48" />
      <div className="flex items-end gap-1" style={{ height }}>
        {Array.from({ length: 12 }).map((_, i) => (
          <Pulse
            key={i}
            className="flex-1"
            style={{ height: `${40 + Math.sin(i * 0.8) * 30 + 30}%` }}
          />
        ))}
      </div>
    </div>
  )
}

export function GaugeSkeleton({ size = 180 }: { size?: number }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card p-5 space-y-3">
      <Pulse className="h-4 w-32" />
      <Pulse className="rounded-full" style={{ width: size, height: size / 2 }} />
      <Pulse className="h-3 w-40" />
    </div>
  )
}

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-3 rounded-xl border border-border bg-card p-5">
      <Pulse className="h-4 w-40" />
      <div className="space-y-2 mt-3">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex gap-4">
            {Array.from({ length: cols }).map((_, c) => (
              <Pulse key={c} className="h-4 flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
