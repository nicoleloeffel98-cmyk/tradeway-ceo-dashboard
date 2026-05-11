'use client'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { SectionShell } from './SectionShell'
import { KPICard } from '@/components/dashboard/shared/KPICard'
import { mockFinanceKPIs, mockCashFlow, mockARAgingBuckets } from '@/lib/data/mock-finance'
import { formatZAR } from '@/lib/utils/format'
import { CHART_THEME } from '@/lib/constants/design-tokens'
import { generateInsights } from '@/lib/insights/engine'
import { useTrackerStore } from '@/lib/stores/useTrackerStore'
import { TrackerPerformanceSection } from './TrackerPerformanceSection'

const insights = generateInsights()

export function FinanceModule() {
  const latest  = useTrackerStore((s) => s.latest)
  // Override GP-related finance KPIs from tracker if available
  const keyKPIs = mockFinanceKPIs
    .filter((k) => ['fin-cash', 'fin-dso', 'fin-gross-margin', 'fin-overdue-ar'].includes(k.id))
    .map((kpi) => {
      if (!latest) return kpi
      // fin-gross-margin can be approximated from forecast/annual target
      if (kpi.id === 'fin-gross-margin') {
        return { ...kpi, value: Math.round(latest.derived.pctToAnnualTarget * 100 * 10) / 10 }
      }
      return kpi
    })
  const insight   = insights.finance
  const recentCF  = mockCashFlow.slice(-5).map((d) => ({
    month:   d.month.replace('-26', '').replace('-25', ''),
    inflow:  d.inflow  / 1_000_000,
    outflow: -(d.outflow / 1_000_000),
    net:     d.net     / 1_000_000,
  }))

  return (
    <div className="space-y-4">
      <SectionShell
        title="Financial Health"
        status="amber"
        subtitle="Cash · margins · AR · DSO"
        insight={insight.headline}
        insightAction="Chase Pick n Pay (R2.45M) and Unilever (R880K) first"
        href="/finance"
        delay={0.2}
      >
        {/* KPI row */}
        <div className="grid grid-cols-2 gap-2">
          {keyKPIs.map((kpi) => (
            <KPICard key={kpi.id} kpi={kpi} compact />
          ))}
        </div>

        {/* Cashflow mini chart */}
        <div>
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
            Net cashflow (last 5 months)
          </p>
          <ResponsiveContainer width="100%" height={80}>
            <BarChart data={recentCF} margin={{ top: 4, right: 4, left: 0, bottom: 0 }} barCategoryGap="25%">
              <XAxis dataKey="month" tick={{ fill: CHART_THEME.axisColor, fontSize: 9 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip
                contentStyle={{ backgroundColor: CHART_THEME.tooltipBg, border: `1px solid ${CHART_THEME.tooltipBorder}`, borderRadius: 6, fontSize: 11 }}
                formatter={(v) => [`R${Math.abs(Number(v)).toFixed(1)}M`, '']}
                labelStyle={{ color: '#f1f5f9' }}
              />
              <Bar dataKey="net" radius={[2, 2, 0, 0]}>
                {recentCF.map((entry, index) => (
                  <Cell key={index} fill={entry.net >= 0 ? '#16a34a' : '#dc2626'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* AR aging */}
        <div className="space-y-1.5">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">AR aging</p>
          {mockARAgingBuckets.map((bucket) => (
            <div key={bucket.bucket} className="flex items-center gap-2">
              <span className="w-20 text-[10px] text-muted-foreground shrink-0">{bucket.bucket}</span>
              <div className="flex-1 h-1.5 rounded-full bg-card overflow-hidden">
                <div
                  style={{ width: `${bucket.pct}%`, height: '100%', borderRadius: '9999px',
                    backgroundColor: bucket.bucket === '90+ days' ? '#dc2626' : bucket.bucket === '61–90 days' ? '#d97706' : '#334155'
                  }}
                />
              </div>
              <span className="font-mono text-[11px] text-foreground w-16 text-right">{formatZAR(bucket.amount)}</span>
            </div>
          ))}
        </div>
      </SectionShell>

      {/* Tracker Performance — full Finance Tower (only when data uploaded) */}
      <TrackerPerformanceSection />
    </div>
  )
}
