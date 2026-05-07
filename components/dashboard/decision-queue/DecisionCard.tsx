'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Clock, Check } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useDecisionsStore } from '@/lib/stores/useDecisionsStore'
import type { DecisionItem, DecisionPriority } from '@/lib/types'

const PRIORITY_CONFIG: Record<DecisionPriority, { label: string; className: string }> = {
  urgent: { label: 'URGENT', className: 'bg-red-950 text-red-400 border-red-800' },
  high:   { label: 'HIGH',   className: 'bg-amber-950 text-amber-400 border-amber-800' },
  normal: { label: 'NORMAL', className: 'bg-slate-800 text-slate-400 border-slate-700' },
}

const ACTION_LABELS: Record<string, string> = {
  decided:   'Approved',
  deferred:  'Deferred',
  delegated: 'Delegated',
}

interface DecisionCardProps {
  decision: DecisionItem
}

export function DecisionCard({ decision }: DecisionCardProps) {
  const actOnDecision = useDecisionsStore((s) => s.actOnDecision)
  const [confirming, setConfirming] = useState<'decided' | 'deferred' | 'delegated' | null>(null)

  const cfg = PRIORITY_CONFIG[decision.priority]
  const daysLeft = decision.deadline
    ? Math.ceil((new Date(decision.deadline).getTime() - Date.now()) / 86_400_000)
    : null

  function handleAction(action: 'decided' | 'deferred' | 'delegated') {
    if (confirming) return
    setConfirming(action)
    setTimeout(() => actOnDecision(decision.id, action), 1200)
  }

  return (
    <motion.div
      layout
      exit={{ opacity: 0, scale: 0.96, y: -4 }}
      transition={{ duration: 0.25 }}
      className={cn(
        'rounded-lg border bg-card p-4 space-y-3 overflow-hidden',
        decision.priority === 'urgent' ? 'border-red-900/40' : 'border-border',
      )}
    >
      {confirming ? (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="flex items-center justify-center gap-2 py-2"
        >
          <div className="flex size-5 items-center justify-center rounded-full bg-green-500/20">
            <Check className="size-3 text-green-400" />
          </div>
          <span className="text-sm font-medium text-green-400">{ACTION_LABELS[confirming]}</span>
        </motion.div>
      ) : (
        <>
          <div className="flex items-start gap-2 justify-between">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className={cn('text-[10px] font-bold border', cfg.className)}>
                {cfg.label}
              </Badge>
              {daysLeft !== null && (
                <span className={cn('flex items-center gap-1 text-[11px]', daysLeft <= 2 ? 'text-red-400' : 'text-muted-foreground')}>
                  <Clock className="size-3" />
                  {daysLeft <= 0 ? 'Overdue' : `${daysLeft}d left`}
                </span>
              )}
            </div>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wide shrink-0">
              {decision.module}
            </span>
          </div>

          <div>
            <p className="text-sm font-semibold text-foreground">{decision.title}</p>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed line-clamp-2">
              {decision.context}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              className="h-7 bg-brand-orange text-white text-xs hover:bg-brand-orange-light"
              onClick={() => handleAction('decided')}
            >
              Approve
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-xs text-muted-foreground hover:text-foreground"
              onClick={() => handleAction('deferred')}
            >
              Defer
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-xs text-muted-foreground hover:text-foreground"
              onClick={() => handleAction('delegated')}
            >
              Delegate
            </Button>
          </div>
        </>
      )}
    </motion.div>
  )
}
