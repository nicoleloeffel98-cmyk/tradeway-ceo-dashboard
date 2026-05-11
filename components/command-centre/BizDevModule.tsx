'use client'
import { SectionShell } from './SectionShell'
import { KPICard } from '@/components/dashboard/shared/KPICard'
import { mockBDKPIs, mockBDFunnel, mockOpportunities } from '@/lib/data/mock-bd'
import { formatZAR } from '@/lib/utils/format'
import { cn } from '@/lib/utils'
import { generateInsights } from '@/lib/insights/engine'
import { useImportStore } from '@/lib/stores/useImportStore'
import { mergeImportedKPIs } from '@/lib/import/transformers'

const insights = generateInsights()

const STAGE_COLORS: Record<string, string> = {
  prospect:    'bg-blue-600',
  qualified:   'bg-violet-600',
  proposal:    'bg-orange-500',
  negotiation: 'bg-green-600',
}

export function BizDevModule() {
  const importedValues = useImportStore((s) => s.activeImport?.data.bd)
  const keyKPIs  = mergeImportedKPIs(
    mockBDKPIs.filter((k) => ['bd-total-pipeline', 'bd-win-rate', 'bd-open-opportunities'].includes(k.id)),
    importedValues,
  )
  const topOpps  = mockOpportunities.filter((o) => o.stage === 'negotiation' || o.stage === 'proposal').slice(0, 3)
  const insight  = insights.bizdev
  const maxValue = Math.max(...mockBDFunnel.map((s) => s.value))

  return (
    <SectionShell
      title="Business Development"
      status="neutral"
      subtitle="Pipeline health · win rate · opportunities"
      insight={insight.headline}
      insightAction="Review proposal stage conversion before Q3 kickoff"
      href="/bd"
      delay={0.1}
    >
      {/* KPI row */}
      <div className="grid grid-cols-2 gap-2 min-[400px]:grid-cols-3">
        {keyKPIs.map((kpi) => (
          <KPICard key={kpi.id} kpi={kpi} compact />
        ))}
      </div>

      {/* Pipeline funnel bars */}
      <div className="space-y-1.5">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">Pipeline funnel</p>
        {mockBDFunnel.map((stage) => (
          <div key={stage.stage} className="space-y-0.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground">{stage.label}</span>
              <span className="font-mono text-foreground">{formatZAR(stage.value)}</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-card overflow-hidden">
              <div
                className={cn('h-full rounded-full', STAGE_COLORS[stage.stage])}
                style={{ width: `${(stage.value / maxValue) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Top opportunities */}
      <div className="space-y-1">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">Hot deals</p>
        {topOpps.map((opp) => (
          <div key={opp.id} className="flex items-center justify-between py-1 border-b border-border/30 last:border-0">
            <div>
              <p className="text-[12px] font-medium text-foreground">{opp.client}</p>
              <p className="text-[10px] text-muted-foreground">{opp.stage} · {opp.probability}% prob</p>
            </div>
            <span className="font-mono text-[12px] font-semibold text-foreground">{formatZAR(opp.value)}</span>
          </div>
        ))}
      </div>
    </SectionShell>
  )
}
