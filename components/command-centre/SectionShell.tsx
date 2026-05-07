'use client'
import Link from 'next/link'
import { ArrowUpRight, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import { StatusIndicator } from '@/components/shared/StatusIndicator'
import { cn } from '@/lib/utils'
import type { RAGStatus } from '@/lib/types'

interface SectionShellProps {
  title:          string
  status:         RAGStatus
  subtitle?:      string
  insight?:       string
  insightAction?: string
  href?:          string
  children:       React.ReactNode
  className?:     string
  delay?:         number
}

const STATUS_BORDER: Record<RAGStatus, string> = {
  red:     'border-l-red-600',
  amber:   'border-l-amber-500',
  green:   'border-l-green-600',
  neutral: 'border-l-slate-700',
}

const INSIGHT_BG: Record<RAGStatus, string> = {
  red:     'bg-red-950/25 border-red-900/30',
  amber:   'bg-amber-950/25 border-amber-900/30',
  green:   'bg-green-950/20 border-green-900/30',
  neutral: 'bg-card/80 border-border/40',
}

export function SectionShell({
  title,
  status,
  subtitle,
  insight,
  insightAction,
  href,
  children,
  className,
  delay = 0,
}: SectionShellProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      className={cn(
        'flex flex-col rounded-xl border border-border bg-card border-l-[3px]',
        STATUS_BORDER[status],
        className,
      )}
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-2 px-4 pt-4 pb-3 border-b border-border/50">
        <div className="flex items-center gap-2.5">
          <StatusIndicator status={status} size="md" pulse={status === 'red'} />
          <div>
            <h3 className="text-[13px] font-semibold text-foreground leading-none">{title}</h3>
            {subtitle && (
              <p className="mt-0.5 text-[10px] text-muted-foreground">{subtitle}</p>
            )}
          </div>
        </div>
        {href && (
          <Link
            href={href}
            className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground/50 hover:text-muted-foreground transition-colors"
          >
            Detail
            <ArrowUpRight className="size-3" />
          </Link>
        )}
      </div>

      {/* ── AI Insight block — FIRST, before all data ── */}
      {insight && (
        <div className={cn('mx-4 mt-3 rounded-lg border px-3 py-2.5 space-y-1', INSIGHT_BG[status])}>
          <div className="flex items-start gap-2">
            <Sparkles className="size-3 shrink-0 mt-0.5 text-muted-foreground/50" />
            <p className="text-[12px] italic text-muted-foreground/80 leading-relaxed">
              {insight}
            </p>
          </div>
          {insightAction && (
            <p className="pl-5 text-[11px] font-semibold text-amber-400">
              → {insightAction}
            </p>
          )}
        </div>
      )}

      {/* ── Supporting data (charts, KPIs, lists) ── */}
      <div className="flex-1 px-4 py-3 space-y-3">
        {children}
      </div>
    </motion.div>
  )
}
