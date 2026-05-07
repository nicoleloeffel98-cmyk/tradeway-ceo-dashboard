import type { SalesForecastPoint, SalesRep, KPI } from '@/lib/types'

const sp = (values: number[]) => values.map((v, i) => ({ w: `W${i + 1}`, v }))

export const mockSalesForecast: SalesForecastPoint[] = [
  { month: 'Jan', actual: 44_100_000, target: 48_000_000 },
  { month: 'Feb', actual: 51_200_000, target: 50_000_000 },
  { month: 'Mar', actual: 48_800_000, target: 52_000_000 },
  { month: 'Apr', actual: 46_300_000, target: 52_000_000 },
  { month: 'May', forecast: 52_100_000, target: 54_000_000 },
  { month: 'Jun', forecast: 58_400_000, target: 56_000_000 },
]

export const mockSalesReps: SalesRep[] = [
  { id: 'rep-01', name: 'Sarah Mokoena',  region: 'Gauteng',       target: 12_000_000, actual: 11_200_000, attainmentPct: 93, dealsWon: 4, winRate: 67 },
  { id: 'rep-02', name: 'James Khumalo',  region: 'KZN',           target: 10_000_000, actual: 10_800_000, attainmentPct: 108,dealsWon: 5, winRate: 71 },
  { id: 'rep-03', name: 'Thabo Nkosi',    region: 'Western Cape',  target: 8_000_000,  actual:  7_200_000, attainmentPct: 90, dealsWon: 3, winRate: 50 },
  { id: 'rep-04', name: 'Priya Sharma',   region: 'Gauteng',       target: 9_000_000,  actual:  7_800_000, attainmentPct: 87, dealsWon: 3, winRate: 43 },
  { id: 'rep-05', name: 'Mpho Williams',  region: 'Eastern Cape',  target: 6_000_000,  actual:  5_400_000, attainmentPct: 90, dealsWon: 2, winRate: 50 },
]

export const mockSalesKPIs: KPI[] = [
  {
    id: 'sales-revenue-mtd',
    module: 'sales',
    label: 'Revenue MTD',
    value: 48_200_000,
    unit: 'ZAR',
    target: 52_000_000,
    trend: { direction: 'up', percentage: 9.3, period: 'vs LY' },
    status: 'amber',
    sparklineData: sp([38.2, 40.1, 39.8, 43.5, 45.2, 44.8, 46.9, 48.2].map(v => v * 1_000_000)),
    vsYesterday: { value: 1_400_000, direction: 'up' },
  },
  {
    id: 'sales-revenue-ytd',
    module: 'sales',
    label: 'Revenue YTD',
    value: 194_600_000,
    unit: 'ZAR',
    target: 202_000_000,
    trend: { direction: 'up', percentage: 7.8, period: 'vs LY' },
    status: 'amber',
    sparklineData: sp([44.1, 95.3, 144.1, 190.4, 194.6, 194.6, 194.6, 194.6].map(v => v * 1_000_000)),
  },
  {
    id: 'sales-win-rate',
    module: 'sales',
    label: 'Close Rate',
    value: 41,
    unit: 'percentage',
    target: 45,
    trend: { direction: 'down', percentage: 6.8, period: 'vs Q1' },
    status: 'amber',
    sparklineData: sp([44, 43, 42, 43, 41, 42, 41, 41]),
  },
  {
    id: 'sales-new-clients',
    module: 'sales',
    label: 'New Clients MTD',
    value: 2,
    unit: 'count',
    target: 3,
    trend: { direction: 'flat', percentage: 0, period: 'vs last month' },
    status: 'amber',
    sparklineData: sp([3, 4, 2, 3, 3, 2, 2, 2]),
  },
  {
    id: 'sales-forecast',
    module: 'sales',
    label: 'May Forecast',
    value: 52_100_000,
    unit: 'ZAR',
    target: 54_000_000,
    trend: { direction: 'up', percentage: 12.6, period: 'vs April actual' },
    status: 'amber',
    sparklineData: sp([44.1, 51.2, 48.8, 46.3, 50.1, 51.2, 51.8, 52.1].map(v => v * 1_000_000)),
  },
  {
    id: 'sales-avg-deal',
    module: 'sales',
    label: 'Avg Deal Size',
    value: 5_916_666,
    unit: 'ZAR',
    target: 2_500_000,
    trend: { direction: 'up', percentage: 18.2, period: 'vs LY' },
    status: 'green',
    sparklineData: sp([4.8, 5.1, 5.0, 5.4, 5.6, 5.8, 5.9, 5.9].map(v => v * 1_000_000)),
  },
]
