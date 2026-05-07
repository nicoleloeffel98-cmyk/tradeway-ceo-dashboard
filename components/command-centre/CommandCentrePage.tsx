'use client'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { RefreshCw, Activity } from 'lucide-react'
import { MorningBrief }         from './MorningBrief'
import { ExecutiveAlertsModule }  from './ExecutiveAlertsModule'
import { DecisionQueueModule }    from './DecisionQueueModule'
import { BizDevModule }           from './BizDevModule'
import { SalesModule }            from './SalesModule'
import { FinanceModule }          from './FinanceModule'
import { OperationsModule }       from './OperationsModule'
import { ClientHealthModule }     from './ClientHealthModule'
import { PeopleModule }           from './PeopleModule'
import { ForwardViewModule }      from './ForwardViewModule'
import { useAlertsStore }         from '@/lib/stores/useAlertsStore'
import { CEO_NAME }               from '@/lib/constants/ceo'

function GlobalStatus() {
  const unread   = useAlertsStore((s) => s.unreadCount())
  const alerts   = useAlertsStore((s) => s.alerts)
  const hasCrit  = alerts.some((a) => a.severity === 'critical' && !a.isRead)
  const hasWarn  = alerts.some((a) => a.severity === 'warning'  && !a.isRead)

  const label    = hasCrit ? 'CRITICAL' : hasWarn ? 'ATTENTION' : 'NOMINAL'
  const dotColor = hasCrit ? 'bg-red-500'   : hasWarn ? 'bg-amber-500' : 'bg-green-500'
  const textColor = hasCrit ? 'text-red-400' : hasWarn ? 'text-amber-400' : 'text-green-400'

  return (
    <div className="flex items-center gap-2">
      <span className="relative inline-flex size-2">
        {hasCrit && <span className="absolute inline-flex size-full animate-ping rounded-full bg-red-500 opacity-60" />}
        <span className={`relative inline-flex size-full rounded-full ${dotColor}`} />
      </span>
      <span className={`text-[11px] font-bold tracking-widest uppercase ${textColor}`}>{label}</span>
    </div>
  )
}

export function CommandCentrePage() {
  const [asOf, setAsOf] = useState('')
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    const update = () => {
      const now  = new Date()
      const time = now.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit', hour12: false })
      const date = now.toLocaleDateString('en-ZA', { weekday: 'short', day: 'numeric', month: 'short' })
      setAsOf(`${date} · ${time}`)
    }
    update()
    const id = setInterval(update, 60_000)
    return () => clearInterval(id)
  }, [])

  function handleRefresh() {
    setRefreshing(true)
    setTimeout(() => setRefreshing(false), 1200)
  }

  return (
    <div className="space-y-4">
      {/* Command centre header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex items-center justify-between"
      >
        <div>
          <div className="flex items-center gap-3">
            <Activity className="size-4 text-[#e8640c]" />
            <h1 className="text-[15px] font-bold tracking-tight text-foreground">
              Tradeway Command Centre
            </h1>
            <GlobalStatus />
          </div>
          <p className="mt-0.5 text-[11px] text-muted-foreground/60">
            {CEO_NAME} · {asOf}
          </p>
        </div>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
        >
          <RefreshCw className={`size-3 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </motion.div>

      {/* ── 1. Morning Brief ── */}
      <MorningBrief />

      {/* ── 2. Executive Alerts (full width) ── */}
      <ExecutiveAlertsModule />

      {/* ── 3. Decision Queue (full width) ── */}
      <DecisionQueueModule />

      {/* ── 4–9. Module grid ── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <BizDevModule />
        <ClientHealthModule />
        <SalesModule />
        <PeopleModule />
        <FinanceModule />

        {/* Operations — full width, high operational priority */}
        <div className="lg:col-span-2">
          <OperationsModule />
        </div>

        {/* Forward View — full width, merged Strategic + Forecasting */}
        <div className="lg:col-span-2">
          <ForwardViewModule />
        </div>
      </div>
    </div>
  )
}
