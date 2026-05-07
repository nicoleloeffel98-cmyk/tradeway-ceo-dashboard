import { ScorecardModuleRow } from './ScorecardModule'
import { ScorecardTimeline } from './ScorecardTimeline'
import { SectionHeader } from '@/components/dashboard/shared/SectionHeader'
import { AIInsightBanner } from '@/components/dashboard/shared/AIInsightBanner'
import { PeriodBar } from '@/components/dashboard/shared/PeriodBar'
import { mockAIInsights } from '@/lib/data/mock-ai-insights'
import type { ScorecardRow } from '@/lib/types'

const SCORECARD_ROWS: ScorecardRow[] = [
  {
    id: 'operations', label: 'Operations', status: 'red', score: 55, scorePrior: 64, trend: 'down',
    trendNote: 'Worsened 3 weeks running',
    keyMetric: 'No-Show Rate', keyMetricValue: '8.2%', target: '<5.0% target', delta: '+64%', deltaPositive: false,
    href: '/operations',
  },
  {
    id: 'ar', label: 'AR Recovery', status: 'red', score: 42, scorePrior: 51, trend: 'down',
    trendNote: 'Up 18% month-on-month',
    keyMetric: 'Overdue AR', keyMetricValue: 'R4.2M', target: '<R2.0M target', delta: '+110%', deltaPositive: false,
    href: '/finance',
  },
  {
    id: 'bd', label: 'Business Development', status: 'amber', score: 72, scorePrior: 74, trend: 'down',
    trendNote: '3rd consecutive month declining',
    keyMetric: 'Pipeline', keyMetricValue: 'R142M', target: 'R150M target', delta: '−5.3%', deltaPositive: false,
    href: '/bd',
  },
  {
    id: 'bd2', label: 'BD Win Rate', status: 'amber', score: 66, scorePrior: 70, trend: 'down',
    trendNote: 'Declined from 44% in Feb',
    keyMetric: 'Win Rate', keyMetricValue: '41%', target: '45% target', delta: '−8.9%', deltaPositive: false,
    href: '/bd',
  },
  {
    id: 'sales', label: 'Sales', status: 'amber', score: 74, scorePrior: 71, trend: 'up',
    trendNote: 'Gap narrowing vs target',
    keyMetric: 'Revenue MTD', keyMetricValue: 'R48.2M', target: 'R52.0M target', delta: '−7.3%', deltaPositive: false,
    href: '/sales',
  },
  {
    id: 'finance', label: 'Finance', status: 'amber', score: 68, scorePrior: 66, trend: 'up',
    trendNote: 'Margin stable, AR risk elevated',
    keyMetric: 'EBITDA Margin', keyMetricValue: '17.9%', target: '20.0% target', delta: '−10.5%', deltaPositive: false,
    href: '/finance',
  },
  {
    id: 'campaigns', label: 'Campaigns', status: 'amber', score: 76, scorePrior: 73, trend: 'up',
    trendNote: 'ROI above target',
    keyMetric: 'Avg ROI', keyMetricValue: '3.4x', target: '3.0x target', delta: '+13%', deltaPositive: true,
    href: '/campaigns',
  },
  {
    id: 'strategic', label: 'Strategic', status: 'amber', score: 70, scorePrior: 70, trend: 'flat',
    trendNote: 'Base scenario unchanged',
    keyMetric: 'Base Scenario', keyMetricValue: 'R640M', target: 'R680M target', delta: '−5.9%', deltaPositive: false,
    href: '/strategic',
  },
  {
    id: 'people', label: 'People & Capacity', status: 'green', score: 84, scorePrior: 82, trend: 'up',
    trendNote: 'Attrition improving steadily',
    keyMetric: 'Attrition', keyMetricValue: '14.2%', target: '<15% target', delta: '−5%', deltaPositive: true,
    href: '/people',
  },
]

const red   = SCORECARD_ROWS.filter((r) => r.status === 'red').length
const amber = SCORECARD_ROWS.filter((r) => r.status === 'amber').length
const green = SCORECARD_ROWS.filter((r) => r.status === 'green').length

function buildHeadline(): string {
  const redLabels = SCORECARD_ROWS.filter((r) => r.status === 'red').map((r) => r.label)
  const total     = SCORECARD_ROWS.length

  if (red > 0) {
    const names = redLabels.join(' and ')
    return `${red} of ${total} modules are red and ${amber} are amber. ${names} ${red === 1 ? 'requires' : 'require'} immediate CEO attention this week.`
  }
  if (amber > 0) {
    return `No red modules — ${amber} of ${total} are amber. Monitor performance closely this week.`
  }
  return `All ${total} modules are performing at or above target.`
}

export function ExecutiveScorecard() {
  const insight  = mockAIInsights.scorecard
  const headline = buildHeadline()

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Executive Scorecard"
        subtitle={`${red} Red · ${amber} Amber · ${green} Green`}
        status={red > 0 ? 'red' : amber > 0 ? 'amber' : 'green'}
      />

      <ScorecardTimeline />

      <AIInsightBanner
        headline={headline}
        detail={insight.detail}
        source={insight.source}
        confidence={insight.confidence}
      />

      <PeriodBar scope="All modules" />

      {/* Summary counts with trajectory */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Red',   count: red,   prior: 2, color: '#dc2626' },
          { label: 'Amber', count: amber, prior: 7, color: '#d97706' },
          { label: 'Green', count: green, prior: 1, color: '#16a34a' },
        ].map((item) => (
          <div key={item.label} className="rounded-xl border border-border bg-card p-4 text-center">
            <p className="text-3xl font-bold tabular-nums" style={{ color: item.color }}>{item.count}</p>
            <p className="text-xs text-muted-foreground mt-1">{item.label}</p>
            <p className="text-[10px] text-muted-foreground/50 mt-1">
              {item.count === item.prior
                ? 'unchanged'
                : item.count > item.prior
                ? `↑ from ${item.prior} last month`
                : `↓ from ${item.prior} last month`}
            </p>
          </div>
        ))}
      </div>

      {/* Module rows */}
      <div className="space-y-2">
        {SCORECARD_ROWS.map((row) => (
          <ScorecardModuleRow key={row.id} row={row} />
        ))}
      </div>
    </div>
  )
}
