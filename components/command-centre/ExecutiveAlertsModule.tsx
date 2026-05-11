'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, AlertCircle, Info, X, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useAlertsStore } from '@/lib/stores/useAlertsStore'
import { cn } from '@/lib/utils'
import type { Alert, AlertSeverity } from '@/lib/types'

const SEV: Record<AlertSeverity, {
  icon: React.FC<{ className?: string }>
  color: string
  bg: string
  pulse: boolean
}> = {
  critical: { icon: AlertTriangle, color: 'text-red-400',   bg: 'bg-red-950/50 border-red-900/60',   pulse: true },
  warning:  { icon: AlertCircle,   color: 'text-amber-400', bg: 'bg-amber-950/40 border-amber-900/50', pulse: false },
  info:     { icon: Info,          color: 'text-blue-400',  bg: 'bg-blue-950/30 border-blue-900/40',  pulse: false },
}

function AlertRow({ alert }: { alert: Alert }) {
  const markRead = useAlertsStore((s) => s.markRead)
  const cfg    = SEV[alert.severity]
  const Icon   = cfg.icon
  const today  = new Date().toISOString().slice(0, 10)
  const isNew  = alert.createdAt.startsWith(today) && !alert.isRead
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: alert.isRead ? 0.55 : 1, x: 0 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.25 }}
      className={cn('relative flex gap-3 rounded-lg border px-3 py-2.5', cfg.bg)}
    >
      {/* Critical pulse ring */}
      {cfg.pulse && !alert.isRead && (
        <span className="absolute -left-px top-2 h-4 w-0.5 rounded-full bg-red-500 animate-pulse" />
      )}
      <Icon className={cn('mt-0.5 size-3.5 shrink-0', cfg.color)} />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-1.5 flex-wrap">
            {isNew && (
              <span className="shrink-0 rounded bg-[#e8640c] px-1 py-0.5 text-[8px] font-bold uppercase tracking-widest text-white leading-none">
                NEW
              </span>
            )}
            <p className="text-[12px] font-semibold text-foreground leading-tight">{alert.title}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className="text-[10px] text-muted-foreground tabular-nums whitespace-nowrap">
              {new Date(alert.createdAt).toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit', hour12: false })}
            </span>
            {!alert.isRead && (
              <button
                onClick={() => markRead(alert.id)}
                className="text-muted-foreground/40 hover:text-muted-foreground transition-colors"
              >
                <X className="size-3" />
              </button>
            )}
          </div>
        </div>
        <p className="mt-0.5 text-[11px] text-muted-foreground leading-relaxed line-clamp-1">
          {alert.summary}
        </p>
        {alert.actionLabel && alert.actionUrl && (
          <Link
            href={alert.actionUrl}
            className={cn('mt-1 inline-flex items-center gap-1 text-[11px] font-medium hover:underline', cfg.color)}
          >
            {alert.actionLabel}
            <ArrowRight className="size-3" />
          </Link>
        )}
      </div>
    </motion.div>
  )
}

export function ExecutiveAlertsModule() {
  const alertsStore = useAlertsStore()
  const alerts      = alertsStore.allAlerts()
  const unreadCount = alertsStore.unreadCount()
  const markAllRead = alertsStore.markAllRead

  const criticals = alerts.filter((a) => a.severity === 'critical' && !a.isRead)
  const warnings  = alerts.filter((a) => a.severity === 'warning' && !a.isRead)
  const infos     = alerts.filter((a) => a.severity === 'info' && !a.isRead)
  const read      = alerts.filter((a) => a.isRead).slice(0, 2)

  const status = criticals.length > 0 ? 'red' : warnings.length > 0 ? 'amber' : 'green'
  const StatusDot = () => (
    <span className="relative inline-flex size-2">
      {status === 'red' && <span className="absolute inline-flex size-full animate-ping rounded-full bg-red-500 opacity-60" />}
      <span className={cn('relative inline-flex size-full rounded-full', {
        'bg-red-500':   status === 'red',
        'bg-amber-500': status === 'amber',
        'bg-green-500': status === 'green',
      })} />
    </span>
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-xl border border-border bg-card border-l-[3px] border-l-red-600"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
        <div className="flex items-center gap-2.5">
          <StatusDot />
          <span className="text-[13px] font-semibold text-foreground">Executive Alerts</span>
          {unreadCount > 0 && (
            <span className="rounded-full bg-red-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="text-[11px] text-muted-foreground/60 hover:text-muted-foreground transition-colors"
          >
            Mark all read
          </button>
        )}
      </div>

      {/* Alert groups */}
      <div className="px-4 py-3">
        {unreadCount === 0 && read.length === 0 ? (
          <p className="py-2 text-center text-sm text-green-400">All clear — no active alerts</p>
        ) : (
          <div className="grid grid-cols-1 gap-2 min-[420px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <AnimatePresence>
              {[...criticals, ...warnings, ...infos, ...read].map((alert) => (
                <AlertRow key={alert.id} alert={alert} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  )
}
