import type { Opportunity, BDFunnelStage, KPI } from '@/lib/types'

const sp = (values: number[]) => values.map((v, i) => ({ w: `W${i + 1}`, v }))

export const mockOpportunities: Opportunity[] = [
  { id: 'opp-01', client: 'Pick n Pay',       sector: 'Retail',    value: 8_500_000, stage: 'proposal',     probability: 60, expectedClose: '2026-06-15', owner: 'Sarah M.', daysInStage: 8  },
  { id: 'opp-02', client: 'Shoprite',          sector: 'Retail',    value: 12_000_000,stage: 'negotiation',  probability: 75, expectedClose: '2026-05-30', owner: 'James K.', daysInStage: 14 },
  { id: 'opp-03', client: 'Coca-Cola SA',      sector: 'FMCG',     value: 6_200_000, stage: 'qualified',    probability: 40, expectedClose: '2026-07-01', owner: 'Thabo N.', daysInStage: 21 },
  { id: 'opp-04', client: 'Tiger Brands',      sector: 'FMCG',     value: 4_800_000, stage: 'proposal',     probability: 55, expectedClose: '2026-06-30', owner: 'Sarah M.', daysInStage: 5  },
  { id: 'opp-05', client: 'Vodacom',           sector: 'Telco',    value: 9_400_000, stage: 'negotiation',  probability: 80, expectedClose: '2026-05-25', owner: 'James K.', daysInStage: 22 },
  { id: 'opp-06', client: 'Standard Bank',     sector: 'Financial',value: 5_600_000, stage: 'qualified',    probability: 35, expectedClose: '2026-07-15', owner: 'Priya S.', daysInStage: 12 },
  { id: 'opp-07', client: 'Woolworths',        sector: 'Retail',   value: 7_200_000, stage: 'proposal',     probability: 65, expectedClose: '2026-06-20', owner: 'Thabo N.', daysInStage: 3  },
  { id: 'opp-08', client: 'MTN SA',            sector: 'Telco',    value: 11_000_000,stage: 'prospect',     probability: 20, expectedClose: '2026-08-01', owner: 'Priya S.', daysInStage: 7  },
  { id: 'opp-09', client: 'Nestlé SA',         sector: 'FMCG',     value: 3_900_000, stage: 'prospect',     probability: 25, expectedClose: '2026-07-30', owner: 'Sarah M.', daysInStage: 4  },
  { id: 'opp-10', client: 'Absa Bank',         sector: 'Financial',value: 6_800_000, stage: 'qualified',    probability: 45, expectedClose: '2026-07-01', owner: 'James K.', daysInStage: 18 },
]

export const mockBDFunnel: BDFunnelStage[] = [
  { stage: 'prospect',    label: 'Prospect',    count: 14, value: 38_000_000, color: '#3b82f6' },
  { stage: 'qualified',   label: 'Qualified',   count:  6, value: 44_000_000, color: '#8b5cf6' },
  { stage: 'proposal',    label: 'Proposal',    count:  2, value: 38_000_000, color: '#e8640c' },
  { stage: 'negotiation', label: 'Negotiation', count:  2, value: 22_000_000, color: '#16a34a' },
]

export const mockBDKPIs: KPI[] = [
  {
    id: 'bd-total-pipeline',
    module: 'bd',
    label: 'Total Pipeline',
    value: 142_000_000,
    unit: 'ZAR',
    target: 150_000_000,
    trend: { direction: 'up', percentage: 4.4, period: 'vs last month' },
    status: 'amber',
    sparklineData: sp([128, 133, 130, 138, 140, 143, 141, 142].map(v => v * 1_000_000)),
  },
  {
    id: 'bd-weighted-pipeline',
    module: 'bd',
    label: 'Weighted Pipeline',
    value: 63_900_000,
    unit: 'ZAR',
    target: 67_500_000,
    trend: { direction: 'up', percentage: 2.1, period: 'vs last month' },
    status: 'amber',
    sparklineData: sp([57, 60, 59, 62, 63, 64, 63, 63.9].map(v => v * 1_000_000)),
  },
  {
    id: 'bd-win-rate',
    module: 'bd',
    label: 'Win Rate',
    value: 41,
    unit: 'percentage',
    target: 45,
    trend: { direction: 'down', percentage: 6.8, period: 'vs 3 months' },
    status: 'amber',
    sparklineData: sp([44, 43, 42, 43, 41, 42, 41, 41]),
    vsYesterday: { value: 1, direction: 'down' },
    inverted: true,
  },
  {
    id: 'bd-avg-deal-size',
    module: 'bd',
    label: 'Avg Deal Size',
    value: 5_916_666,
    unit: 'ZAR',
    target: 2_500_000,
    trend: { direction: 'up', percentage: 18.2, period: 'vs LY' },
    status: 'green',
    sparklineData: sp([4.8, 5.1, 5.0, 5.4, 5.6, 5.8, 5.9, 5.9].map(v => v * 1_000_000)),
  },
  {
    id: 'bd-new-opps-mtd',
    module: 'bd',
    label: 'New Opps MTD',
    value: 6,
    unit: 'count',
    target: 8,
    trend: { direction: 'down', percentage: 14.3, period: 'vs last month' },
    status: 'amber',
    sparklineData: sp([7, 9, 8, 6, 7, 8, 6, 6]),
  },
  {
    id: 'bd-open-opportunities',
    module: 'bd',
    label: 'Open Opportunities',
    value: 24,
    unit: 'count',
    target: 20,
    trend: { direction: 'up', percentage: 9.1, period: 'vs last month' },
    status: 'green',
    sparklineData: sp([20, 21, 22, 23, 23, 24, 24, 24]),
  },
]
