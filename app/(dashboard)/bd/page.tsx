import { ControlTowerShell } from '@/components/dashboard/control-towers/shared/ControlTowerShell'
import { KPIGrid } from '@/components/dashboard/shared/KPIGrid'
import { FunnelChart } from '@/components/shared/charts/FunnelChart'
import { mockBDKPIs, mockBDFunnel, mockOpportunities } from '@/lib/data/mock-bd'
import { mockAIInsights } from '@/lib/data/mock-ai-insights'
import { formatZAR } from '@/lib/utils/format'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

const STAGE_LABELS: Record<string, string> = {
  prospect: 'Prospect', qualified: 'Qualified', proposal: 'Proposal', negotiation: 'Negotiation',
}
const STAGE_BADGE: Record<string, string> = {
  prospect:    'bg-blue-950 text-blue-400 border-blue-800',
  qualified:   'bg-violet-950 text-violet-400 border-violet-800',
  proposal:    'bg-amber-950 text-amber-400 border-amber-800',
  negotiation: 'bg-green-950 text-green-400 border-green-800',
}

export default function BDPage() {
  const insight = mockAIInsights.bd
  return (
    <ControlTowerShell
      title="Business Development"
      subtitle="Pipeline, opportunities and win rate"
      status="amber"
      insight={insight}
      scope="Active pipeline"
    >
      {/* KPIs */}
      <KPIGrid kpis={mockBDKPIs} columns={4} />

      {/* Funnel + Opportunities */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-3 rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground">Pipeline Funnel</h3>
          <FunnelChart data={mockBDFunnel} />
        </div>

        <div className="space-y-3 rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground">Top Opportunities</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Client</TableHead>
                <TableHead className="text-xs">Stage</TableHead>
                <TableHead className="text-xs text-right">Value</TableHead>
                <TableHead className="text-xs text-right">Prob.</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockOpportunities.slice(0, 8).map((opp) => (
                <TableRow key={opp.id}>
                  <TableCell className="text-xs font-medium">{opp.client}</TableCell>
                  <TableCell>
                    <Badge className={`text-[10px] border ${STAGE_BADGE[opp.stage] ?? ''}`}>
                      {STAGE_LABELS[opp.stage] ?? opp.stage}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-right font-mono">{formatZAR(opp.value)}</TableCell>
                  <TableCell className="text-xs text-right text-muted-foreground">{opp.probability}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </ControlTowerShell>
  )
}
