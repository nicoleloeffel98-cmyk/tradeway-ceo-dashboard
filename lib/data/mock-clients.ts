import type { RAGStatus } from '@/lib/utils/rag'

export interface ClientRecord {
  id:          string
  name:        string
  sector:      string
  arr:         number       // annual recurring / contract value
  nps:         number       // 0–10
  churnRisk:   RAGStatus
  renewalDate: string       // ISO date
  daysToRenewal: number
  openIssues:  number
  lastContact: string       // ISO date
  trend:       'improving' | 'stable' | 'declining'
}

export const mockClients: ClientRecord[] = [
  {
    id: 'cl-01',
    name: 'Shoprite',
    sector: 'Retail',
    arr: 52_000_000,
    nps: 8.4,
    churnRisk: 'green',
    renewalDate: '2026-11-01',
    daysToRenewal: 178,
    openIssues: 1,
    lastContact: '2026-05-05T10:00:00Z',
    trend: 'stable',
  },
  {
    id: 'cl-02',
    name: 'Vodacom',
    sector: 'Telco',
    arr: 48_000_000,
    nps: 8.1,
    churnRisk: 'green',
    renewalDate: '2026-09-15',
    daysToRenewal: 131,
    openIssues: 0,
    lastContact: '2026-05-06T09:30:00Z',
    trend: 'improving',
  },
  {
    id: 'cl-03',
    name: 'Tiger Brands',
    sector: 'FMCG',
    arr: 28_000_000,
    nps: 7.6,
    churnRisk: 'amber',
    renewalDate: '2026-07-31',
    daysToRenewal: 85,
    openIssues: 2,
    lastContact: '2026-05-04T14:00:00Z',
    trend: 'declining',
  },
  {
    id: 'cl-04',
    name: 'Standard Bank',
    sector: 'Financial',
    arr: 22_000_000,
    nps: 7.2,
    churnRisk: 'amber',
    renewalDate: '2026-08-20',
    daysToRenewal: 105,
    openIssues: 3,
    lastContact: '2026-04-28T11:00:00Z',
    trend: 'declining',
  },
  {
    id: 'cl-05',
    name: 'Coca-Cola SA',
    sector: 'FMCG',
    arr: 36_000_000,
    nps: 8.6,
    churnRisk: 'green',
    renewalDate: '2027-01-15',
    daysToRenewal: 253,
    openIssues: 0,
    lastContact: '2026-05-07T08:00:00Z',
    trend: 'improving',
  },
  {
    id: 'cl-06',
    name: 'Woolworths',
    sector: 'Retail',
    arr: 18_000_000,
    nps: 8.8,
    churnRisk: 'green',
    renewalDate: '2026-10-01',
    daysToRenewal: 147,
    openIssues: 0,
    lastContact: '2026-05-06T15:00:00Z',
    trend: 'improving',
  },
]

export const mockClientSummary = {
  totalArr:      204_000_000,
  avgNps:        8.1,
  atRisk:        2,     // amber or red churn risk
  criticalRisk:  0,
  renewingIn90d: 1,     // Tiger Brands
  avgNpsTrend:   -0.1,
}
