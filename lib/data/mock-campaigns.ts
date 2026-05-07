import type { Campaign, ROIPoint, KPI } from '@/lib/types'

const sp = (values: number[]) => values.map((v, i) => ({ w: `W${i + 1}`, v }))

export const mockCampaigns: Campaign[] = [
  { id: 'c-01', name: 'Shoprite Summer Sampling',     client: 'Shoprite',    type: 'sampling',      status: 'active',    budget: 4_200_000, spend: 3_980_000, activations: 1_840, reach: 284_000, roi: 4.1, clientNPS: 8.4, region: 'National' },
  { id: 'c-02', name: 'Vodacom Fibre Launch',         client: 'Vodacom',     type: 'experiential',  status: 'active',    budget: 6_800_000, spend: 5_200_000, activations:   640, reach: 142_000, roi: 3.8, clientNPS: 8.1, region: 'Gauteng, WC' },
  { id: 'c-03', name: 'Tiger Brands BTL Drive',       client: 'Tiger Brands',type: 'BTL',           status: 'active',    budget: 3_100_000, spend: 2_900_000, activations: 1_200, reach: 198_000, roi: 3.2, clientNPS: 7.6, region: 'National' },
  { id: 'c-04', name: 'Coca-Cola Roadshow Q2',        client: 'Coca-Cola SA',type: 'roadshow',      status: 'active',    budget: 5_400_000, spend: 4_100_000, activations:   480, reach: 312_000, roi: 3.6, clientNPS: 8.6, region: 'Gauteng' },
  { id: 'c-05', name: 'Standard Bank Instore',        client: 'Standard Bank',type: 'instore',      status: 'active',    budget: 2_800_000, spend: 2_600_000, activations:   920, reach:  84_000, roi: 2.8, clientNPS: 7.2, region: 'National' },
  { id: 'c-06', name: 'Woolworths Food Sampling',     client: 'Woolworths',  type: 'sampling',      status: 'active',    budget: 3_600_000, spend: 2_800_000, activations: 1_460, reach: 196_000, roi: 3.9, clientNPS: 8.8, region: 'National' },
  { id: 'c-07', name: 'Pick n Pay National Sampling', client: 'Pick n Pay',  type: 'sampling',      status: 'planning',  budget: 8_500_000, spend:         0, activations:     0, reach:       0, roi: 0,   clientNPS: 0,   region: 'National' },
  { id: 'c-08', name: 'Nestlé Schools Activation',   client: 'Nestlé SA',   type: 'experiential',  status: 'completed', budget: 2_200_000, spend: 2_150_000, activations:   380, reach:  62_000, roi: 4.4, clientNPS: 9.1, region: 'Gauteng, KZN' },
]

export const mockROIByMonth = [
  { month: 'Jan', avgROI: 3.1, campaigns: 8 },
  { month: 'Feb', avgROI: 3.4, campaigns: 9 },
  { month: 'Mar', avgROI: 3.2, campaigns: 10 },
  { month: 'Apr', avgROI: 3.5, campaigns: 11 },
  { month: 'May', avgROI: 3.4, campaigns: 12 },
]

export const mockROIPoints: ROIPoint[] = mockCampaigns
  .filter(c => c.roi > 0)
  .map(c => ({ campaign: c.name.split(' ').slice(0, 2).join(' '), roi: c.roi, budget: c.budget }))

export const mockCampaignKPIs: KPI[] = [
  {
    id: 'camp-avg-roi',
    module: 'campaigns',
    label: 'Avg Campaign ROI',
    value: 3.4,
    unit: 'multiplier',
    target: 3.0,
    trend: { direction: 'up', percentage: 9.7, period: 'vs Q1 avg' },
    status: 'green',
    sparklineData: sp([3.0, 3.2, 3.1, 3.3, 3.4, 3.3, 3.4, 3.4]),
  },
  {
    id: 'camp-client-nps',
    module: 'campaigns',
    label: 'Avg Client NPS',
    value: 7.8,
    unit: 'score',
    target: 8.0,
    trend: { direction: 'down', percentage: 1.3, period: 'vs last month' },
    status: 'amber',
    sparklineData: sp([8.1, 7.9, 8.0, 7.8, 7.9, 7.7, 7.8, 7.8]),
  },
  {
    id: 'camp-active-count',
    module: 'campaigns',
    label: 'Active Campaigns',
    value: 6,
    unit: 'count',
    target: 8,
    trend: { direction: 'down', percentage: 14.3, period: 'vs target' },
    status: 'amber',
    sparklineData: sp([8, 9, 9, 8, 7, 7, 6, 6]),
  },
  {
    id: 'camp-total-activations',
    module: 'campaigns',
    label: 'Campaign Activations',
    value: 6_540,
    unit: 'count',
    target: 7_000,
    trend: { direction: 'up', percentage: 3.8, period: 'vs last month' },
    status: 'amber',
    sparklineData: sp([5200, 5600, 5800, 6100, 6200, 6300, 6420, 6540]),
  },
  {
    id: 'camp-total-reach',
    module: 'campaigns',
    label: 'Total Reach MTD',
    value: 1_278_000,
    unit: 'count',
    target: 1_400_000,
    trend: { direction: 'up', percentage: 8.2, period: 'vs last month' },
    status: 'amber',
    sparklineData: sp([980000, 1040000, 1100000, 1160000, 1200000, 1240000, 1260000, 1278000]),
  },
  {
    id: 'camp-budget-util',
    module: 'campaigns',
    label: 'Budget Utilisation',
    value: 87,
    unit: 'percentage',
    target: 90,
    trend: { direction: 'up', percentage: 2.4, period: 'vs last month' },
    status: 'amber',
    sparklineData: sp([82, 84, 85, 86, 86, 87, 87, 87]),
  },
]
