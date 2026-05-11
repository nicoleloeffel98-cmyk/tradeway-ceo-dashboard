'use client'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { SectionShell } from './SectionShell'
import { KPICard } from '@/components/dashboard/shared/KPICard'
import { mockSalesKPIs, mockSalesForecast, mockSalesReps } from '@/lib/data/mock-sales'
import { CHART_THEME } from '@/lib/constants/design-tokens'
import { generateInsights } from '@/lib/insights/engine'
import { useTrackerStore } from '@/lib/stores/useTrackerStore'
import { cn } from '@/lib/utils'

const insights = generateInsights()

export function SalesModule() {
  const latest  = useTrackerStore((s) => s.latest)
  const insight = insights.sales

  // KPIs: override with tracker data when available
  const keyKPIs = mockSalesKPIs
    .filter((k) => ['sales-revenue-mtd', 'sales-win-rate', 'sales-forecast'].includes(k.id))
    .map((kpi) => {
      if (!latest) return kpi
      if (kpi.id === 'sales-revenue-mtd') return { ...kpi, value: latest.derived.totalActualGP }
      if (kpi.id === 'sales-forecast')    return { ...kpi, value: latest.derived.totalForecastGP }
      return kpi
    })

  // Chart: use tracker quarterly data when available
  const chartData = latest
    ? (['q1', 'q2', 'q3', 'q4'] as const).map((q, i) => ({
        month:    ['Q1', 'Q2', 'Q3', 'Q4'][i],
        actual:   latest.quarterly[q].actual   > 0 ? latest.quarterly[q].actual   / 1_000_000 : undefined,
        forecast: latest.quarterly[q].forecast > 0 ? latest.quarterly[q].forecast / 1_000_000 : undefined,
        target:   latest.quarterly[q].budget   / 1_000_000,
      }))
    : mockSalesForecast.map((p) => ({
        month:    p.month,
        actual:   p.actual   ? p.actual   / 1_000_000 : undefined,
        forecast: p.forecast ? p.forecast / 1_000_000 : undefined,
        target:   p.target   / 1_000_000,
      }))

  // Rep attainment: use tracker data when available
  const displayReps = latest?.repQuarterly.length
    ? latest.repQuarterly
        .filter((r) => r.target > 0)
        .sort((a, b) => b.pctAchievement - a.pctAchievement)
        .slice(0, 5)
        .map((r, i) => ({
          id:           `trk-${i}`,
          name:          r.name,
          attainmentPct: Math.round(r.pctAchievement * 100 * 10) / 10,
          actual:        r.ytdActual,
        }))
    : mockSalesReps.slice(0, 5).map((r) => ({
        id:           r.id,
        name:          r.name,
        attainmentPct: r.attainmentPct,
        actual:        r.actual,
      }))

  return (
    <SectionShell
      title="Sales / GP Performance"
      status={latest ? (latest.derived.pctToAnnualTarget < 0.5 ? 'amber' : 'green') : 'amber'}
      subtitle={latest ? `${latest.reportingWeek} · FY target ${(latest.derived.pctToAnnualTarget * 100).toFixed(0)}%` : 'GP · attainment · forecast'}
      insight={latest
        ? `YTD GP: R${(latest.derived.totalActualGP / 1_000_000).toFixed(1)}M actual, R${(latest.derived.totalForecastGP / 1_000_000).toFixed(1)}M forecast of R${(latest.derived.annualTarget / 1_000_000).toFixed(0)}M annual target.`
        : insight.headline
      }
      insightAction={latest ? `${latest.derived.atRiskReps.length} reps below 60% — review pipeline conversion` : 'Prioritise Vodacom and Shoprite to close month-end gap'}
      href="/sales"
      delay={0.15}
    >
      {/* KPI row */}
      <div className="grid grid-cols-2 gap-2 min-[400px]:grid-cols-3">
        {keyKPIs.map((kpi) => (
          <KPICard key={kpi.id} kpi={kpi} compact />
        ))}
      </div>

      {/* GP vs target chart */}
      <div>
        <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
          {latest ? 'Quarterly GP: actual vs forecast vs target' : 'Revenue vs target (Jan–Jun)'}
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

      {/* Rep attainment */}
      <div className="space-y-1">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
          {latest ? 'Rep GP attainment (FY target)' : 'Rep attainment'}
        </p>
        {displayReps.map((rep) => {
          const pctNum = rep.attainmentPct
          const color  = pctNum >= 100 ? 'bg-green-600' : pctNum >= 80 ? 'bg-amber-500' : 'bg-red-600'
          const tColor = pctNum >= 100 ? 'text-green-400' : pctNum >= 80 ? 'text-amber-400' : 'text-red-400'
          return (
            <div key={rep.id} className="flex items-center gap-2">
              <p className="w-28 truncate text-[11px] text-muted-foreground">
                {rep.name.split(' ')[0]} {rep.name.split(' ')[1]?.[0]}.
              </p>
              <div className="flex-1 h-1.5 rounded-full bg-card overflow-hidden">
                <div className={color} style={{ width: `${Math.min(pctNum, 100)}%`, height: '100%', borderRadius: '9999px' }} />
              </div>
              <span className={cn('text-[11px] font-mono font-semibold w-12 text-right', tColor)}>
                {pctNum.toFixed(0)}%
              </span>
            </div>
          )
        })}
      </div>
    </SectionShell>
  )
}
