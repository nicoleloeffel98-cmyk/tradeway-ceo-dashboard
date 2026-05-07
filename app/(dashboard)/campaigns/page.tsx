'use client'

import { ControlTowerShell } from '@/components/dashboard/control-towers/shared/ControlTowerShell'
import { KPIGrid } from '@/components/dashboard/shared/KPIGrid'
import { DashboardBarChart } from '@/components/shared/charts/BarChart'
import { GaugeChart } from '@/components/shared/charts/GaugeChart'
import { mockCampaignKPIs, mockCampaigns, mockROIPoints } from '@/lib/data/mock-campaigns'
import { mockAIInsights } from '@/lib/data/mock-ai-insights'
import { formatZAR } from '@/lib/utils/format'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'

const STATUS_CLASS: Record<string, string> = {
  active:    'bg-green-950 text-green-400 border-green-800',
  planning:  'bg-blue-950 text-blue-400 border-blue-800',
  completed: 'bg-slate-800 text-slate-400 border-slate-700',
  on_hold:   'bg-amber-950 text-amber-400 border-amber-800',
}

export default function CampaignsPage() {
  const insight = mockAIInsights.campaigns
  return (
    <ControlTowerShell
      title="Campaign Performance & ROI"
      subtitle="ROI intelligence, client NPS and activation reach"
      status="amber"
      insight={insight}
      scope="Active campaigns"
    >
      <KPIGrid kpis={mockCampaignKPIs} columns={4} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* ROI bar chart */}
        <div className="col-span-2 space-y-3 rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground">ROI by Campaign</h3>
          <DashboardBarChart
            data={mockROIPoints}
            xKey="campaign"
            series={[{ key: 'roi', label: 'ROI (x)', color: '#e8640c' }]}
            height={220}
            formatter={(v) => `${v}x`}
          />
        </div>

        {/* NPS gauge */}
        <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-3">Client NPS</h3>
          <GaugeChart value={7.8} max={10} label="Target: 8.0+" unit="" status="amber" size={180} />
          <p className="text-xs text-muted-foreground text-center mt-2">Average across 6 active campaigns</p>
        </div>
      </div>

      {/* Campaign table */}
      <div className="space-y-3 rounded-xl border border-border bg-card p-5">
        <h3 className="text-sm font-semibold text-foreground">Active & Recent Campaigns</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs">Campaign</TableHead>
              <TableHead className="text-xs">Client</TableHead>
              <TableHead className="text-xs">Status</TableHead>
              <TableHead className="text-xs text-right">Budget</TableHead>
              <TableHead className="text-xs text-right">ROI</TableHead>
              <TableHead className="text-xs text-right">NPS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockCampaigns.filter((c) => c.status !== 'completed').map((c) => (
              <TableRow key={c.id}>
                <TableCell className="text-xs font-medium max-w-40 truncate">{c.name}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{c.client}</TableCell>
                <TableCell>
                  <Badge className={`text-[10px] border ${STATUS_CLASS[c.status]}`}>{c.status}</Badge>
                </TableCell>
                <TableCell className="text-xs text-right font-mono">{formatZAR(c.budget)}</TableCell>
                <TableCell className={`text-xs text-right font-semibold ${c.roi >= 3 ? 'text-green-400' : c.roi > 0 ? 'text-amber-400' : 'text-muted-foreground'}`}>
                  {c.roi > 0 ? `${c.roi}x` : '—'}
                </TableCell>
                <TableCell className={`text-xs text-right ${c.clientNPS >= 8 ? 'text-green-400' : c.clientNPS > 0 ? 'text-amber-400' : 'text-muted-foreground'}`}>
                  {c.clientNPS > 0 ? c.clientNPS : '—'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </ControlTowerShell>
  )
}
