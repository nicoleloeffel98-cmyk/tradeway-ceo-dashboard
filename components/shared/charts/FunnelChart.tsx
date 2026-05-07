'use client'
import { formatZAR } from '@/lib/utils/format'
import type { BDFunnelStage } from '@/lib/types'

interface FunnelChartProps {
  data: BDFunnelStage[]
}

export function FunnelChart({ data }: FunnelChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value))

  return (
    <div className="space-y-2">
      {data.map((stage, i) => {
        const widthPct = (stage.value / maxValue) * 100
        return (
          <div key={stage.stage} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-foreground">{stage.label}</span>
              <div className="flex items-center gap-3 text-muted-foreground">
                <span>{stage.count} opps</span>
                <span className="font-medium text-foreground">{formatZAR(stage.value)}</span>
              </div>
            </div>
            <div className="h-8 w-full overflow-hidden rounded bg-muted/30">
              <div
                className="flex h-full items-center px-2 transition-all duration-500"
                style={{
                  width: `${widthPct}%`,
                  backgroundColor: stage.color,
                  opacity: 1 - i * 0.1,
                }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
