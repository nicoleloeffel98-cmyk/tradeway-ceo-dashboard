'use client'
import { AnimatePresence, motion } from 'framer-motion'
import { Clock, CheckCircle, DollarSign } from 'lucide-react'
import { useDecisionsStore } from '@/lib/stores/useDecisionsStore'
import { cn } from '@/lib/utils'
import type { DecisionItem, DecisionPriority } from '@/lib/types'

const PRIORITY: Record<DecisionPriority, { label: string; color: string; bg: string }> = {
  urgent: { label: 'URGENT', color: 'text-red-400',   bg: 'bg-red-950/60 border-red-800' },
  high:   { label: 'HIGH',   color: 'text-amber-400', bg: 'bg-amber-950/50 border-amber-800' },
  normal: { label: 'NOW',    color: 'text-slate-400',  bg: 'bg-slate-800/60 border-slate-700' },
}

function DecisionItem({ decision }: { decision: DecisionItem }) {
  const act = useDecisionsStore((s) => s.actOnDecision)
  const cfg = PRIORITY[decision.priority]
  const daysLeft = decision.deadline
    ? Math.ceil((new Date(decision.deadline).getTime() - Date.now()) / 86_400_000)
    : null

  return (
    <motion.div
      layout
      exit={{ opacity: 0, height: 0, marginBottom: 0, paddingTop: 0, paddingBottom: 0 }}
      transition={{ duration: 0.25 }}
      className={cn(
        'rounded-lg border bg-card/60 p-3 space-y-2.5',
        decision.priority === 'urgent' ? 'border-red-900/50' : 'border-border',
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span className={cn('rounded border px-1.5 py-0.5 text-[9px] font-bold tracking-wider', cfg.bg, cfg.color)}>
          {cfg.label}
        </span>
        {daysLeft !== null && (
          <span className={cn('flex items-center gap-1 text-[11px]', daysLeft <= 2 ? 'text-red-400' : 'text-muted-foreground/60')}>
            <Clock className="size-3" />
            {daysLeft <= 0 ? 'Overdue' : `${daysLeft}d`}
          </span>
        )}
      </div>

      <div>
        <p className="text-[12px] font-semibold text-foreground leading-snug">{decision.title}</p>
        <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
          {decision.context}
        </p>
        {decision.financialStake && (
          <div className="mt-1.5 flex items-center gap-1 rounded border border-amber-900/40 bg-amber-950/25 px-2 py-1">
            <DollarSign className="size-2.5 shrink-0 text-amber-400" />
            <p className="text-[10px] font-semibold text-amber-400 leading-tight">{decision.financialStake}</p>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1.5 flex-wrap">
        <button
          onClick={() => act(decision.id, 'decided')}
          className="rounded bg-[#e8640c] px-2.5 py-1 text-[11px] font-semibold text-white hover:opacity-90 transition-opacity"
        >
          Approve
        </button>
        <button
          onClick={() => act(decision.id, 'deferred')}
          className="rounded border border-border px-2.5 py-1 text-[11px] font-medium text-muted-foreground hover:text-foreground hover:border-muted-foreground transition-colors"
        >
          Defer
        </button>
        <button
          onClick={() => act(decision.id, 'delegated')}
          className="rounded border border-border px-2.5 py-1 text-[11px] font-medium text-muted-foreground hover:text-foreground hover:border-muted-foreground transition-colors"
        >
          Delegate
        </button>
      </div>
    </motion.div>
  )
}

export function DecisionQueueModule() {
  const decisionsStore = useDecisionsStore()
  const decisions      = decisionsStore.allDecisions()
  const pending        = decisions.filter((d) => d.status === 'pending')
  const hasUrgent   = pending.some((d) => d.priority === 'urgent')
  const borderColor = hasUrgent ? 'border-l-red-600' : pending.some((d) => d.priority === 'high') ? 'border-l-amber-500' : 'border-l-green-600'
  const dotColor    = hasUrgent ? 'bg-red-500' : pending.some((d) => d.priority === 'high') ? 'bg-amber-500' : 'bg-green-500'

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.05 }}
      className={cn('rounded-xl border border-border bg-card border-l-[3px]', borderColor)}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
        <div className="flex items-center gap-2.5">
          <span className={cn('size-2 rounded-full', dotColor, hasUrgent && 'animate-pulse')} />
          <span className="text-[13px] font-semibold text-foreground">CEO Decision Queue</span>
          <span className="text-[10px] text-muted-foreground">
            {pending.length} item{pending.length !== 1 ? 's' : ''} awaiting action
          </span>
        </div>
      </div>

      {/* Decisions */}
      <div className="px-4 py-3">
        {pending.length === 0 ? (
          <div className="flex items-center justify-center gap-2 py-4">
            <CheckCircle className="size-4 text-green-400" />
            <p className="text-sm font-medium text-green-400">Queue cleared — all decisions actioned</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
            <AnimatePresence initial={false}>
              {pending.map((decision) => (
                <DecisionItem key={decision.id} decision={decision} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  )
}
