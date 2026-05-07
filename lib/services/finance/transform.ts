import type { NormalisedFinanceData } from './types'
import type { KPI, CashFlowPoint, ARAgingBucket, RevenueVsBudgetPoint } from '@/lib/types'
import { computeRAG } from '@/lib/utils/rag'

const sp = (values: number[]) => values.map((v, i) => ({ w: `W${i + 1}`, v }))

export interface TransformedFinanceData {
  kpis:            KPI[]
  cashFlow:        CashFlowPoint[]
  arBuckets:       ARAgingBucket[]
  revenueVsBudget: RevenueVsBudgetPoint[]
  ebitdaValue:     number
  ebitdaTarget:    number
}

export function transformFinanceData(d: NormalisedFinanceData): TransformedFinanceData {
  const kpis: KPI[] = [
    {
      id:            'fin-revenue-ytd',
      module:        'finance',
      label:         'Revenue YTD',
      value:         d.revenueYTD,
      unit:          'ZAR',
      target:        d.revenueTarget,
      trend:         { direction: 'up', percentage: 7.8, period: 'vs LY' },
      status:        computeRAG(d.revenueYTD, d.revenueTarget),
      sparklineData: sp([d.revenueYTD * 0.23, d.revenueYTD * 0.49, d.revenueYTD * 0.74, d.revenueYTD * 0.98, d.revenueYTD]),
    },
    {
      id:            'fin-ebitda-margin',
      module:        'finance',
      label:         'EBITDA Margin',
      value:         d.ebitdaMargin,
      unit:          'percentage',
      target:        d.ebitdaTarget,
      trend:         { direction: 'up', percentage: 8.9, period: 'vs LY' },
      status:        computeRAG(d.ebitdaMargin, d.ebitdaTarget),
      sparklineData: sp([18.5, 17.8, 18.2, 17.5, d.ebitdaMargin]),
    },
    {
      id:            'fin-gross-margin',
      module:        'finance',
      label:         'Gross Margin',
      value:         d.grossMargin,
      unit:          'percentage',
      target:        d.grossMarginTarget,
      trend:         { direction: 'down', percentage: 1.1, period: 'vs last month' },
      status:        computeRAG(d.grossMargin, d.grossMarginTarget),
      sparklineData: sp([37.8, 37.2, 37.5, 36.9, d.grossMargin]),
    },
    {
      id:            'fin-cash',
      module:        'finance',
      label:         'Cash on Hand',
      value:         d.cashOnHand,
      unit:          'ZAR',
      target:        d.cashTarget,
      trend:         { direction: 'down', percentage: 3.2, period: 'vs last month' },
      status:        computeRAG(d.cashOnHand, d.cashTarget),
      sparklineData: sp([24_200_000, 23_800_000, 24_500_000, 23_100_000, d.cashOnHand]),
    },
    {
      id:            'fin-dso',
      module:        'finance',
      label:         'Days Sales Outstanding',
      value:         d.dso,
      unit:          'days',
      target:        d.dsoTarget,
      trend:         { direction: 'up', percentage: 13.3, period: 'vs last month' },
      status:        computeRAG(d.dso, d.dsoTarget, true),
      sublabel:      `${d.dso > d.dsoTarget ? 'Above' : 'Below'} ${d.dsoTarget}-day target`,
      inverted:      true,
      sparklineData: sp([46, 47, 48, 49, 50, d.dso]),
    },
    {
      id:            'fin-overdue-ar',
      module:        'finance',
      label:         'Overdue AR (90d+)',
      value:         d.overdueAR,
      unit:          'ZAR',
      target:        d.overdueARTarget,
      trend:         { direction: 'up', percentage: 18, period: 'vs last month' },
      status:        computeRAG(d.overdueAR, d.overdueARTarget, true),
      sublabel:      d.overdueAR > d.overdueARTarget ? 'Exceeds threshold' : 'Within threshold',
      inverted:      true,
      sparklineData: sp([2_800_000, 3_100_000, 3_500_000, 3_800_000, d.overdueAR]),
    },
    {
      id:            'fin-budget-variance',
      module:        'finance',
      label:         'Budget Variance',
      value:         d.budgetVariance,
      unit:          'percentage',
      target:        0,
      trend:         { direction: 'down', percentage: Math.abs(d.budgetVariance), period: 'MTD' },
      status:        computeRAG(d.budgetVariance, 0, true),
      sublabel:      `${d.budgetVariance < 0 ? '-' : '+'}R${Math.abs(d.budgetVariance * d.revenueYTD / 100 / 1_000_000).toFixed(1)}M vs budget`,
      sparklineData: sp([-2.1, -1.8, -3.2, -5.2, d.budgetVariance]),
    },
    {
      id:            'fin-opex-ratio',
      module:        'finance',
      label:         'OpEx Ratio',
      value:         d.opexRatio,
      unit:          'percentage',
      target:        d.opexRatioTarget,
      trend:         { direction: 'down', percentage: 0.8, period: 'vs last month' },
      status:        computeRAG(d.opexRatio, d.opexRatioTarget, true),
      sparklineData: sp([22.1, 21.9, 21.8, 21.6, d.opexRatio]),
    },
  ]

  return {
    kpis,
    cashFlow:        d.cashFlow,
    arBuckets:       d.arBuckets,
    revenueVsBudget: d.revenueVsBudget,
    ebitdaValue:     d.ebitdaMargin,
    ebitdaTarget:    d.ebitdaTarget,
  }
}
