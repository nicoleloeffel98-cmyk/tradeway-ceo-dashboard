'use client'
import { RAG_COLORS } from '@/lib/utils/rag'
import type { RAGStatus } from '@/lib/types'

interface GaugeChartProps {
  value:    number
  max?:     number
  label?:   string
  unit?:    string
  status:   RAGStatus
  size?:    number
}

export function GaugeChart({ value, max = 100, label, unit = '%', status, size = 160 }: GaugeChartProps) {
  const pct       = Math.min(value / max, 1)
  const radius    = 60
  const cx        = size / 2
  const cy        = size * 0.58
  const startAngle = Math.PI
  const endAngle   = 2 * Math.PI
  const angle      = startAngle + pct * (endAngle - startAngle)

  const arcPath = (start: number, end: number, r: number) => {
    const x1 = cx + r * Math.cos(start)
    const y1 = cy + r * Math.sin(start)
    const x2 = cx + r * Math.cos(end)
    const y2 = cy + r * Math.sin(end)
    const large = end - start > Math.PI ? 1 : 0
    return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`
  }

  const color     = RAG_COLORS[status]
  const trackPath = arcPath(Math.PI, 2 * Math.PI, radius)
  const valuePath = arcPath(Math.PI, angle, radius)

  return (
    <svg width={size} height={size * 0.65} viewBox={`0 0 ${size} ${size * 0.65}`}>
      <path d={trackPath} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={14} strokeLinecap="round" />
      <path d={valuePath} fill="none" stroke={color}                  strokeWidth={14} strokeLinecap="round" />
      <text x={cx} y={cy - 6} textAnchor="middle" fill="#f1f5f9" fontSize={28} fontWeight="700" fontFamily="var(--font-geist-sans)">
        {value}{unit}
      </text>
      {label && (
        <text x={cx} y={cy + 14} textAnchor="middle" fill="#64748b" fontSize={12} fontFamily="var(--font-geist-sans)">
          {label}
        </text>
      )}
    </svg>
  )
}
