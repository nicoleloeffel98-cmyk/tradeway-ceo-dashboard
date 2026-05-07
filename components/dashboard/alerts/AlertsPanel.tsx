'use client'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { AlertCard } from './AlertCard'
import { SectionHeader } from '@/components/dashboard/shared/SectionHeader'
import { useAlertsStore } from '@/lib/stores/useAlertsStore'

interface AlertsPanelProps {
  maxItems?: number
}

export function AlertsPanel({ maxItems = 5 }: AlertsPanelProps) {
  const alerts      = useAlertsStore((s) => s.alerts)
  const unreadCount = useAlertsStore((s) => s.unreadCount())
  const visible     = alerts.slice(0, maxItems)
  const ragStatus   = alerts.some((a) => a.severity === 'critical' && !a.isRead)
    ? 'red'
    : alerts.some((a) => a.severity === 'warning' && !a.isRead)
    ? 'amber'
    : 'green'

  return (
    <div className="flex flex-col gap-3">
      <SectionHeader
        title="Executive Alerts"
        subtitle={`${unreadCount} unread`}
        status={ragStatus}
        lastUpdated="now"
      />
      <div className="space-y-2">
        {visible.map((alert) => (
          <AlertCard key={alert.id} alert={alert} />
        ))}
      </div>
      {alerts.length > maxItems && (
        <Link
          href="/alerts"
          className="flex items-center gap-1 text-xs text-brand-orange hover:underline"
        >
          View all {alerts.length} alerts
          <ArrowRight className="size-3" />
        </Link>
      )}
    </div>
  )
}
