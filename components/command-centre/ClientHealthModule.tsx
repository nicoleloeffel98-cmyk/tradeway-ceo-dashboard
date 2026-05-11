'use client'
import { SectionShell } from './SectionShell'
import { KPICard } from '@/components/dashboard/shared/KPICard'
import { mockClients, mockClientSummary } from '@/lib/data/mock-clients'
import { mockExecutiveKPIs } from '@/lib/data/mock-kpis'
import { formatZAR } from '@/lib/utils/format'
import { cn } from '@/lib/utils'
import { generateInsights } from '@/lib/insights/engine'
import { useImportStore } from '@/lib/stores/useImportStore'
import type { RAGStatus } from '@/lib/types'

const insights = generateInsights()

const CHURN_LABEL: Record<RAGStatus, string> = {
  green:   'Low',
  amber:   'Medium',
  red:     'High',
  neutral: '-',
}

const CHURN_STYLE: Record<RAGStatus, string> = {
  green:   'bg-green-950/50 text-green-400 border-green-900/50',
  amber:   'bg-amber-950/40 text-amber-400 border-amber-800/50',
  red:     'bg-red-950/50 text-red-400 border-red-900/50',
  neutral: 'bg-slate-800/50 text-slate-400 border-slate-700/50',
}

const TREND_ICON: Record<string, string> = {
  improving: '↑',
  stable:    '→',
  declining: '↓',
}

const TREND_COLOR: Record<string, string> = {
  improving: 'text-green-400',
  stable:    'text-slate-400',
  declining: 'text-red-400',
}

export function ClientHealthModule() {
  const importedClients = useImportStore((s) => s.activeImport?.data.clients)
  const npsKPI  = mockExecutiveKPIs.find((k) => k.id === 'client-nps')
  const insight = insights['client-health']

  // Build display clients from imported data or mock
  const displayClients = importedClients
    ? importedClients.map((c, i) => ({
        id:          `imp-${i}`,
        name:        c.name,
        sector:      'Imported',
        arr:         c.arr,
        nps:         c.nps,
        churnRisk:   c.churnRisk,
        renewalDate: new Date(Date.now() + c.daysToRenewal * 86_400_000).toISOString().slice(0, 10),
        daysToRenewal: c.daysToRenewal,
        openIssues:  0,
        lastContact: new Date().toISOString(),
        trend:       c.trend,
      }))
    : mockClients

  const sortedClients = [...displayClients].sort((a, b) => {
    const order: Record<RAGStatus, number> = { red: 0, amber: 1, neutral: 2, green: 3 }
    return order[a.churnRisk] - order[b.churnRisk]
  })

  return (
    <SectionShell
      title="Client Health"
      status="neutral"
      subtitle="NPS · churn risk · renewals"
      insight={insight.headline}
      insightAction="CEO touchpoint with Standard Bank before May 31"
      href="/campaigns"
      delay={0.1}
    >
      {/* Summary KPIs */}
      <div className="grid grid-cols-2 gap-2 min-[400px]:grid-cols-3">
        <div className="rounded-lg border border-border bg-card/60 p-3">
          <p className="text-[10px] text-muted-foreground">Avg NPS</p>
          <p className="mt-1 text-2xl font-bold font-mono text-foreground">{mockClientSummary.avgNps.toFixed(1)}</p>
          <p className="text-[10px] text-amber-400 mt-0.5">↓ 0.1 vs last month</p>
        </div>
        <div className="rounded-lg border border-border bg-card/60 p-3">
          <p className="text-[10px] text-muted-foreground">At Risk</p>
          <p className="mt-1 text-2xl font-bold font-mono text-amber-400">{mockClientSummary.atRisk}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">clients</p>
        </div>
        <div className="rounded-lg border border-border bg-card/60 p-3">
          <p className="text-[10px] text-muted-foreground">Renewing &lt;90d</p>
          <p className="mt-1 text-2xl font-bold font-mono text-amber-400">{mockClientSummary.renewingIn90d}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">contract</p>
        </div>
      </div>

      {/* Client list */}
      <div className="space-y-1">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">Client roster</p>
        {sortedClients.map((client) => (
          <div
            key={client.id}
            className="flex items-center justify-between py-1.5 border-b border-border/30 last:border-0"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className={cn('shrink-0 rounded border px-1.5 py-0.5 text-[9px] font-bold', CHURN_STYLE[client.churnRisk])}>
                {CHURN_LABEL[client.churnRisk]}
              </span>
              <div className="min-w-0">
                <p className="text-[12px] font-medium text-foreground truncate">{client.name}</p>
                <p className="text-[10px] text-muted-foreground">NPS {client.nps} · {client.daysToRenewal}d to renewal</p>
              </div>
            </div>
            <div className="text-right shrink-0 ml-2">
              <p className="font-mono text-[12px] font-semibold text-foreground">{formatZAR(client.arr)}</p>
              <span className={cn('text-[11px] font-medium', TREND_COLOR[client.trend])}>
                {TREND_ICON[client.trend]} {client.trend}
              </span>
            </div>
          </div>
        ))}
      </div>
    </SectionShell>
  )
}
