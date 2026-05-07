import { mockPriorities } from '@/lib/data/mock-priorities'
import { PriorityCard } from './PriorityCard'
import { SectionHeader } from '@/components/dashboard/shared/SectionHeader'

interface PrioritiesPanelProps {
  maxItems?: number
}

export function PrioritiesPanel({ maxItems }: PrioritiesPanelProps) {
  const visible   = maxItems ? mockPriorities.slice(0, maxItems) : mockPriorities
  const redCount  = visible.filter((p) => p.status === 'red').length
  const panelStatus = redCount > 0 ? 'red' : visible.some((p) => p.status === 'amber') ? 'amber' : 'green'
  const hiddenCount = mockPriorities.length - visible.length

  return (
    <div className="flex flex-col gap-3">
      <SectionHeader
        title="CEO Priorities"
        subtitle={`${mockPriorities.length} strategic priorities`}
        status={panelStatus}
      />
      <div className="rounded-xl border border-border bg-card p-4 space-y-4">
        {visible.map((priority, i) => (
          <PriorityCard key={priority.id} priority={priority} rank={i + 1} />
        ))}
        {hiddenCount > 0 && (
          <p className="text-[11px] text-muted-foreground/60 pt-1">
            +{hiddenCount} more priorit{hiddenCount === 1 ? 'y' : 'ies'}
          </p>
        )}
      </div>
    </div>
  )
}
