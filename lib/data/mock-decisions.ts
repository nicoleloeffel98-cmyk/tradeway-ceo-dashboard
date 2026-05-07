import type { DecisionItem } from '@/lib/types'

export const mockDecisions: DecisionItem[] = [
  {
    id: 'dec-001',
    title: 'Approve Q2 Budget Reallocation',
    context: 'R2.4M reallocation requested from KZN ops budget to Gauteng staffing to address no-show crisis. CFO and Ops Director have signed off. Needs CEO approval before Friday to action before month-end.',
    priority: 'urgent',
    module: 'finance',
    deadline: '2026-05-09',
    status: 'pending',
    financialStake: '2 active campaigns at delivery risk — client exit exposure',
  },
  {
    id: 'dec-002',
    title: 'Sign Off Pick n Pay Campaign Proposal',
    context: 'R8.5M national sampling campaign proposal ready for submission. Pick n Pay deadline is Thursday 9 May. Proposal covers 4,200 activations across 8 provinces over 12 weeks. BD team confidence: high.',
    priority: 'high',
    module: 'bd',
    deadline: '2026-05-09',
    status: 'pending',
    financialStake: 'R8.5M pipeline at risk if missed',
  },
  {
    id: 'dec-003',
    title: 'Approve Q3 Headcount Plan',
    context: '7 open roles across Operations (3), Finance (2), BD (1), Technology (1). HR has finalised JDs and compensation ranges. Q3 capacity modelling shows a 340-ambassador shortfall in August without action.',
    priority: 'high',
    module: 'people',
    deadline: '2026-05-14',
    status: 'pending',
    financialStake: '340-ambassador gap in Aug = R8M+ delivery risk',
  },
  {
    id: 'dec-004',
    title: 'BD Team H2 Incentive Structure',
    context: 'Current incentive structure ties 80% of bonus to revenue closed. Proposal to shift to 60% revenue / 40% pipeline quality to improve win rate. Sales Director and CHRO support. Needs CEO direction.',
    priority: 'normal',
    module: 'bd',
    deadline: '2026-05-21',
    status: 'pending',
    financialStake: 'Win rate recovery est. +R6M Q3 pipeline conversion',
  },
]
