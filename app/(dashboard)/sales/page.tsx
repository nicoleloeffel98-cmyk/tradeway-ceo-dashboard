'use client'

import { ControlTowerShell } from '@/components/dashboard/control-towers/shared/ControlTowerShell'
import { KPIGrid } from '@/components/dashboard/shared/KPIGrid'
import { DashboardLineChart } from '@/components/shared/charts/LineChart'
import { mockSalesKPIs, mockSalesForecast, mockSalesReps } from '@/lib/data/mock-sales'
import { mockAIInsights } from '@/lib/data/mock-ai-insights'
import { formatZAR, formatPct } from '@/lib/utils/format'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Progress } from '@/components/ui/progress'

export default function SalesPage() {
  const insight = mockAIInsights.sales
  return (
    <ControlTowerShell
      title="Sales Control Tower"
      subtitle="Revenue, forecast and team performance"
      status="amber"
      insight={insight}
      scope="All accounts"
    >
      <KPIGrid kpis={mockSalesKPIs} columns={4} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Forecast chart */}
        <div className="space-y-3 rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground">Revenue Forecast vs Target</h3>
          <DashboardLineChart
            data={mockSalesForecast}
            xKey="month"
            series={[
              { key: 'actual',   label: 'Actual',   color: '#e8640c' },
              { key: 'forecast', label: 'Forecast',  color: '#3b82f6', dashed: true },
              { key: 'target',   label: 'Target',    color: '#64748b', dashed: true },
            ]}
            formatter={(v) => formatZAR(v)}
            height={240}
          />
        </div>

        {/* Rep performance table */}
        <div className="space-y-3 rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground">Sales Rep Attainment</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Name</TableHead>
                <TableHead className="text-xs">Region</TableHead>
                <TableHead className="text-xs text-right">Attainment</TableHead>
                <TableHead className="text-xs w-24">Progress</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockSalesReps.map((rep) => (
                <TableRow key={rep.id}>
                  <TableCell className="text-xs font-medium">{rep.name}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{rep.region}</TableCell>
                  <TableCell className={`text-xs text-right font-semibold ${rep.attainmentPct >= 100 ? 'text-green-400' : rep.attainmentPct >= 90 ? 'text-amber-400' : 'text-red-400'}`}>
                    {rep.attainmentPct}%
                  </TableCell>
                  <TableCell>
                    <Progress value={Math.min(rep.attainmentPct, 100)} className="h-1.5" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </ControlTowerShell>
  )
}
