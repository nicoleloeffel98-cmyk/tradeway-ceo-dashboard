'use client'
import {
  LineChart as ReLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from 'recharts'
import { CHART_THEME, CHART_COLORS } from '@/lib/constants/design-tokens'

interface LineSeries {
  key:       string
  label:     string
  color?:    string
  dashed?:   boolean
  dot?:      boolean
}

import type { ChartDataItem } from './AreaChart'

interface DashboardLineChartProps {
  data:            ChartDataItem[]
  series:          LineSeries[]
  xKey:            string
  height?:         number
  formatter?:      (v: number) => string
  referenceLines?: { y: number; label: string; color?: string }[]
  yDomain?:        [number | 'auto', number | 'auto']
}

export function DashboardLineChart({
  data,
  series,
  xKey,
  height = 260,
  formatter,
  referenceLines,
  yDomain,
}: DashboardLineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ReLineChart data={data} margin={{ top: 4, right: 8, left: 8, bottom: 4 }}>
        <CartesianGrid vertical={false} stroke={CHART_THEME.gridColor} />
        <XAxis
          dataKey={xKey}
          tick={{ fill: CHART_THEME.axisColor, fontSize: CHART_THEME.fontSize }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: CHART_THEME.axisColor, fontSize: CHART_THEME.fontSize }}
          axisLine={false}
          tickLine={false}
          tickFormatter={formatter}
          domain={yDomain}
          width={55}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: CHART_THEME.tooltipBg,
            border: `1px solid ${CHART_THEME.tooltipBorder}`,
            borderRadius: 8,
            fontSize: CHART_THEME.fontSize,
          }}
          labelStyle={{ color: '#f1f5f9' }}
          formatter={(v, name) => {
            const num = typeof v === 'number' ? v : Number(v)
            return [formatter ? formatter(num) : num, String(name ?? '')]
          }}
        />
        <Legend
          wrapperStyle={{ fontSize: CHART_THEME.fontSize, color: CHART_THEME.axisColor }}
        />
        {referenceLines?.map((rl, i) => (
          <ReferenceLine
            key={i}
            y={rl.y}
            stroke={rl.color ?? '#64748b'}
            strokeDasharray="4 2"
            label={{ value: rl.label, fill: '#64748b', fontSize: 11 }}
          />
        ))}
        {series.map((s, i) => {
          const color = s.color ?? CHART_COLORS[i % CHART_COLORS.length]
          return (
            <Line
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.label}
              stroke={color}
              strokeWidth={2}
              strokeDasharray={s.dashed ? '5 3' : undefined}
              dot={s.dot ? { fill: color, r: 4 } : false}
              connectNulls
            />
          )
        })}
      </ReLineChart>
    </ResponsiveContainer>
  )
}
