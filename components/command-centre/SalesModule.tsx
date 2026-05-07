'use client'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { SectionShell } from './SectionShell'
import { KPICard } from '@/components/dashboard/shared/KPICard'
import { mockSalesKPIs, mockSalesForecast, mockSalesReps } from '@/lib/data/mock-sales'
import { formatZAR } from '@/lib/utils/format'
import { CHART_THEME } from '@/lib/constants/design-tokens'
import { generateInsights } from '@/lib/insights/engine'

const insights = generateInsights()

export function SalesModule() {
  const keyKPIs = mockSalesKPIs.filter((k) =>
    ['sales-revenue-mtd', 'sales-win-rate', 'sales-forecast'].includes(k.id),
  )
  const insight = insights.sales

  const chartData = mockSalesForecast.map((p) => ({
    month:    p.month,
    actual:   p.actual    ? p.actual    / 1_000_000 : undefined,
    forecast: p.forecast  ? p.forecast  / 1_000_000 : undefined,
    target:   p.target    / 1_000_000,
  }))

  return (
    <SectionShell
      title="Sales"
      status="amber"
      subtitle="Revenue conversion · MTD · forecast"
      insight={insight.headline}
      insightAction="Prioritise Vodacom and Shoprite to close month-end gap"
      href="/sales"
      delay={0.15}
    >
      {/* KPI row */}
      <div className="grid grid-cols-2 gap-2 min-[400px]:grid-cols-3">
        {keyKPIs.map((kpi) => (
          <KPICard key={kpi.id} kpi={kpi} compact />
        ))}
      </div>

      {/* Revenue vs target mini chart */}
      <div>
        <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
          Revenue vs target (Jan–Jun)
        </p>
        <ResponsiveContainer width="100%" height={90}>
          <AreaChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="sal-actual" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#e8640c" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#e8640c" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="month" tick={{ fill: CHART_THEME.axisColor, fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip
              contentStyle={{ backgroundColor: CHART_THEME.tooltipBg, border: `1px solid ${CHART_THEME.tooltipBorder}`, borderRadius: 6, fontSize: 11 }}
              formatter={(v) => [`R${Number(v).toFixed(1)}M`, '']}
              labelStyle={{ color: '#f1f5f9' }}
            />
            <Area type="monotone" dataKey="target"   stroke="#334155" strokeWidth={1} fill="none" strokeDasharray="3 3" dot={false} />
            <Area type="monotone" dataKey="actual"   stroke="#e8640c" strokeWidth={1.5} fill="url(#sal-actual)" dot={false} />
            <Area type="monotone" dataKey="forecast" stroke="#f07830" strokeWidth={1.5} strokeDasharray="4 2" fill="none" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Top reps */}
      <div className="space-y-1">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">Rep attainment</p>
        {mockSalesReps.slice(0, 3).map((rep) => (
          <div key={rep.id} className="flex items-center gap-2">
            <p className="w-28 truncate text-[11px] text-muted-foreground">{rep.name.split(' ')[0]} {rep.name.split(' ')[1]?.[0]}.</p>
            <div className="flex-1 h-1.5 rounded-full bg-card overflow-hidden">
              <div
                className={rep.attainmentPct >= 100 ? 'bg-green-600' : rep.attainmentPct >= 85 ? 'bg-amber-500' : 'bg-red-600'}
                style={{ width: `${Math.min(rep.attainmentPct, 100)}%`, height: '100%', borderRadius: '9999px' }}
              />
            </div>
            <span className={`text-[11px] font-mono font-semibold w-10 text-right ${rep.attainmentPct >= 100 ? 'text-green-400' : rep.attainmentPct >= 85 ? 'text-amber-400' : 'text-red-400'}`}>
              {rep.attainmentPct}%
            </span>
          </div>
        ))}
      </div>
    </SectionShell>
  )
}
