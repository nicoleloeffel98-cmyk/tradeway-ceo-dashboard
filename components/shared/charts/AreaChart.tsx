'use client'
import {
  AreaChart as ReAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { CHART_THEME, CHART_COLORS } from '@/lib/constants/design-tokens'

interface AreaSeries {
  key:    string
  label:  string
  color?: string
}

export type ChartDataItem = { [key: string]: string | number | null | undefined }

interface DashboardAreaChartProps {
  data:        ChartDataItem[]
  series:      AreaSeries[]
  xKey:        string
  height?:     number
  formatter?:  (v: number) => string
  yDomain?:    [number | 'auto', number | 'auto']
}

export function DashboardAreaChart({
  data,
  series,
  xKey,
  height = 260,
  formatter,
  yDomain,
}: DashboardAreaChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ReAreaChart data={data} margin={{ top: 4, right: 8, left: 8, bottom: 4 }}>
        <defs>
          {series.map((s, i) => {
            const color = s.color ?? CHART_COLORS[i % CHART_COLORS.length]
            return (
              <linearGradient key={s.key} id={`area-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={color} stopOpacity={0.25} />
                <stop offset="95%" stopColor={color} stopOpacity={0}    />
              </linearGradient>
            )
          })}
        </defs>
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
        {series.map((s, i) => {
          const color = s.color ?? CHART_COLORS[i % CHART_COLORS.length]
          return (
            <Area
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.label}
              stroke={color}
              strokeWidth={2}
              fill={`url(#area-${s.key})`}
              dot={false}
            />
          )
        })}
      </ReAreaChart>
    </ResponsiveContainer>
  )
}
