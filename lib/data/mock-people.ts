import type { CapacityPoint, AttritionPoint, KPI, RAGStatus } from '@/lib/types'

export interface DeptHeadcount {
  dept:       string
  headcount:  number
  target:     number
  vacancies:  number
  status:     RAGStatus
}

export interface OpenVacancy {
  id:       string
  role:     string
  dept:     string
  priority: 'critical' | 'high' | 'normal'
  daysOpen: number
}

export interface AmbassadorRegion {
  region:  string
  active:  number
  pool:    number
  pct:     number
  status:  RAGStatus
}

export const mockDeptHeadcount: DeptHeadcount[] = [
  { dept: 'Operations',           headcount: 89,  target: 92,  vacancies: 3, status: 'amber' },
  { dept: 'Business Development', headcount: 24,  target: 25,  vacancies: 1, status: 'green' },
  { dept: 'Finance',              headcount: 18,  target: 20,  vacancies: 2, status: 'amber' },
  { dept: 'People & HR',          headcount: 14,  target: 14,  vacancies: 0, status: 'green' },
  { dept: 'Technology',           headcount: 12,  target: 13,  vacancies: 1, status: 'green' },
  { dept: 'Marketing',            headcount:  8,  target:  8,  vacancies: 0, status: 'green' },
  { dept: 'Executive',            headcount:  5,  target:  5,  vacancies: 0, status: 'green' },
]

export const mockOpenVacancies: OpenVacancy[] = [
  { id: 'v1', role: 'Regional Ops Manager — Gauteng',    dept: 'Operations',           priority: 'critical', daysOpen: 34 },
  { id: 'v2', role: 'Financial Controller',              dept: 'Finance',               priority: 'high',     daysOpen: 21 },
  { id: 'v3', role: 'Senior Field Coordinator — KZN',   dept: 'Operations',           priority: 'high',     daysOpen: 18 },
  { id: 'v4', role: 'Ops Coordinator — Eastern Cape',   dept: 'Operations',           priority: 'high',     daysOpen: 15 },
  { id: 'v5', role: 'Finance Analyst',                   dept: 'Finance',               priority: 'normal',   daysOpen: 27 },
  { id: 'v6', role: 'BD Analyst',                        dept: 'Business Development',  priority: 'normal',   daysOpen: 12 },
  { id: 'v7', role: 'Software Developer',                dept: 'Technology',            priority: 'normal',   daysOpen:  8 },
]

export const mockAmbassadorRegions: AmbassadorRegion[] = [
  { region: 'Gauteng',       active: 4_200, pool: 4_800, pct: 88, status: 'green' },
  { region: 'Western Cape',  active: 2_100, pool: 2_400, pct: 88, status: 'green' },
  { region: 'KwaZulu-Natal', active: 1_420, pool: 1_900, pct: 75, status: 'amber' },
  { region: 'Eastern Cape',  active: 1_180, pool: 1_400, pct: 84, status: 'green' },
  { region: 'Limpopo',       active:   980, pool: 1_100, pct: 89, status: 'green' },
  { region: 'North West',    active:   740, pool: 1_100, pct: 67, status: 'red'   },
  { region: 'Others',        active: 1_860, pool: 2_500, pct: 74, status: 'amber' },
]

const sp = (values: number[]) => values.map((v, i) => ({ w: `W${i + 1}`, v }))

export const mockCapacity: CapacityPoint[] = [
  { week: 'W1 Apr', required: 11_200, available: 12_100 },
  { week: 'W2 Apr', required: 11_400, available: 12_200 },
  { week: 'W3 Apr', required: 11_800, available: 12_300 },
  { week: 'W4 Apr', required: 12_100, available: 12_400 },
  { week: 'W1 May', required: 12_400, available: 12_480 },
  { week: 'W2 May', required: 12_600, available: 12_480 },
  { week: 'W3 May', required: 13_200, available: 12_480 },
  { week: 'W4 May', required: 13_800, available: 12_480 },
]

export const mockAttrition: AttritionPoint[] = [
  { month: 'Jun-25', rate: 15.8 },
  { month: 'Jul-25', rate: 15.2 },
  { month: 'Aug-25', rate: 15.6 },
  { month: 'Sep-25', rate: 15.1 },
  { month: 'Oct-25', rate: 14.8 },
  { month: 'Nov-25', rate: 14.6 },
  { month: 'Dec-25', rate: 14.5 },
  { month: 'Jan-26', rate: 14.4 },
  { month: 'Feb-26', rate: 14.3 },
  { month: 'Mar-26', rate: 14.2 },
  { month: 'Apr-26', rate: 14.2 },
  { month: 'May-26', rate: 14.2 },
]

export const mockPeopleKPIs: KPI[] = [
  {
    id: 'ppl-headcount',
    module: 'people',
    label: 'Total Headcount',
    value: 224,
    unit: 'count',
    target: 220,
    trend: { direction: 'up', percentage: 1.8, period: 'vs last month' },
    status: 'green',
    sparklineData: sp([218, 219, 220, 221, 221, 222, 223, 224]),
  },
  {
    id: 'ppl-ambassador-pool',
    module: 'people',
    label: 'Ambassador Pool',
    value: 15_200,
    unit: 'count',
    target: 15_000,
    trend: { direction: 'up', percentage: 1.3, period: 'vs last month' },
    status: 'green',
    sparklineData: sp([14800, 14900, 14950, 15000, 15050, 15100, 15150, 15200]),
  },
  {
    id: 'ppl-capacity-util',
    module: 'people',
    label: 'Capacity Util.',
    value: 80,
    unit: 'percentage',
    target: 80,
    trend: { direction: 'up', percentage: 1.3, period: 'vs last month' },
    status: 'green',
    sparklineData: sp([76, 78, 79, 77, 80, 81, 80, 80]),
  },
  {
    id: 'ppl-attrition',
    module: 'people',
    label: 'Attrition Rate',
    value: 14.2,
    unit: 'percentage',
    target: 15,
    trend: { direction: 'down', percentage: 1.4, period: 'vs 6 months ago' },
    status: 'green',
    sparklineData: sp([14.8, 14.6, 14.5, 14.4, 14.3, 14.2, 14.2, 14.2]),
    inverted: true,
  },
  {
    id: 'ppl-open-roles',
    module: 'people',
    label: 'Open Roles',
    value: 7,
    unit: 'count',
    target: 10,
    trend: { direction: 'down', percentage: 12.5, period: 'vs last month' },
    status: 'green',
    sublabel: '3 critical',
    sparklineData: sp([9, 10, 9, 9, 8, 8, 7, 7]),
  },
  {
    id: 'ppl-amb-active',
    module: 'people',
    label: 'Active Ambassadors',
    value: 12_480,
    unit: 'count',
    target: 12_750,
    trend: { direction: 'up', percentage: 2.1, period: 'vs last month' },
    status: 'amber',
    sublabel: '82% of pool',
    sparklineData: sp([12000, 12100, 12200, 12300, 12350, 12400, 12450, 12480]),
  },
]
