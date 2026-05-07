'use client'
import { AnimatePresence, motion } from 'framer-motion'
import { useDecisionsStore } from '@/lib/stores/useDecisionsStore'
import { DecisionCard } from './DecisionCard'
import { SectionHeader } from '@/components/dashboard/shared/SectionHeader'

interface DecisionQueuePanelProps {
  maxItems?: number
}

export function DecisionQueuePanel({ maxItems }: DecisionQueuePanelProps) {
  const decisions   = useDecisionsStore((s) => s.decisions)
  const pending     = decisions.filter((d) => d.status === 'pending')
  const visible     = maxItems ? pending.slice(0, maxItems) : pending
  const hiddenCount = pending.length - visible.length
  const hasUrgent   = visible.some((d) => d.priority === 'urgent')
  const panelStatus = hasUrgent ? 'red' : visible.some((d) => d.priority === 'high') ? 'amber' : 'green'

  return (
    <div className="flex flex-col gap-3">
      <SectionHeader
        title="Decision Queue"
        subtitle={`${pending.length} item${pending.length === 1 ? '' : 's'} awaiting CEO`}
        status={panelStatus}
      />
      <div className="space-y-3">
        <AnimatePresence initial={false}>
          {visible.map((decision) => (
            <DecisionCard key={decision.id} decision={decision} />
          ))}

          {pending.length === 0 && (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="rounded-lg border border-green-900/30 bg-green-950/10 p-4 text-center"
            >
              <p className="text-sm font-medium text-green-400">Queue cleared</p>
              <p className="text-xs text-muted-foreground mt-1">All decisions actioned</p>
            </motion.div>
          )}
        </AnimatePresence>

        {hiddenCount > 0 && (
          <p className="text-[11px] text-muted-foreground/60 px-1">
            +{hiddenCount} more decision{hiddenCount === 1 ? '' : 's'} in queue
          </p>
        )}
      </div>
    </div>
  )
}
