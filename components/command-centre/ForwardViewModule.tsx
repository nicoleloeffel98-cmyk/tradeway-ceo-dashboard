'use client'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { SectionShell } from './SectionShell'
import { mockScenarios, mockStrategicRisks } from '@/lib/data/mock-strategic'
import { mockForecastMonthly, mockBreakpoints, mockForecastSummary } from '@/lib/data/mock-forecasting'
import { formatZAR } from '@/lib/utils/format'
import { cn } from '@/lib/utils'
import { CHART_THEME } from '@/lib/constants/design-tokens'
import { generateInsights } from '@/lib/insights/engine'

const insights = generateInsights()

const IMPACT_STYLE: Record<string, string> = {
  high:   'bg-red-950/50 text-red-400 border-red-900/50',
  medium: 'bg-amber-950/40 text-amber-400 border-amber-800/50',
  low:    'bg-slate-800/40 text-slate-400 border-slate-700/50',
}

const MITIGATION_STYLE: Record<string, string> = {
  none:        'bg-red-950/30 text-red-400',
  in_progress: 'bg-amber-950/30 text-amber-400',
  mitigated:   'bg-green-950/30 text-green-400',
}

const MITIGATION_LABEL: Record<string, string> = {
  none:        'No plan',
  in_progress: 'In progress',
  mitigated:   'Mitigated',
}

const SEV_STYLE: Record<string, string> = {
  critical: 'bg-red-950/50 border-red-900/60 text-red-400',
  warning:  'bg-amber-950/40 border-amber-800/50 text-amber-400',
}

export function ForwardViewModule() {
  const insight    = insights.forwardview
  const activeRisks = mockStrategicRisks.filter((r) => r.mitigationStatus !== 'mitigated').slice(0, 3)
  const chartData  = mockForecastMonthly.map((d) => ({
    month:    d.month,
    base:     d.base     / 1_000_000,
    upside:   d.upside   / 1_000_000,
    downside: d.downside / 1_000_000,
  }))

  return (
    <SectionShell
      title="Forward View"
      status="amber"
      subtitle="Revenue scenarios · risk breakpoints · strategic threats"
      insight={insight.headline}
      insightAction="Approve Q3 headcount plan and accelerate AR collections — both are time-sensitive this month"
      href="/strategic"
      delay={0.2}
      className="lg:col-span-2"
    >
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* ── Left: Scenarios + Chart ── */}
        <div className="space-y-3">
          {/* Scenario cards */}
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
            {mockScenarios.map((s) => (
              <div
                key={s.label}
                className="rounded-lg border border-border bg-card/60 p-3"
                style={{ borderTopColor: s.color, borderTopWidth: 2 }}
              >
                <p className="text-[10px] text-muted-foreground">{s.label}</p>
                <p className="mt-1 font-mono text-[14px] font-bold text-foreground">{formatZAR(s.fullYear)}</p>
                <p className="mt-0.5 text-[10px] text-muted-foreground">{s.probability}% prob</p>
              </div>
            ))}
          </div>

          {/* Summary metrics */}
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
            <div className="rounded-lg border border-border bg-card/60 p-3">
              <p className="text-[10px] text-muted-foreground">Cash Runway</p>
              <p className="mt-1 font-mono text-[15px] font-bold text-amber-400">{mockForecastSummary.cashRunwayDays}d</p>
              <p className="mt-0.5 text-[10px] text-muted-foreground">to R20M floor</p>
            </div>
            <div className="rounded-lg border border-border bg-card/60 p-3">
              <p className="text-[10px] text-muted-foreground">Breakpoints</p>
              <p className="mt-1 font-mono text-[15px] font-bold text-amber-400">{mockForecastSummary.breakpointCount}</p>
              <p className="mt-0.5 text-[10px] text-muted-foreground">next 90 days</p>
            </div>
            <div className="rounded-lg border border-border bg-card/60 p-3">
              <p className="text-[10px] text-muted-foreground">YTD vs Target</p>
              <p className="mt-1 font-mono text-[15px] font-bold text-amber-400">96.3%</p>
              <p className="mt-0.5 text-[10px] text-muted-foreground">attainment</p>
            </div>
          </div>

          {/* Forecast chart */}
          <div>
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
              Revenue scenarios (May–Dec) R M
            </p>
            <ResponsiveContainer width="100%" height={90}>
              <LineChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <XAxis dataKey="month" tick={{ fill: CHART_THEME.axisColor, fontSize: 9 }} axisLine={false} tickLine={false} />
                <YAxis hide domain={['auto', 'auto']} />
                <Tooltip
                  contentStyle={{ backgroundColor: CHART_THEME.tooltipBg, border: `1px solid ${CHART_THEME.tooltipBorder}`, borderRadius: 6, fontSize: 11 }}
                  formatter={(v, name) => [`R${Number(v).toFixed(1)}M`, String(name)]}
                  labelStyle={{ color: '#f1f5f9' }}
                />
                <Line type="monotone" dataKey="upside"   stroke="#16a34a" strokeWidth={1.5} dot={false} strokeDasharray="3 2" name="Upside" />
                <Line type="monotone" dataKey="base"     stroke="#e8640c" strokeWidth={2}   dot={false} name="Base" />
                <Line type="monotone" dataKey="downside" stroke="#dc2626" strokeWidth={1.5} dot={false} strokeDasharray="3 2" name="Downside" />
              </LineChart>
            </ResponsiveContainer>
            <p className="mt-1 text-[10px] text-muted-foreground/50">
              <span className="text-green-500">— </span>Upside&nbsp;&nbsp;
              <span className="text-[#e8640c]">— </span>Base&nbsp;&nbsp;
              <span className="text-red-500">— </span>Downside
            </p>
          </div>
        </div>

        {/* ── Right: Active Risks + Breakpoints ── */}
        <div className="space-y-3">
          {/* Active risks */}
          <div className="space-y-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
              Active strategic risks ({mockStrategicRisks.filter((r) => r.mitigationStatus !== 'mitigated').length})
            </p>
            {activeRisks.map((risk) => (
              <div key={risk.id} className="flex items-start gap-2 py-1 border-b border-border/30 last:border-0">
                <span className={cn('mt-0.5 shrink-0 rounded border px-1 py-0.5 text-[9px] font-bold', IMPACT_STYLE[risk.impact])}>
                  {risk.impact.toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] text-foreground leading-snug">{risk.title}</p>
                  <p className="text-[10px] text-muted-foreground">{risk.owner}</p>
                </div>
                <span className={cn('shrink-0 rounded px-1.5 py-0.5 text-[9px] font-medium', MITIGATION_STYLE[risk.mitigationStatus])}>
                  {MITIGATION_LABEL[risk.mitigationStatus]}
                </span>
              </div>
            ))}
          </div>

          {/* Risk breakpoints */}
          <div className="space-y-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
              Time-critical breakpoints
            </p>
            {mockBreakpoints.map((bp) => (
              <div key={bp.id} className={cn('rounded border px-2.5 py-2 space-y-0.5', SEV_STYLE[bp.severity])}>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[11px] font-semibold leading-snug">{bp.title}</p>
                  <span className="shrink-0 font-mono text-[11px] font-bold">{bp.daysAway}d</span>
                </div>
                <p className="text-[10px] opacity-70 leading-relaxed">{bp.action}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SectionShell>
  )
}
