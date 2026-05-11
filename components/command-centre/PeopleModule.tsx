'use client'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { SectionShell } from './SectionShell'
import { KPICard } from '@/components/dashboard/shared/KPICard'
import {
  mockPeopleKPIs,
  mockAmbassadorRegions,
  mockOpenVacancies,
  mockCapacity,
} from '@/lib/data/mock-people'
import { cn } from '@/lib/utils'
import { CHART_THEME } from '@/lib/constants/design-tokens'
import { generateInsights } from '@/lib/insights/engine'
import { useImportStore } from '@/lib/stores/useImportStore'
import { mergePeopleKPIs } from '@/lib/workbook/kpiMerger'
import type { RAGStatus } from '@/lib/utils/rag'

const insights = generateInsights()

const DOT: Record<RAGStatus, string> = {
  green:   'bg-green-500',
  amber:   'bg-amber-500',
  red:     'bg-red-500',
  neutral: 'bg-slate-500',
}

export function PeopleModule() {
  const derived = useImportStore((s) => s.activeImport?.derived.people)
  const keyKPIs = mergePeopleKPIs(
    mockPeopleKPIs.filter((k) => ['ppl-capacity-util', 'ppl-open-roles', 'ppl-attrition'].includes(k.id)),
    derived,
  )
  const insight         = insights.people
  const criticalRoles   = mockOpenVacancies.filter((v) => v.priority === 'critical')
  const highRoles       = mockOpenVacancies.filter((v) => v.priority === 'high')

  const capacityData = mockCapacity.map((d) => ({
    week:      d.week,
    required:  d.required / 1000,
    available: d.available / 1000,
  }))

  return (
    <SectionShell
      title="People & Capacity"
      status="neutral"
      subtitle="Headcount · utilisation · open roles"
      insight={insight.headline}
      insightAction="Approve Q3 headcount plan — August capacity gap is 340 ambassadors"
      href="/people"
      delay={0.15}
    >
      {/* KPI row */}
      <div className="grid grid-cols-2 gap-2 min-[400px]:grid-cols-3">
        {keyKPIs.map((kpi) => (
          <KPICard key={kpi.id} kpi={kpi} compact />
        ))}
      </div>

      {/* Capacity forecast */}
      <div>
        <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
          Capacity: required vs available (K)
        </p>
        <ResponsiveContainer width="100%" height={80}>
          <AreaChart data={capacityData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <XAxis dataKey="week" tick={{ fill: CHART_THEME.axisColor, fontSize: 9 }} axisLine={false} tickLine={false}
              tickFormatter={(v) => v.replace('W', '').replace(' Apr', '').replace(' May', '')}
            />
            <YAxis hide domain={['auto', 'auto']} />
            <Tooltip
              contentStyle={{ backgroundColor: CHART_THEME.tooltipBg, border: `1px solid ${CHART_THEME.tooltipBorder}`, borderRadius: 6, fontSize: 11 }}
              formatter={(v) => [`${(Number(v) * 1000).toLocaleString()}`, '']}
              labelStyle={{ color: '#f1f5f9' }}
            />
            <Area type="monotone" dataKey="available" stroke="#16a34a" strokeWidth={1.5} fill="#16a34a20" dot={false} />
            <Area type="monotone" dataKey="required"  stroke="#e8640c" strokeWidth={1.5} fill="none" strokeDasharray="4 2" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
        <p className="mt-1 text-[10px] text-muted-foreground/50">
          <span className="text-[#e8640c]">— — </span>Required&nbsp;&nbsp;
          <span className="text-green-500">—— </span>Available
        </p>
      </div>

      {/* Open vacancies */}
      {(criticalRoles.length > 0 || highRoles.length > 0) && (
        <div className="space-y-1">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
            Critical vacancies
          </p>
          {[...criticalRoles, ...highRoles].slice(0, 3).map((v) => (
            <div key={v.id} className="flex items-center justify-between py-1 border-b border-border/30 last:border-0">
              <div className="flex items-center gap-2 min-w-0">
                <span className={cn(
                  'shrink-0 rounded border px-1 py-0.5 text-[9px] font-bold',
                  v.priority === 'critical'
                    ? 'bg-red-950/50 text-red-400 border-red-900/50'
                    : 'bg-amber-950/40 text-amber-400 border-amber-800/50',
                )}>
                  {v.priority === 'critical' ? 'CRIT' : 'HIGH'}
                </span>
                <p className="truncate text-[11px] text-foreground">{v.role.split('—')[0].trim()}</p>
              </div>
              <span className="shrink-0 text-[10px] text-muted-foreground ml-2">{v.daysOpen}d open</span>
            </div>
          ))}
        </div>
      )}
    </SectionShell>
  )
}
