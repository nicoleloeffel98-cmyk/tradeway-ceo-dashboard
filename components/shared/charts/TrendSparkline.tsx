'use client'
import { Area, AreaChart, ResponsiveContainer } from 'recharts'
import type { SparklinePoint } from '@/lib/types'
import { RAG_COLORS } from '@/lib/utils/rag'
import type { RAGStatus } from '@/lib/types'

interface TrendSparklineProps {
  data:   SparklinePoint[]
  status: RAGStatus
  height?: number
}

export function TrendSparkline({ data, status, height = 36 }: TrendSparklineProps) {
  const color = RAG_COLORS[status]
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 2 }}>
        <defs>
          <linearGradient id={`spark-${status}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0}   />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="v"
          stroke={color}
          strokeWidth={1.5}
          fill={`url(#spark-${status})`}
          dot={false}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
