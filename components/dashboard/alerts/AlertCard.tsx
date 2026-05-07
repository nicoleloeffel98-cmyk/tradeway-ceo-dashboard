'use client'
import { AlertTriangle, AlertCircle, Info, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { Alert, AlertSeverity } from '@/lib/types'

const SEVERITY_CONFIG: Record<AlertSeverity, {
  icon: React.FC<{ className?: string }>
  color: string
  bg: string
}> = {
  critical: { icon: AlertTriangle, color: 'text-red-400',   bg: 'bg-red-950/40 border-red-900/60' },
  warning:  { icon: AlertCircle,   color: 'text-amber-400', bg: 'bg-amber-950/40 border-amber-900/60' },
  info:     { icon: Info,          color: 'text-blue-400',  bg: 'bg-blue-950/40 border-blue-900/60' },
}

function formatAlertTime(iso: string): string {
  const date      = new Date(iso)
  const now       = new Date()
  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  const time = date.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit', hour12: false })
  if (date.toDateString() === now.toDateString())       return `Today ${time}`
  if (date.toDateString() === yesterday.toDateString()) return `Yesterday ${time}`
  return date.toLocaleDateString('en-ZA', { weekday: 'short', day: 'numeric', month: 'short' }) + ` ${time}`
}

interface AlertCardProps {
  alert: Alert
}

export function AlertCard({ alert }: AlertCardProps) {
  const cfg = SEVERITY_CONFIG[alert.severity]
  const Icon = cfg.icon
  return (
    <div className={cn(
      'flex gap-3 rounded-lg border p-3 transition-opacity',
      cfg.bg,
      alert.isRead && 'opacity-60',
    )}>
      <Icon className={cn('mt-0.5 size-4 shrink-0', cfg.color)} />
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <p className={cn('text-xs font-semibold leading-tight', !alert.isRead && 'text-foreground')}>
            {alert.title}
          </p>
          <span className="shrink-0 text-[10px] text-muted-foreground tabular-nums">{formatAlertTime(alert.createdAt)}</span>
        </div>
        <p className="text-[11px] text-muted-foreground leading-relaxed">{alert.summary}</p>
        {alert.actionLabel && alert.actionUrl && (
          <Link
            href={alert.actionUrl}
            className={cn('inline-flex items-center gap-1 text-[11px] font-medium', cfg.color, 'hover:underline')}
          >
            {alert.actionLabel}
            <ArrowRight className="size-3" />
          </Link>
        )}
      </div>
    </div>
  )
}
