import type { AIInsight } from '@/lib/types'
import { mockFinanceKPIs }    from '@/lib/data/mock-finance'
import { mockSalesKPIs }      from '@/lib/data/mock-sales'
import { mockOpsKPIs }        from '@/lib/data/mock-operations'
import { mockBDKPIs }         from '@/lib/data/mock-bd'
import { mockPeopleKPIs }     from '@/lib/data/mock-people'
import { mockClientSummary }  from '@/lib/data/mock-clients'
import { mockForecastSummary } from '@/lib/data/mock-forecasting'

function findKPI(kpis: ReturnType<typeof mockFinanceKPIs.filter>, id: string) {
  return kpis.find((k) => k.id === id)
}

export function generateInsights(): Record<string, AIInsight> {
  const dso        = findKPI(mockFinanceKPIs, 'fin-dso')?.value as number ?? 51
  const overdueAR  = findKPI(mockFinanceKPIs, 'fin-overdue-ar')?.value as number ?? 4_200_000
  const noShowRate = findKPI(mockOpsKPIs, 'ops-no-show-rate')?.value as number ?? 8.2
  const winRate    = findKPI(mockBDKPIs, 'bd-win-rate')?.value as number ?? 41
  const mtdRev     = findKPI(mockSalesKPIs, 'sales-revenue-mtd')?.value as number ?? 48_200_000
  const mtdTarget  = findKPI(mockSalesKPIs, 'sales-revenue-mtd')?.target as number ?? 52_000_000
  const revGap     = mtdTarget - mtdRev

  return {
    bizdev: {
      module:     'bizdev',
      headline:   winRate < 43
        ? `Win rate at ${winRate}% — 3rd consecutive month declining. Proposal stage is the conversion bottleneck.`
        : `Win rate recovering to ${winRate}%. Pipeline health looks solid at R142M.`,
      detail:     'Reviewing deal qualification criteria before Q3 and running win/loss debriefs on the last 5 lost deals could recover 4–6% win rate.',
      confidence: 'medium',
    },
    sales: {
      module:     'sales',
      headline:   `Revenue R${(revGap / 1_000_000).toFixed(1)}M behind MTD target. Vodacom and Shoprite converts by month-end close the gap.`,
      detail:     'James Khumalo\'s book is tracking at 108% — extending his approach to Gauteng reps is the fastest path to closing the shortfall.',
      confidence: 'high',
    },
    finance: {
      module:     'finance',
      headline:   `DSO at ${dso} days. Recovering R${(overdueAR / 1_000_000).toFixed(1)}M in 90d+ AR is the single highest-impact action this month.`,
      detail:     `Cash position is projected to breach the R20M reserve threshold in ${mockForecastSummary.cashRunwayDays} days if collections don't accelerate. EBITDA discipline is working — cost side is on track.`,
      confidence: 'high',
    },
    operations: {
      module:     'operations',
      headline:   noShowRate > 7
        ? `Gauteng no-show rate at ${noShowRate}% — third consecutive week above threshold. Two client campaigns are at delivery risk.`
        : `No-show rate improving to ${noShowRate}%. Maintain current roster management.`,
      detail:     'KZN is 12% under-provisioned for the next 30 days. Western Cape at 96.3% sets the benchmark — ops leads should review their staffing model.',
      confidence: 'high',
    },
    'client-health': {
      module:     'client-health',
      headline:   `${mockClientSummary.atRisk} clients at churn risk (Tiger Brands, Standard Bank). Combined ARR exposure: R50M.`,
      detail:     'Standard Bank NPS dropped to 7.2 after the instore incident in April. A CEO-level touchpoint before end of May is recommended ahead of their August renewal.',
      confidence: 'medium',
    },
    people: {
      module:     'people',
      headline:   'Attrition trending down to 14.2% — positive signal. August capacity shortfall of 340 ambassadors requires pipeline building now.',
      detail:     'North West region is at 67% pool utilisation — lowest nationally. Q3 capacity model shows a breaking point in week 3 of August without immediate sourcing action.',
      confidence: 'medium',
    },
    forwardview: {
      module:     'forwardview',
      headline:   `Base scenario R640M achievable. Cash runway at ${mockForecastSummary.cashRunwayDays} days and Q3 capacity gap are the two time-sensitive risks requiring action this month.`,
      detail:     'Downside scenario (R580M) is triggered by two concurrent risks: win rate below 41% AND Tiger Brands non-renewal. Both are amber and manageable with timely CEO action.',
      confidence: 'medium',
    },
  }
}
