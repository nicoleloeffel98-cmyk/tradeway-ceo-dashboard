'use client'
import { SectionShell } from './SectionShell'
import { KPICard } from '@/components/dashboard/shared/KPICard'
import { mockOpsKPIs, mockRegionalActivations, mockIncidents } from '@/lib/data/mock-operations'
import { cn } from '@/lib/utils'
import { generateInsights } from '@/lib/insights/engine'
import type { RAGStatus } from '@/lib/types'

const insights = generateInsights()

const STATUS_DOT: Record<RAGStatus, string> = {
  green:   'bg-green-500',
  amber:   'bg-amber-500',
  red:     'bg-red-500',
  neutral: 'bg-slate-500',
}

const SEV_COLOR: Record<string, string> = {
  high:   'text-red-400 bg-red-950/50 border-red-900/50',
  medium: 'text-amber-400 bg-amber-950/40 border-amber-800/50',
  low:    'text-slate-400 bg-slate-800/50 border-slate-700/50',
}

export function OperationsModule() {
  const keyKPIs  = mockOpsKPIs.filter((k) =>
    ['ops-activations-mtd', 'ops-no-show-rate', 'ops-success-rate'].includes(k.id),
  )
  const insight      = insights.operations
  const topRegions   = mockRegionalActivations.slice(0, 5)
  const openIncidents = mockIncidents.filter((i) => i.status !== 'resolved').slice(0, 3)

  return (
    <SectionShell
      title="Operations"
      status="red"
      subtitle="Activations · no-shows · regional health"
      insight={insight.headline}
      insightAction="Gauteng — escalate staffing to resolve no-show crisis this week"
      href="/operations"
      delay={0.25}
    >
      {/* KPI row */}
      <div className="grid grid-cols-2 gap-2 min-[400px]:grid-cols-3">
        {keyKPIs.map((kpi) => (
          <KPICard key={kpi.id} kpi={kpi} compact />
        ))}
      </div>

      {/* Regional status */}
      <div className="space-y-1">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">Regional success rate</p>
        {topRegions.map((region) => (
          <div key={region.region} className="flex items-center gap-2">
            <span className={cn('size-1.5 shrink-0 rounded-full', STATUS_DOT[region.status])} />
            <p className="w-28 truncate text-[11px] text-muted-foreground">{region.region}</p>
            <div className="flex-1 h-1.5 rounded-full bg-card overflow-hidden">
              <div
                style={{ width: `${region.successRate}%`, height: '100%', borderRadius: '9999px',
                  backgroundColor: region.successRate >= 95 ? '#16a34a' : region.successRate >= 92 ? '#d97706' : '#dc2626'
                }}
              />
            </div>
            <span className="w-12 text-right font-mono text-[11px] text-foreground">{region.successRate}%</span>
          </div>
        ))}
      </div>

      {/* Open incidents */}
      {openIncidents.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
            Open incidents ({openIncidents.length})
          </p>
          {openIncidents.map((inc) => (
            <div
              key={inc.id}
              className={cn('rounded border px-2 py-1.5 text-[11px]', SEV_COLOR[inc.severity])}
            >
              <span className="font-medium">{inc.region}</span>
              {' — '}
              <span className="leading-relaxed">{inc.description.split('—')[0].trim()}</span>
            </div>
          ))}
        </div>
      )}
    </SectionShell>
  )
}
