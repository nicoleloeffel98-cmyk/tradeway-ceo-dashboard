'use client'

import { ControlTowerShell } from '@/components/dashboard/control-towers/shared/ControlTowerShell'
import { KPIGrid } from '@/components/dashboard/shared/KPIGrid'
import { DashboardAreaChart } from '@/components/shared/charts/AreaChart'
import { GaugeChart } from '@/components/shared/charts/GaugeChart'
import { FinanceStatusBar } from '@/components/dashboard/finance/FinanceStatusBar'
import { KPIGridSkeleton, ChartSkeleton, GaugeSkeleton, TableSkeleton } from '@/components/dashboard/shared/DataSkeletons'
import { useFinanceData } from '@/lib/hooks/useFinanceData'
import { mockAIInsights } from '@/lib/data/mock-ai-insights'
import { formatZAR } from '@/lib/utils/format'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'

export default function FinancePage() {
  const insight = mockAIInsights.finance
  const {
    kpis, cashFlow, arBuckets, ebitdaValue, ebitdaTarget,
    isLoading, isError, isFallback, dataSource, fetchedAt, warnings, error, refetch,
  } = useFinanceData()

  const ebitdaStatus = kpis.find((k) => k.id === 'fin-ebitda-margin')?.status ?? 'amber'

  return (
    <ControlTowerShell
      title="Financial Indicators"
      subtitle="Revenue, EBITDA, cash and AR"
      status="amber"
      insight={insight}
      scope="Group-wide"
    >
      <FinanceStatusBar
        dataSource={dataSource}
        fetchedAt={fetchedAt}
        isFallback={isFallback}
        warnings={warnings}
        isLoading={isLoading}
        onRefetch={refetch}
      />

      {isError ? (
        <div className="rounded-xl border border-red-900/40 bg-red-950/20 p-6 text-center">
          <p className="text-sm font-medium text-red-400">Failed to load finance data</p>
          {error && <p className="mt-1 text-xs text-red-400/60">{error}</p>}
          <button
            onClick={refetch}
            className="mt-3 rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted/40"
          >
            Retry
          </button>
        </div>
      ) : isLoading ? (
        <>
          <KPIGridSkeleton columns={4} />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="col-span-2"><ChartSkeleton height={220} /></div>
            <GaugeSkeleton size={180} />
          </div>
          <TableSkeleton rows={4} cols={4} />
        </>
      ) : (
        <>
          <KPIGrid kpis={kpis} columns={4} />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Cash flow */}
            <div className="col-span-2 space-y-3 rounded-xl border border-border bg-card p-5">
              <h3 className="text-sm font-semibold text-foreground">12-Month Cash Flow</h3>
              <DashboardAreaChart
                data={cashFlow}
                xKey="month"
                series={[
                  { key: 'inflow',  label: 'Inflow',  color: '#16a34a' },
                  { key: 'outflow', label: 'Outflow', color: '#dc2626' },
                ]}
                formatter={(v) => formatZAR(v)}
                height={220}
              />
            </div>

            {/* EBITDA gauge */}
            <div className="flex flex-col items-center justify-center space-y-2 rounded-xl border border-border bg-card p-5">
              <h3 className="text-sm font-semibold text-foreground">EBITDA Margin</h3>
              <GaugeChart
                value={ebitdaValue}
                max={25}
                label={`Target: ${ebitdaTarget}%`}
                unit="%"
                status={ebitdaStatus}
                size={180}
              />
              <p className="text-xs text-muted-foreground text-center">
                R{((ebitdaValue / 100) * 48.2).toFixed(2)}M EBITDA on R48.2M revenue
              </p>
            </div>
          </div>

          {/* AR Aging */}
          <div className="space-y-3 rounded-xl border border-border bg-card p-5">
            <h3 className="text-sm font-semibold text-foreground">AR Aging Breakdown</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Bucket</TableHead>
                  <TableHead className="text-xs text-right">Amount</TableHead>
                  <TableHead className="text-xs text-right">Invoices</TableHead>
                  <TableHead className="text-xs text-right">% of AR</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {arBuckets.map((bucket) => (
                  <TableRow key={bucket.bucket} className={bucket.bucket === '90+ days' ? 'bg-red-950/20' : ''}>
                    <TableCell className="text-xs font-medium">{bucket.bucket}</TableCell>
                    <TableCell className={`text-xs text-right font-mono font-medium ${bucket.bucket === '90+ days' ? 'text-red-400' : 'text-foreground'}`}>
                      {formatZAR(bucket.amount)}
                    </TableCell>
                    <TableCell className="text-xs text-right text-muted-foreground">{bucket.count}</TableCell>
                    <TableCell className="text-xs text-right text-muted-foreground">{bucket.pct}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </ControlTowerShell>
  )
}
