import type { RevenueScenario, StrategicRisk, MarketSignal } from '@/lib/types'

export const mockScenarios: RevenueScenario[] = [
  {
    label: 'Base',
    q1: 194_600_000,
    q2: 158_400_000,
    q3: 162_800_000,
    q4: 124_200_000,
    fullYear: 640_000_000,
    probability: 55,
    color: '#e8640c',
  },
  {
    label: 'Upside',
    q1: 194_600_000,
    q2: 172_000_000,
    q3: 178_400_000,
    q4: 165_000_000,
    fullYear: 710_000_000,
    probability: 25,
    color: '#16a34a',
  },
  {
    label: 'Downside',
    q1: 194_600_000,
    q2: 142_000_000,
    q3: 138_400_000,
    q4: 105_000_000,
    fullYear: 580_000_000,
    probability: 20,
    color: '#dc2626',
  },
]

export const mockScenarioQuarterly = [
  { quarter: 'Q1 (actual)', base: 194.6,  upside: 194.6,  downside: 194.6 },
  { quarter: 'Q2',          base: 158.4,  upside: 172.0,  downside: 142.0 },
  { quarter: 'Q3',          base: 162.8,  upside: 178.4,  downside: 138.4 },
  { quarter: 'Q4',          base: 124.2,  upside: 165.0,  downside: 105.0 },
]

export const mockStrategicRisks: StrategicRisk[] = [
  { id: 'r-01', title: 'BD win rate decline reaches below 38%',           category: 'market',      likelihood: 'medium', impact: 'high',   mitigationStatus: 'in_progress', owner: 'CEO' },
  { id: 'r-02', title: 'Gauteng no-show crisis triggers client exits',    category: 'operational', likelihood: 'medium', impact: 'high',   mitigationStatus: 'in_progress', owner: 'COO' },
  { id: 'r-03', title: 'AR balance forces credit facility drawdown',      category: 'financial',   likelihood: 'medium', impact: 'high',   mitigationStatus: 'none',        owner: 'CFO' },
  { id: 'r-04', title: 'Key BD talent exits during incentive review',     category: 'people',      likelihood: 'low',    impact: 'medium', mitigationStatus: 'in_progress', owner: 'CHRO' },
  { id: 'r-05', title: 'Retail sector slowdown reduces sampling budgets', category: 'market',      likelihood: 'medium', impact: 'medium', mitigationStatus: 'none',        owner: 'CCO' },
  { id: 'r-06', title: 'Major client (Shoprite) contract non-renewal',    category: 'client',      likelihood: 'low',    impact: 'high',   mitigationStatus: 'mitigated',   owner: 'CEO' },
]

export const mockMarketSignals: MarketSignal[] = [
  { id: 'ms-01', signal: 'SA retail sector gross margins under pressure Q1 2026',  relevance: 'high',   implication: 'Clients may reduce discretionary activation budgets in H2.', date: '2026-05-01' },
  { id: 'ms-02', signal: 'Two new experiential agencies entering SA market',        relevance: 'medium', implication: 'Competitive pricing pressure expected in Q3 tender season.',   date: '2026-04-28' },
  { id: 'ms-03', signal: 'Labour cost inflation exceeding CPI by 3.2% in services',relevance: 'high',   implication: 'Ambassador cost base will increase — pricing model review needed.', date: '2026-04-15' },
  { id: 'ms-04', signal: 'FMCG brands increasing below-the-line spend by 12% YoY', relevance: 'high',   implication: 'Core market is growing — BD team should target FMCG sector first.', date: '2026-04-10' },
]
