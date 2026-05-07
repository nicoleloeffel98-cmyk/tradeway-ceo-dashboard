'use client'

import { useState, Fragment } from 'react'
import { ControlTowerShell } from '@/components/dashboard/control-towers/shared/ControlTowerShell'
import { KPIGrid } from '@/components/dashboard/shared/KPIGrid'
import { DashboardBarChart } from '@/components/shared/charts/BarChart'
import { mockOpsKPIs, mockRegionalActivations, mockIncidents } from '@/lib/data/mock-operations'
import { mockAIInsights } from '@/lib/data/mock-ai-insights'
import { StatusIndicator } from '@/components/shared/StatusIndicator'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import type { RAGStatus } from '@/lib/types'
import { ChevronDown, ChevronUp } from 'lucide-react'

const SEV_CLASS: Record<string, string> = {
  high:   'bg-red-950 text-red-400 border-red-800',
  medium: 'bg-amber-950 text-amber-400 border-amber-800',
  low:    'bg-slate-800 text-slate-400 border-slate-700',
}

const STATUS_LABEL: Record<string, string> = {
  open:        'Open',
  in_progress: 'In Progress',
  resolved:    'Resolved',
}

const TOTAL_OPEN_INCIDENTS = 23

export default function OperationsPage() {
  const insight    = mockAIInsights.operations
  const [expanded, setExpanded] = useState<string | null>(null)
  const chartData  = mockRegionalActivations.map((r) => ({
    region:      r.region.split(' ')[0],
    activations: r.activations,
    target:      Math.round(r.activations * 1.08),
  }))

  const openCount       = mockIncidents.filter((i) => i.status === 'open').length
  const inProgressCount = mockIncidents.filter((i) => i.status === 'in_progress').length
  const resolvedCount   = mockIncidents.filter((i) => i.status === 'resolved').length

  return (
    <ControlTowerShell
      title="Operations Control Tower"
      subtitle="Activations, ambassadors and regional performance"
      status="red"
      insight={insight}
    >
      <KPIGrid kpis={mockOpsKPIs} columns={4} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Regional activations */}
        <div className="space-y-3 rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground">Activations by Region (MTD)</h3>
          <DashboardBarChart
            data={chartData}
            xKey="region"
            series={[{ key: 'activations', label: 'Activations', color: '#e8640c' }]}
            height={220}
          />
        </div>

        {/* Regional table */}
        <div className="space-y-3 rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground">Regional Performance</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Region</TableHead>
                <TableHead className="text-xs text-right">Acts</TableHead>
                <TableHead className="text-xs text-right">Success</TableHead>
                <TableHead className="text-xs">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockRegionalActivations.map((r) => (
                <TableRow key={r.region}>
                  <TableCell className="text-xs font-medium">{r.region}</TableCell>
                  <TableCell className="text-xs text-right font-mono">{r.activations.toLocaleString()}</TableCell>
                  <TableCell className="text-xs text-right">{r.successRate}%</TableCell>
                  <TableCell>
                    <StatusIndicator status={r.status as RAGStatus} size="sm" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Incidents */}
      <div className="space-y-3 rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Incidents</h3>
          <div className="flex items-center gap-3 text-[11px]">
            <span className="text-red-400 font-medium">{openCount} open</span>
            <span className="text-amber-400">{inProgressCount} in progress</span>
            <span className="text-muted-foreground/60">{resolvedCount} resolved</span>
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground/50">
          Showing {mockIncidents.length} flagged incidents · {TOTAL_OPEN_INCIDENTS} total open this month
        </p>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs">Severity</TableHead>
              <TableHead className="text-xs">Region</TableHead>
              <TableHead className="text-xs">Description</TableHead>
              <TableHead className="text-xs">Status</TableHead>
              <TableHead className="w-6" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockIncidents.map((inc) => (
              <Fragment key={inc.id}>
                <TableRow
                  key={inc.id}
                  className="cursor-pointer hover:bg-muted/20"
                  onClick={() => setExpanded(expanded === inc.id ? null : inc.id)}
                >
                  <TableCell>
                    <Badge className={`text-[10px] border ${SEV_CLASS[inc.severity]}`}>
                      {inc.severity}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{inc.region}</TableCell>
                  <TableCell className="text-xs max-w-xs truncate">{inc.description}</TableCell>
                  <TableCell>
                    <span className={cn(
                      'text-xs',
                      inc.status === 'open' ? 'text-red-400' :
                      inc.status === 'in_progress' ? 'text-amber-400' : 'text-muted-foreground',
                    )}>
                      {STATUS_LABEL[inc.status]}
                    </span>
                  </TableCell>
                  <TableCell>
                    {expanded === inc.id
                      ? <ChevronUp className="size-3 text-muted-foreground/40" />
                      : <ChevronDown className="size-3 text-muted-foreground/40" />
                    }
                  </TableCell>
                </TableRow>
                {expanded === inc.id && (
                  <TableRow className="bg-muted/10">
                    <TableCell colSpan={5} className="pb-3 pt-0">
                      <div className="rounded-md bg-background/40 px-3 py-2 space-y-1">
                        <p className="text-xs text-foreground leading-relaxed">{inc.description}</p>
                        <p className="text-[10px] text-muted-foreground/60">
                          Reported: {new Date(inc.reportedAt).toLocaleDateString('en-ZA', {
                            weekday: 'short', day: 'numeric', month: 'short',
                          })} at {new Date(inc.reportedAt).toLocaleTimeString('en-ZA', {
                            hour: '2-digit', minute: '2-digit', hour12: false,
                          })}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </Fragment>
            ))}
          </TableBody>
        </Table>
      </div>
    </ControlTowerShell>
  )
}
