'use client'
import { useState } from 'react'
import { AlertCard } from '@/components/dashboard/alerts/AlertCard'
import { SectionHeader } from '@/components/dashboard/shared/SectionHeader'
import { Button } from '@/components/ui/button'
import { useAlertsStore } from '@/lib/stores/useAlertsStore'
import type { AlertSeverity } from '@/lib/types'

const FILTERS: { label: string; value: AlertSeverity | 'all' }[] = [
  { label: 'All',      value: 'all' },
  { label: 'Critical', value: 'critical' },
  { label: 'Warning',  value: 'warning' },
  { label: 'Info',     value: 'info' },
]

export default function AlertsPage() {
  const alerts       = useAlertsStore((s) => s.alerts)
  const markAllRead  = useAlertsStore((s) => s.markAllRead)
  const unreadCount  = useAlertsStore((s) => s.unreadCount())
  const [filter, setFilter] = useState<AlertSeverity | 'all'>('all')

  const visible = filter === 'all' ? alerts : alerts.filter((a) => a.severity === filter)

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <SectionHeader
          title="Executive Alerts"
          subtitle={`${unreadCount} unread · ${alerts.length} total`}
          status={unreadCount > 0 ? (alerts.some((a) => a.severity === 'critical' && !a.isRead) ? 'red' : 'amber') : 'green'}
        />
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllRead} className="text-xs">
            Mark all read
          </Button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 rounded-lg bg-muted/30 p-1 w-fit">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
              filter === f.value ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {f.label}
            {f.value !== 'all' && (
              <span className="ml-1.5 text-muted-foreground">
                ({alerts.filter((a) => a.severity === f.value).length})
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {visible.map((alert) => (
          <AlertCard key={alert.id} alert={alert} />
        ))}
      </div>
    </div>
  )
}
