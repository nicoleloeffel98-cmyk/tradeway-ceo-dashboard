import type { RegionalActivation, Incident, KPI } from '@/lib/types'

const sp = (values: number[]) => values.map((v, i) => ({ w: `W${i + 1}`, v }))

export const mockRegionalActivations: RegionalActivation[] = [
  { region: 'Gauteng',       activations: 5_420, ambassadors: 4_800, successRate: 95.1, status: 'amber' },
  { region: 'Western Cape',  activations: 2_340, ambassadors: 1_920, successRate: 96.3, status: 'green' },
  { region: 'KwaZulu-Natal', activations: 1_890, ambassadors: 1_640, successRate: 91.8, status: 'amber' },
  { region: 'Eastern Cape',  activations:   820, ambassadors:   710, successRate: 93.4, status: 'amber' },
  { region: 'Limpopo',       activations:   640, ambassadors:   540, successRate: 97.1, status: 'green' },
  { region: 'Mpumalanga',    activations:   490, ambassadors:   420, successRate: 94.8, status: 'green' },
  { region: 'North West',    activations:   380, ambassadors:   320, successRate: 92.3, status: 'amber' },
  { region: 'Free State',    activations:   310, ambassadors:   260, successRate: 95.6, status: 'green' },
  { region: 'Northern Cape', activations:   150, ambassadors:   120, successRate: 98.2, status: 'green' },
]

export const mockIncidents: Incident[] = [
  { id: 'inc-01', type: 'no_show',  severity: 'high',   region: 'Gauteng',       description: '23 ambassadors no-show for Shoprite activation — client flagged concern.', reportedAt: '2026-05-07T08:00:00Z', status: 'open' },
  { id: 'inc-02', type: 'no_show',  severity: 'medium', region: 'KwaZulu-Natal', description: '8 ambassadors unavailable for Tiger Brands roadshow — filled with substitutes.', reportedAt: '2026-05-06T14:00:00Z', status: 'in_progress' },
  { id: 'inc-03', type: 'client',   severity: 'medium', region: 'Gauteng',       description: 'Client complaint: wrong brand materials distributed at Braamfontein activation.', reportedAt: '2026-05-05T10:00:00Z', status: 'in_progress' },
  { id: 'inc-04', type: 'equipment',severity: 'low',    region: 'Western Cape',  description: 'Sampling fridge malfunction at 2 outlets — replaced within 4 hours.', reportedAt: '2026-05-04T16:00:00Z', status: 'resolved' },
  { id: 'inc-05', type: 'weather',  severity: 'low',    region: 'Eastern Cape',  description: 'Heavy rain caused 4 outdoor activations to be postponed to following week.', reportedAt: '2026-05-03T11:00:00Z', status: 'resolved' },
]

export const mockActivationTrend = [
  { week: 'W1', activations: 3_240, target: 3_750 },
  { week: 'W2', activations: 3_480, target: 3_750 },
  { week: 'W3', activations: 3_620, target: 3_750 },
  { week: 'W4', activations: 3_100, target: 3_750 },
  { week: 'W5', activations: 3_720, target: 3_750 },
  { week: 'W6', activations: 3_840, target: 3_750 },
  { week: 'W7', activations: 3_680, target: 3_750 },
  { week: 'W8', activations: 3_900, target: 3_750 },
]

export const mockOpsKPIs: KPI[] = [
  {
    id: 'ops-activations-mtd',
    module: 'operations',
    label: 'Activations MTD',
    value: 14_230,
    unit: 'count',
    target: 16_250,
    trend: { direction: 'up', percentage: 5.8, period: 'vs LY' },
    status: 'amber',
    sparklineData: sp([3240, 6720, 10340, 14230, 14230, 14230, 14230, 14230]),
  },
  {
    id: 'ops-success-rate',
    module: 'operations',
    label: 'Success Rate',
    value: 94.2,
    unit: 'percentage',
    target: 95,
    trend: { direction: 'down', percentage: 0.6, period: 'vs last month' },
    status: 'amber',
    sparklineData: sp([95.1, 94.8, 95.2, 94.6, 94.8, 94.3, 94.2, 94.2]),
  },
  {
    id: 'ops-ambassador-util',
    module: 'operations',
    label: 'Ambassador Util.',
    value: 82,
    unit: 'percentage',
    target: 85,
    trend: { direction: 'up', percentage: 2.5, period: 'vs last month' },
    status: 'green',
    sparklineData: sp([79, 81, 83, 80, 84, 83, 82, 82]),
  },
  {
    id: 'ops-no-show-rate',
    module: 'operations',
    label: 'No-Show Rate',
    value: 8.2,
    unit: 'percentage',
    target: 5,
    trend: { direction: 'up', percentage: 64, period: 'vs target' },
    status: 'red',
    sublabel: 'Gauteng: 8.2%',
    sparklineData: sp([4.8, 5.1, 5.4, 5.8, 6.2, 7.1, 7.8, 8.2]),
    vsYesterday: { value: 0.4, direction: 'up' },
    inverted: true,
  },
  {
    id: 'ops-incidents-open',
    module: 'operations',
    label: 'Open Incidents',
    value: 23,
    unit: 'count',
    target: 10,
    trend: { direction: 'up', percentage: 130, period: 'vs target' },
    status: 'red',
    sublabel: 'This month',
    sparklineData: sp([8, 9, 11, 13, 14, 18, 21, 23]),
  },
  {
    id: 'ops-active-today',
    module: 'operations',
    label: 'Active Today',
    value: 847,
    unit: 'count',
    target: 900,
    trend: { direction: 'up', percentage: 4.2, period: 'vs last week' },
    status: 'amber',
    sparklineData: sp([810, 830, 820, 860, 840, 855, 842, 847]),
  },
]
