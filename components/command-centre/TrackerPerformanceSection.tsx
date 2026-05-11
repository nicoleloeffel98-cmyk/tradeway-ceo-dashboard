'use client'
import {
  ComposedChart, Bar, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, ReferenceLine, Cell,
} from 'recharts'
import {
  TrendingUp, TrendingDown, Minus, AlertTriangle,
  ChevronRight, Target, Zap, ArrowUpRight, ArrowDownRight,
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { useTrackerStore } from '@/lib/stores/useTrackerStore'
import type { TrackerSnapshot, WeekOnWeekDelta, RepQuarterly } from '@/lib/workbook/trackerTypes'
import { CHART_THEME } from '@/lib/constants/design-tokens'

// ─── Format helpers ───────────────────────────────────────────────────────────

function M(n: number) { return `R${(Math.abs(n) / 1_000_000).toFixed(1)}M` }
function pct(n: number, dp = 1) { return `${(n * 100).toFixed(dp)}%` }
function ragClass(p: number): 'green' | 'amber' | 'red' {
  if (p >= 0.80) return 'green'
  if (p >= 0.60) return 'amber'
  return 'red'
}
const RAG_TEXT  = { green: 'text-green-400', amber: 'text-amber-400', red: 'text-red-400' }
const RAG_BG    = { green: 'bg-green-950/40 border-green-900/40', amber: 'bg-amber-950/30 border-amber-900/40', red: 'bg-red-950/40 border-red-900/40' }
const RAG_LABEL = { green: 'On Track', amber: 'Watch', red: 'At Risk' }

// ─── (F) Finance Executive Insights ──────────────────────────────────────────

function buildInsights(snap: TrackerSnapshot, wow: WeekOnWeekDelta | null): string[] {
  const ins: string[] = []
  const gap = snap.derived.annualTarget - snap.derived.totalForecastGP
  const remainingMonths = snap.months.filter((_, i) =>
    snap.reps.some((r) => r.monthlyActuals[i] === 0 && r.monthlyProjected[i] > 0)
  ).length || 9

  ins.push(
    `Full-year GP forecast ${M(snap.derived.totalForecastGP)} — ${pct(snap.derived.pctToAnnualTarget)} of ${M(snap.derived.annualTarget)} annual target, leaving a ${M(gap)} shortfall.`
  )

  const atRisk = snap.derived.atRiskReps
  if (atRisk.length > 0) {
    ins.push(
      `${atRisk.length} of ${snap.reps.length} reps below 60% attainment: ${atRisk.map((r) => `${r.name.split(' ')[0]} (${pct(r.pct)})`).join(', ')} — pipeline acceleration critical.`
    )
  }

  const q2Pct = snap.quarterly.q2.budget > 0 ? snap.quarterly.q2.forecast / snap.quarterly.q2.budget : 0
  if (q2Pct < 0.65) {
    ins.push(
      `Q2 forecast at ${pct(q2Pct)} of target (${M(snap.quarterly.q2.forecast)} vs ${M(snap.quarterly.q2.budget)}) — highest-risk quarter, requiring urgent pipeline conversion.`
    )
  }

  const topRep = snap.repQuarterly.sort((a, b) => b.ytdActual - a.ytdActual)[0]
  if (topRep) {
    ins.push(
      `${topRep.name} leads at ${M(topRep.ytdActual)} YTD (${pct(topRep.pctAchievement)} of annual target). Q1 closed at ${pct(snap.quarterly.q1.actual / snap.quarterly.q1.budget)} of target.`
    )
  }

  if (remainingMonths > 0) {
    const needed = gap / remainingMonths
    ins.push(
      `To close the gap, Tradeway needs ${M(needed)} GP per month average across remaining ${remainingMonths} months — ${(needed / (snap.derived.annualTarget / 12) * 100).toFixed(0)}% of monthly target.`
    )
  }

  return ins.slice(0, 5)
}

function InsightBanner({ snap, wow }: { snap: TrackerSnapshot; wow: WeekOnWeekDelta | null }) {
  const insights = buildInsights(snap, wow)
  return (
    <div className="rounded-xl border border-[#e8640c]/20 bg-[#e8640c]/5 p-4 space-y-2">
      <div className="flex items-center gap-2 mb-3">
        <Zap className="size-3.5 text-[#e8640c]" />
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#e8640c]">Finance Executive Insights</p>
        <span className="ml-auto text-[10px] text-muted-foreground/50">{snap.reportingWeek}</span>
      </div>
      {insights.map((ins, i) => (
        <div key={i} className="flex items-start gap-2.5">
          <span className="shrink-0 font-mono text-[10px] text-[#e8640c] mt-0.5">{i + 1}.</span>
          <p className="text-[11px] text-muted-foreground leading-relaxed">{ins}</p>
        </div>
      ))}
      {wow && wow.recommendedActions.length > 0 && (
        <div className="mt-3 pt-3 border-t border-[#e8640c]/15 space-y-1.5">
          <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40">CEO Actions</p>
          {wow.recommendedActions.slice(0, 3).map((a, i) => (
            <div key={i} className="flex items-start gap-2">
              <ChevronRight className="size-3 shrink-0 mt-0.5 text-[#e8640c]" />
              <p className="text-[11px] text-muted-foreground">{a}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── (A) Annual Overview ──────────────────────────────────────────────────────

function AnnualOverview({ snap }: { snap: TrackerSnapshot }) {
  const { totalActualGP, totalForecastGP, annualTarget, pctToAnnualTarget } = snap.derived
  const gap        = annualTarget - totalForecastGP
  const actualPct  = annualTarget > 0 ? totalActualGP / annualTarget : 0
  const rag        = ragClass(pctToAnnualTarget)

  const cards = [
    { label: 'Annual Target',    value: M(annualTarget),   sub: 'FY26/27 GP budget', color: 'text-foreground' },
    { label: 'YTD Actual GP',    value: M(totalActualGP),  sub: `${pct(actualPct)} of target`, color: 'text-foreground' },
    { label: 'Full-Year Forecast', value: M(totalForecastGP), sub: `${pct(pctToAnnualTarget)} of target`, color: RAG_TEXT[rag] },
    { label: 'Remaining Gap',    value: M(gap),             sub: 'forecast vs target', color: 'text-amber-400' },
  ]

  return (
    <div className="space-y-2">
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">A · Annual Overview</p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-lg border border-border bg-card/60 p-3">
            <p className="text-[10px] text-muted-foreground">{c.label}</p>
            <p className={cn('mt-1 text-xl font-bold font-mono', c.color)}>{c.value}</p>
            <p className="text-[10px] text-muted-foreground/70 mt-0.5">{c.sub}</p>
          </div>
        ))}
      </div>
      {/* Progress bar */}
      <div className="rounded-lg border border-border bg-card/40 px-4 py-3 space-y-1.5">
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-muted-foreground">Forecast progress to annual target</span>
          <span className={cn('font-mono font-bold', RAG_TEXT[rag])}>{pct(pctToAnnualTarget)}</span>
        </div>
        <div className="h-2 w-full rounded-full bg-muted/30 overflow-hidden">
          <div
            className={cn('h-full rounded-full transition-all duration-500',
              rag === 'green' ? 'bg-green-500' : rag === 'amber' ? 'bg-amber-500' : 'bg-[#e8640c]'
            )}
            style={{ width: `${Math.min(100, pctToAnnualTarget * 100)}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[9px] text-muted-foreground/40">
          <span>R0</span><span>{M(annualTarget / 2)}</span><span>{M(annualTarget)}</span>
        </div>
      </div>
    </div>
  )
}

// ─── (B) Quarterly Overview ───────────────────────────────────────────────────

function QuarterlyOverview({ snap }: { snap: TrackerSnapshot }) {
  const qs = [
    { label: 'Q1', sub: 'Mar · Apr · May', data: snap.quarterly.q1 },
    { label: 'Q2', sub: 'Jun · Jul · Aug', data: snap.quarterly.q2 },
    { label: 'Q3', sub: 'Sep · Oct · Nov', data: snap.quarterly.q3 },
    { label: 'Q4', sub: 'Dec · Jan · Feb', data: snap.quarterly.q4 },
  ]

  return (
    <div className="space-y-2">
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">B · Quarterly Overview</p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {qs.map(({ label, sub, data }) => {
          const forecastPct = data.budget > 0 ? data.forecast / data.budget : 0
          const actualPct   = data.budget > 0 ? data.actual   / data.budget : 0
          const rag         = ragClass(forecastPct)
          const variance    = data.forecast - data.budget
          return (
            <div key={label} className={cn('rounded-lg border p-3 space-y-2', RAG_BG[rag])}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold text-foreground">{label}</p>
                  <p className="text-[9px] text-muted-foreground/60">{sub}</p>
                </div>
                <span className={cn('rounded px-1.5 py-0.5 text-[9px] font-bold border', RAG_BG[rag], RAG_TEXT[rag])}>
                  {RAG_LABEL[rag]}
                </span>
              </div>
              <div className="space-y-0.5 text-[10px]">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Target</span>
                  <span className="font-mono text-foreground">{M(data.budget)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Actual</span>
                  <span className="font-mono text-foreground">{M(data.actual)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Forecast</span>
                  <span className={cn('font-mono font-semibold', RAG_TEXT[rag])}>{M(data.forecast)}</span>
                </div>
                <div className="flex justify-between border-t border-white/5 pt-0.5 mt-1">
                  <span className="text-muted-foreground">Variance</span>
                  <span className={cn('font-mono', variance >= 0 ? 'text-green-400' : 'text-red-400')}>
                    {variance >= 0 ? '+' : ''}{M(variance)}
                  </span>
                </div>
              </div>
              {/* Dual progress bar */}
              <div className="space-y-1">
                <div className="h-1 w-full rounded-full bg-black/20 overflow-hidden">
                  <div className="h-full rounded-full bg-white/30" style={{ width: `${Math.min(100, actualPct * 100)}%` }} />
                </div>
                <div className="h-1 w-full rounded-full bg-black/20 overflow-hidden">
                  <div
                    className={cn('h-full rounded-full', rag === 'green' ? 'bg-green-500' : rag === 'amber' ? 'bg-amber-500' : 'bg-red-500')}
                    style={{ width: `${Math.min(100, forecastPct * 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[9px] text-muted-foreground/50">
                  <span>{pct(actualPct, 0)} actual</span>
                  <span>{pct(forecastPct, 0)} forecast</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── (C) Monthly Performance Chart ───────────────────────────────────────────

function MonthlyChart({ snap }: { snap: TrackerSnapshot }) {
  const data = snap.months.map((month, i) => {
    const actual    = snap.reps.reduce((s, r) => s + (r.monthlyActuals[i]   ?? 0), 0)
    const projected = snap.reps.reduce((s, r) => s + (r.monthlyProjected[i] ?? 0), 0)
    return {
      month,
      actual:    Math.round(actual    / 1_000_000 * 10) / 10,
      projected: Math.round(projected / 1_000_000 * 10) / 10,
      hasActual: actual > 0,
    }
  })

  const monthlyTarget = snap.derived.annualTarget / 12 / 1_000_000

  return (
    <div className="space-y-2">
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">C · Monthly GP Performance (R millions)</p>
      <div className="rounded-xl border border-border bg-card/40 p-4">
        <ResponsiveContainer width="100%" height={180}>
          <ComposedChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barCategoryGap="20%">
            <XAxis
              dataKey="month"
              tick={{ fill: CHART_THEME.axisColor, fontSize: 9 }}
              axisLine={false} tickLine={false}
              tickFormatter={(v) => v.replace(' 26', '').replace(' 27', '')}
            />
            <YAxis
              tick={{ fill: CHART_THEME.axisColor, fontSize: 9 }}
              axisLine={false} tickLine={false}
              tickFormatter={(v) => `R${v}M`}
              width={38}
            />
            <Tooltip
              contentStyle={{ backgroundColor: CHART_THEME.tooltipBg, border: `1px solid ${CHART_THEME.tooltipBorder}`, borderRadius: 6, fontSize: 11 }}
              formatter={(v, name) => [`R${Number(v).toFixed(1)}M`, name === 'actual' ? 'Actual' : 'Projected']}
              labelStyle={{ color: '#f1f5f9' }}
            />
            <ReferenceLine y={monthlyTarget} stroke="#e8640c" strokeDasharray="4 2" strokeWidth={1} strokeOpacity={0.4} />
            <Bar dataKey="actual" radius={[2, 2, 0, 0]} maxBarSize={28}>
              {data.map((d, i) => (
                <Cell key={i} fill={d.hasActual ? '#e8640c' : '#e8640c30'} />
              ))}
            </Bar>
            <Line
              type="monotone" dataKey="projected" stroke="#64748b"
              strokeWidth={1.5} dot={false} strokeDasharray="5 3"
            />
          </ComposedChart>
        </ResponsiveContainer>
        <div className="flex items-center gap-4 mt-2 text-[9px] text-muted-foreground/60">
          <span><span className="inline-block w-3 h-2 rounded bg-[#e8640c] mr-1" />Actual</span>
          <span><span className="inline-block w-4 border-t border-dashed border-[#64748b] mr-1 align-middle" />Projected</span>
          <span><span className="inline-block w-4 border-t border-dashed border-[#e8640c] border-opacity-40 mr-1 align-middle" />Monthly target</span>
        </div>
      </div>
    </div>
  )
}

// ─── (D) Rep Performance Table ────────────────────────────────────────────────

const RANK_COLOR: Record<number, string> = {
  1: 'text-yellow-400',
  2: 'text-slate-300',
  3: 'text-amber-600',
}

function RepTable({ snap }: { snap: TrackerSnapshot }) {
  const sorted = [...snap.repQuarterly]
    .filter((r) => r.target > 0)
    .sort((a, b) => b.ytdActual - a.ytdActual)

  const topNames    = new Set(sorted.slice(0, 3).map((r) => r.name))
  const bottomNames = new Set(sorted.slice(-3).map((r) => r.name))

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">D · Rep Performance</p>
        <div className="flex items-center gap-3 text-[9px] text-muted-foreground/50">
          <span><span className="text-yellow-400">★</span> Top 3</span>
          <span><span className="text-red-400">▼</span> Bottom 3</span>
          <span><span className="text-amber-400">⚠</span> At risk</span>
        </div>
      </div>
      <div className="rounded-xl border border-border bg-card/40 overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[1.5rem_1fr_5.5rem_5.5rem_4.5rem_4rem_4.5rem_3.5rem] gap-2 px-3 py-2 border-b border-border/40 bg-muted/10">
          {['#','Rep','Actual','Forecast','Target','%','Gap','Status'].map((h) => (
            <p key={h} className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground/50 truncate">{h}</p>
          ))}
        </div>
        {/* Rows */}
        {sorted.map((rep, i) => {
          const rank     = i + 1
          const rag      = ragClass(rep.pctAchievement)
          const gap      = rep.target - rep.ytdForecast
          const isTop    = topNames.has(rep.name)
          const isBottom = bottomNames.has(rep.name)
          const isAtRisk = rep.pctAchievement < 0.60
          const isZero   = rep.ytdActual === 0
          return (
            <div
              key={rep.name}
              className={cn(
                'grid grid-cols-[1.5rem_1fr_5.5rem_5.5rem_4.5rem_4rem_4.5rem_3.5rem] gap-2 px-3 py-2 border-b border-border/20 last:border-0 items-center transition-colors',
                isTop    ? 'bg-green-950/10' : isBottom ? 'bg-red-950/10' : '',
              )}
            >
              {/* Rank */}
              <span className={cn('text-[10px] font-mono font-bold', RANK_COLOR[rank] ?? 'text-muted-foreground/50')}>
                {rank <= 3 ? '★' : rank}
              </span>
              {/* Name */}
              <div className="flex items-center gap-1.5 min-w-0">
                <p className="text-[11px] font-medium text-foreground truncate">{rep.name.split(' ')[0]}</p>
                {isAtRisk && !isZero && <AlertTriangle className="size-2.5 shrink-0 text-amber-400" />}
                {isZero   && <span className="text-[8px] text-muted-foreground/40 shrink-0">N/A</span>}
              </div>
              {/* Actual */}
              <p className="font-mono text-[10px] text-foreground text-right">{M(rep.ytdActual)}</p>
              {/* Forecast */}
              <p className="font-mono text-[10px] text-foreground text-right">{M(rep.ytdForecast)}</p>
              {/* Target */}
              <p className="font-mono text-[10px] text-muted-foreground text-right">{M(rep.target)}</p>
              {/* % Achievement */}
              <p className={cn('font-mono text-[10px] font-semibold text-right', RAG_TEXT[rag])}>
                {pct(rep.pctAchievement, 0)}
              </p>
              {/* Gap */}
              <p className={cn('font-mono text-[10px] text-right', gap > 0 ? 'text-red-400' : 'text-green-400')}>
                {gap > 0 ? M(gap) : `+${M(-gap)}`}
              </p>
              {/* Status badge */}
              <span className={cn('rounded border px-1 py-0.5 text-[8px] font-bold text-center', RAG_BG[rag], RAG_TEXT[rag])}>
                {RAG_LABEL[rag]}
              </span>
            </div>
          )
        })}
      </div>
      {/* Summary legend */}
      <div className="flex flex-wrap gap-4 text-[10px] text-muted-foreground/60 px-1">
        <span>Total reps: {sorted.length}</span>
        <span className="text-green-400">{snap.derived.onTrackReps.length} on track (≥80%)</span>
        <span className="text-amber-400">{sorted.filter((r) => r.pctAchievement >= 0.60 && r.pctAchievement < 0.80).length} watch (60–79%)</span>
        <span className="text-red-400">{snap.derived.atRiskReps.length} at risk (&lt;60%)</span>
      </div>
    </div>
  )
}

// ─── (E) Week-on-Week Movement ────────────────────────────────────────────────

function WoWPanel({ snap, wow }: { snap: TrackerSnapshot; wow: WeekOnWeekDelta | null }) {
  if (!wow) {
    return (
      <div className="space-y-2">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">E · Week-on-Week Movement</p>
        <div className="rounded-xl border border-border/30 bg-card/20 px-6 py-8 text-center space-y-2">
          <p className="text-sm font-medium text-foreground">No comparison week available</p>
          <p className="text-xs text-muted-foreground">Upload a second tracker to unlock week-on-week GP movement, rep changes, and trending alerts.</p>
          <Link
            href="/admin/import"
            className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-[#e8640c]/40 px-4 py-2 text-xs text-[#e8640c] hover:bg-[#e8640c]/10 transition-colors"
          >
            Upload comparison week <ChevronRight className="size-3.5" />
          </Link>
        </div>
      </div>
    )
  }

  const topMovers = [...wow.repChanges]
    .filter((r) => Math.abs(r.totalActualDelta) > 50_000)
    .sort((a, b) => Math.abs(b.totalActualDelta) - Math.abs(a.totalActualDelta))
    .slice(0, 8)

  return (
    <div className="space-y-2">
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">E · Week-on-Week Movement</p>
      <div className="rounded-xl border border-border bg-card/40 p-4 space-y-4">
        {/* Headline deltas */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'Actual GP Change',   val: wow.totalActualDelta,   pctVal: wow.totalActualPct },
            { label: 'Forecast Change',     val: wow.totalForecastDelta, pctVal: wow.totalForecastPct },
            { label: 'Improved Reps',       val: wow.improvedReps.length,  isCount: true, color: 'text-green-400' },
            { label: 'Declined Reps',       val: wow.declinedReps.length,  isCount: true, color: 'text-red-400' },
          ].map((item) => (
            <div key={item.label} className="rounded-lg border border-border/40 bg-card/30 p-3">
              <p className="text-[10px] text-muted-foreground">{item.label}</p>
              {'isCount' in item && item.isCount ? (
                <p className={cn('mt-1 text-2xl font-bold font-mono', item.color)}>{item.val}</p>
              ) : (
                <>
                  <p className={cn('mt-1 text-lg font-bold font-mono',
                    (item.val as number) >= 0 ? 'text-green-400' : 'text-red-400',
                  )}>
                    {(item.val as number) >= 0 ? '+' : ''}{M(item.val as number)}
                  </p>
                  <p className="text-[10px] text-muted-foreground/60">
                    {(item.pctVal as number) >= 0 ? '+' : ''}{pct(item.pctVal as number)} vs prev
                  </p>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Rep movements */}
        {topMovers.length > 0 && (
          <div className="space-y-1">
            <p className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-widest">Rep actual GP movements</p>
            <div className="space-y-1">
              {topMovers.map((r) => {
                const Icon = r.totalActualDelta > 0 ? ArrowUpRight : ArrowDownRight
                const color = r.totalActualDelta > 0 ? 'text-green-400' : 'text-red-400'
                return (
                  <div key={r.name} className="flex items-center gap-2">
                    <Icon className={cn('size-3.5 shrink-0', color)} />
                    <p className="w-28 text-[11px] text-foreground truncate">{r.name.split(' ')[0]}</p>
                    <p className={cn('w-20 text-right font-mono text-[10px] font-semibold', color)}>
                      {r.totalActualDelta > 0 ? '+' : ''}{M(r.totalActualDelta)}
                    </p>
                    <p className="flex-1 text-[10px] text-muted-foreground/60 truncate">{r.note}</p>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Quarterly WoW */}
        <div className="space-y-1">
          <p className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-widest">Quarterly forecast movement</p>
          <div className="grid grid-cols-4 gap-2">
            {wow.quarterlyDeltas.map((q) => {
              const positive = q.forecastDelta >= 0
              return (
                <div key={q.q} className="rounded border border-border/30 bg-card/20 px-2 py-1.5 text-center">
                  <p className="text-[9px] text-muted-foreground font-semibold">{q.label}</p>
                  <p className={cn('font-mono text-[10px] font-bold', positive ? 'text-green-400' : 'text-red-400')}>
                    {positive ? '+' : ''}{M(q.forecastDelta)}
                  </p>
                  <p className="text-[9px] text-muted-foreground/50">forecast</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Period label */}
        <p className="text-[10px] text-muted-foreground/40 text-right">
          Comparing {wow.fromDate} → {wow.toDate}
        </p>
      </div>
    </div>
  )
}

// ─── Master section ───────────────────────────────────────────────────────────

export function TrackerPerformanceSection() {
  const latest  = useTrackerStore((s) => s.latest)
  const wowDelta = useTrackerStore((s) => s.wowDelta)

  if (!latest) return null

  return (
    <div className="rounded-xl border border-border bg-card/30 overflow-hidden">
      {/* Section header */}
      <div className="flex items-center justify-between border-b border-border/40 bg-muted/10 px-5 py-3">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-[#e8640c]/10 p-1.5">
            <Target className="size-4 text-[#e8640c]" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">Tracker Performance</p>
            <p className="text-[10px] text-muted-foreground">{latest.fiscalYear} · {latest.reportingWeek}</p>
          </div>
        </div>
        <Link
          href="/admin/import"
          className="text-[10px] text-muted-foreground/50 hover:text-muted-foreground transition-colors"
        >
          {wowDelta ? 'Upload next week →' : 'Upload comparison week →'}
        </Link>
      </div>

      {/* Content */}
      <div className="p-5 space-y-8">
        <InsightBanner snap={latest} wow={wowDelta} />
        <AnnualOverview  snap={latest} />
        <QuarterlyOverview snap={latest} />
        <MonthlyChart    snap={latest} />
        <RepTable        snap={latest} />
        <WoWPanel        snap={latest} wow={wowDelta} />
      </div>
    </div>
  )
}
