import { MorningBriefing } from './MorningBriefing'
import { AlertsPanel } from '@/components/dashboard/alerts/AlertsPanel'
import { PrioritiesPanel } from '@/components/dashboard/priorities/PrioritiesPanel'
import { DecisionQueuePanel } from '@/components/dashboard/decision-queue/DecisionQueuePanel'
import { KPIGrid } from '@/components/dashboard/shared/KPIGrid'
import { mockExecutiveKPIs } from '@/lib/data/mock-kpis'

const CRITICAL_KPI_IDS = [
  'revenue-mtd',
  'ebitda-margin',
  'bd-pipeline',
  'activations-ytd',
  'bd-win-rate',
  'sales-forecast',
]

function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-4">
      <div className="h-px flex-1 bg-border/30" />
      <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/30 select-none">
        {label}
      </span>
      <div className="h-px flex-1 bg-border/30" />
    </div>
  )
}

export function CEOHomePage() {
  const criticalKPIs   = mockExecutiveKPIs.filter((k) => CRITICAL_KPI_IDS.includes(k.id))
  const supportingKPIs = mockExecutiveKPIs.filter((k) => !CRITICAL_KPI_IDS.includes(k.id))

  return (
    <div className="space-y-8">
      <MorningBriefing />

      {/* Command Centre — 3-column panels */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:items-start">
        <AlertsPanel maxItems={3} />
        <PrioritiesPanel maxItems={3} />
        <DecisionQueuePanel maxItems={3} />
      </div>

      <SectionDivider label="Performance" />

      {/* Critical KPIs */}
      <div className="space-y-3">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60">
          Key Indicators
        </p>
        <KPIGrid kpis={criticalKPIs} columns={6} />
      </div>

      {/* Supporting metrics — visually de-emphasised */}
      {supportingKPIs.length > 0 && (
        <div className="space-y-3 opacity-70">
          <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-muted-foreground/40">
            Supporting Metrics
          </p>
          <KPIGrid kpis={supportingKPIs} columns={6} />
        </div>
      )}
    </div>
  )
}
