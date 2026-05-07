'use client'

import { ControlTowerShell } from '@/components/dashboard/control-towers/shared/ControlTowerShell'
import { KPIGrid } from '@/components/dashboard/shared/KPIGrid'
import { DashboardBarChart } from '@/components/shared/charts/BarChart'
import { DashboardLineChart } from '@/components/shared/charts/LineChart'
import {
  mockPeopleKPIs,
  mockCapacity,
  mockAttrition,
  mockDeptHeadcount,
  mockOpenVacancies,
  mockAmbassadorRegions,
} from '@/lib/data/mock-people'
import { mockAIInsights } from '@/lib/data/mock-ai-insights'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'

const PRIORITY_CLASS: Record<string, string> = {
  critical: 'bg-red-950 text-red-400 border-red-800',
  high:     'bg-amber-950 text-amber-400 border-amber-800',
  normal:   'bg-slate-800 text-slate-400 border-slate-700',
}

const STATUS_DOT: Record<string, string> = {
  green: 'bg-green-500',
  amber: 'bg-amber-500',
  red:   'bg-red-500',
}

export default function PeoplePage() {
  const insight    = mockAIInsights.people
  const totalVacs  = mockOpenVacancies.length
  const critVacs   = mockOpenVacancies.filter((v) => v.priority === 'critical').length

  return (
    <ControlTowerShell
      title="People & Capacity"
      subtitle="Headcount, ambassador pool and capacity planning"
      status="green"
      insight={insight}
    >
      <KPIGrid kpis={mockPeopleKPIs} columns={3} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Capacity 8-week chart */}
        <div className="space-y-3 rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground">Ambassador Capacity — 8 Weeks</h3>
          <p className="text-xs text-muted-foreground">Required vs available (gap alert: W3–W4 May)</p>
          <DashboardBarChart
            data={mockCapacity}
            xKey="week"
            series={[
              { key: 'available', label: 'Available', color: '#16a34a' },
              { key: 'required',  label: 'Required',  color: '#e8640c' },
            ]}
            height={200}
          />
        </div>

        {/* Attrition trend */}
        <div className="space-y-3 rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground">Attrition Rate — 12 Months</h3>
          <p className="text-xs text-muted-foreground">Trending down toward 15% target</p>
          <DashboardLineChart
            data={mockAttrition}
            xKey="month"
            series={[{ key: 'rate', label: 'Attrition %', color: '#e8640c' }]}
            referenceLines={[{ y: 15, label: 'Target 15%', color: '#64748b' }]}
            formatter={(v) => `${v}%`}
            height={200}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Department headcount */}
        <div className="space-y-3 rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground">Headcount by Department</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Department</TableHead>
                <TableHead className="text-xs text-right">Actual</TableHead>
                <TableHead className="text-xs text-right">Target</TableHead>
                <TableHead className="text-xs text-right">Vacancies</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockDeptHeadcount.map((d) => (
                <TableRow key={d.dept}>
                  <TableCell className="text-xs font-medium">
                    <div className="flex items-center gap-2">
                      <span className={`size-1.5 rounded-full ${STATUS_DOT[d.status]}`} />
                      {d.dept}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-right tabular-nums font-medium">{d.headcount}</TableCell>
                  <TableCell className="text-xs text-right tabular-nums text-muted-foreground">{d.target}</TableCell>
                  <TableCell className={`text-xs text-right tabular-nums font-semibold ${d.vacancies > 0 ? 'text-amber-400' : 'text-muted-foreground'}`}>
                    {d.vacancies > 0 ? `+${d.vacancies}` : '—'}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="border-t border-border/60">
                <TableCell className="text-xs font-bold text-foreground">Total</TableCell>
                <TableCell className="text-xs text-right tabular-nums font-bold">
                  {mockDeptHeadcount.reduce((s, d) => s + d.headcount, 0)}
                </TableCell>
                <TableCell className="text-xs text-right tabular-nums text-muted-foreground">
                  {mockDeptHeadcount.reduce((s, d) => s + d.target, 0)}
                </TableCell>
                <TableCell className="text-xs text-right tabular-nums font-bold text-amber-400">
                  {mockDeptHeadcount.reduce((s, d) => s + d.vacancies, 0)} open
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        {/* Open vacancies */}
        <div className="space-y-3 rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Open Vacancies</h3>
            <span className="text-xs text-muted-foreground">
              {totalVacs} open · <span className="text-red-400 font-medium">{critVacs} critical</span>
            </span>
          </div>
          <div className="space-y-2">
            {mockOpenVacancies.map((v) => (
              <div key={v.id} className="flex items-start justify-between gap-3 rounded-lg border border-border bg-background/40 px-3 py-2.5">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-foreground leading-snug truncate">{v.role}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{v.dept} · {v.daysOpen}d open</p>
                </div>
                <Badge className={`shrink-0 text-[10px] border ${PRIORITY_CLASS[v.priority]}`}>
                  {v.priority}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Ambassador pool health */}
      <div className="space-y-3 rounded-xl border border-border bg-card p-5">
        <h3 className="text-sm font-semibold text-foreground">Ambassador Pool — Regional Health</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs">Region</TableHead>
              <TableHead className="text-xs text-right">Active</TableHead>
              <TableHead className="text-xs text-right">Pool</TableHead>
              <TableHead className="text-xs text-right">Utilisation</TableHead>
              <TableHead className="text-xs w-32">Health</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockAmbassadorRegions.map((r) => (
              <TableRow key={r.region}>
                <TableCell className="text-xs font-medium">
                  <div className="flex items-center gap-2">
                    <span className={`size-1.5 rounded-full ${STATUS_DOT[r.status]}`} />
                    {r.region}
                  </div>
                </TableCell>
                <TableCell className="text-xs text-right tabular-nums font-medium">
                  {r.active.toLocaleString()}
                </TableCell>
                <TableCell className="text-xs text-right tabular-nums text-muted-foreground">
                  {r.pool.toLocaleString()}
                </TableCell>
                <TableCell className={`text-xs text-right tabular-nums font-semibold ${r.pct >= 85 ? 'text-green-400' : r.pct >= 75 ? 'text-amber-400' : 'text-red-400'}`}>
                  {r.pct}%
                </TableCell>
                <TableCell>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/40">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${r.pct}%`,
                        backgroundColor: r.pct >= 85 ? '#16a34a' : r.pct >= 75 ? '#d97706' : '#dc2626',
                      }}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </ControlTowerShell>
  )
}
