'use client'
import {
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from 'recharts'
import { CHART_THEME, CHART_COLORS } from '@/lib/constants/design-tokens'

interface BarSeries {
  key:    string
  label:  string
  color?: string
}

import type { ChartDataItem } from './AreaChart'

interface DashboardBarChartProps {
  data:        ChartDataItem[]
  series:      BarSeries[]
  xKey:        string
  height?:     number
  formatter?:  (v: number) => string
  layout?:     'vertical' | 'horizontal'
  colorByCell?: boolean
}

export function DashboardBarChart({
  data,
  series,
  xKey,
  height = 240,
  formatter,
  layout = 'horizontal',
  colorByCell = false,
}: DashboardBarChartProps) {
  const isVertical = layout === 'vertical'
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ReBarChart
        data={data}
        layout={layout}
        margin={{ top: 4, right: 8, left: isVertical ? 80 : 8, bottom: 4 }}
        barCategoryGap="30%"
      >
        <CartesianGrid
          horizontal={!isVertical}
          vertical={isVertical}
          stroke={CHART_THEME.gridColor}
        />
        {isVertical ? (
          <>
            <XAxis type="number" tick={{ fill: CHART_THEME.axisColor, fontSize: CHART_THEME.fontSize }} axisLine={false} tickLine={false} tickFormatter={formatter} />
            <YAxis type="category" dataKey={xKey} tick={{ fill: CHART_THEME.axisColor, fontSize: CHART_THEME.fontSize }} axisLine={false} tickLine={false} width={75} />
          </>
        ) : (
          <>
            <XAxis dataKey={xKey} tick={{ fill: CHART_THEME.axisColor, fontSize: CHART_THEME.fontSize }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: CHART_THEME.axisColor, fontSize: CHART_THEME.fontSize }} axisLine={false} tickLine={false} tickFormatter={formatter} width={55} />
          </>
        )}
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
          cursor={{ fill: 'rgba(255,255,255,0.04)' }}
        />
        {series.length > 1 && (
          <Legend wrapperStyle={{ fontSize: CHART_THEME.fontSize, color: CHART_THEME.axisColor }} />
        )}
        {series.map((s, si) => {
          const defaultColor = s.color ?? CHART_COLORS[si % CHART_COLORS.length]
          return (
            <Bar key={s.key} dataKey={s.key} name={s.label} fill={defaultColor} radius={[3, 3, 0, 0]}>
              {colorByCell &&
                data.map((_, di) => (
                  <Cell key={di} fill={CHART_COLORS[di % CHART_COLORS.length]} />
                ))}
            </Bar>
          )
        })}
      </ReBarChart>
    </ResponsiveContainer>
  )
}
