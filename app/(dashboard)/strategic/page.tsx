'use client'

import { ControlTowerShell } from '@/components/dashboard/control-towers/shared/ControlTowerShell'
import { DashboardBarChart } from '@/components/shared/charts/BarChart'
import { mockScenarios, mockScenarioQuarterly, mockStrategicRisks, mockMarketSignals } from '@/lib/data/mock-strategic'
import { mockAIInsights } from '@/lib/data/mock-ai-insights'
import { formatZAR } from '@/lib/utils/format'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'

const LIKELIHOOD_CLASS: Record<string, string> = {
  high:   'bg-red-950 text-red-400 border-red-800',
  medium: 'bg-amber-950 text-amber-400 border-amber-800',
  low:    'bg-slate-800 text-slate-400 border-slate-700',
}
const MITIGATION_CLASS: Record<string, string> = {
  none:        'bg-red-950 text-red-400 border-red-800',
  in_progress: 'bg-amber-950 text-amber-400 border-amber-800',
  mitigated:   'bg-green-950 text-green-400 border-green-800',
}

export default function StrategicPage() {
  const insight = mockAIInsights.strategic
  return (
    <ControlTowerShell
      title="Strategic Intelligence"
      subtitle="Revenue scenarios, risks and market signals"
      status="amber"
      insight={insight}
      scope="Group-wide forecast"
    >
      {/* Scenario summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {mockScenarios.map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-border bg-card p-5"
            style={{ borderTopColor: s.color, borderTopWidth: 3 }}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{s.label} Scenario</p>
                <p className="mt-1 text-2xl font-bold text-foreground" style={{ color: s.color }}>
                  {formatZAR(s.fullYear)}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {Math.round((s.fullYear / 680_000_000) * 100)}% of annual target
                </p>
              </div>
              <span className="text-xs font-medium text-muted-foreground">{s.probability}%</span>
            </div>
          </div>
        ))}
      </div>

      {/* Quarterly scenario chart */}
      <div className="space-y-3 rounded-xl border border-border bg-card p-5">
        <h3 className="text-sm font-semibold text-foreground">Revenue Scenarios by Quarter (R millions)</h3>
        <DashboardBarChart
          data={mockScenarioQuarterly}
          xKey="quarter"
          series={[
            { key: 'upside',   label: 'Upside',   color: '#16a34a' },
            { key: 'base',     label: 'Base',     color: '#e8640c' },
            { key: 'downside', label: 'Downside', color: '#dc2626' },
          ]}
          formatter={(v) => `R${v}M`}
          height={220}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Strategic risks */}
        <div className="space-y-3 rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground">Strategic Risk Register</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Risk</TableHead>
                <TableHead className="text-xs">Likelihood</TableHead>
                <TableHead className="text-xs">Mitigation</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockStrategicRisks.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="text-xs font-medium leading-snug">{r.title}</TableCell>
                  <TableCell>
                    <Badge className={`text-[10px] border ${LIKELIHOOD_CLASS[r.likelihood]}`}>{r.likelihood}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={`text-[10px] border ${MITIGATION_CLASS[r.mitigationStatus]}`}>
                      {r.mitigationStatus.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Market signals */}
        <div className="space-y-3 rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground">Market Signals</h3>
          <div className="space-y-3">
            {mockMarketSignals.map((s) => (
              <div key={s.id} className="rounded-lg border border-border p-3 space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-medium text-foreground leading-snug">{s.signal}</p>
                  <Badge className={`shrink-0 text-[10px] border ${LIKELIHOOD_CLASS[s.relevance]}`}>{s.relevance}</Badge>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{s.implication}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ControlTowerShell>
  )
}
