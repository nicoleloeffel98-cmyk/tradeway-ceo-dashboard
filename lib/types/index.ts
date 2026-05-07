import type { KPIUnit } from '@/lib/utils/format'
import type { RAGStatus } from '@/lib/utils/rag'

export type { KPIUnit, RAGStatus }

export type Period = 'WTD' | 'MTD' | 'QTD' | 'YTD'
export type TrendDirection = 'up' | 'down' | 'flat'

export interface TrendValue {
  direction:  TrendDirection
  percentage: number
  period:     string
}

export interface SparklinePoint {
  w: string
  v: number
}

// ─── KPI ────────────────────────────────────────────────────────────────────

export interface KPI {
  id:            string
  module:        string
  label:         string
  value:         number
  unit:          KPIUnit
  target:        number
  trend:         TrendValue
  status:        RAGStatus
  sparklineData: SparklinePoint[]
  sublabel?:     string
  inverted?:     boolean  // true = lower is better (attrition, no-show rate, overdue AR)
  vsYesterday?:  { value: number; direction: 'up' | 'down' | 'flat' }
}

export interface ScorecardRow {
  id:              string
  label:           string
  status:          RAGStatus
  score:           number
  scorePrior?:     number   // score last period for trajectory
  trend:           TrendDirection
  trendNote?:      string   // e.g. "3rd consecutive month declining"
  keyMetric:       string
  keyMetricValue:  string
  href:            string
  target?:         string
  delta?:          string
  deltaPositive?:  boolean
}

// ─── Alerts ─────────────────────────────────────────────────────────────────

export type AlertSeverity = 'critical' | 'warning' | 'info'

export interface Alert {
  id:             string
  severity:       AlertSeverity
  category:       string
  title:          string
  summary:        string
  actionRequired: boolean
  actionLabel?:   string
  actionUrl?:     string
  createdAt:      string
  isRead:         boolean
}

// ─── Priorities ──────────────────────────────────────────────────────────────

export interface Priority {
  id:       string
  title:    string
  progress: number
  status:   RAGStatus
  dueDate?: string
  module:   string
}

// ─── Decision Queue ──────────────────────────────────────────────────────────

export type DecisionPriority = 'urgent' | 'high' | 'normal'
export type DecisionStatus   = 'pending' | 'decided' | 'deferred' | 'delegated'

export interface DecisionItem {
  id:              string
  title:           string
  context:         string
  priority:        DecisionPriority
  module:          string
  deadline?:       string
  status:          DecisionStatus
  financialStake?: string   // commercial consequence visible in queue
}

// ─── Business Development ────────────────────────────────────────────────────

export type DealStage =
  | 'prospect'
  | 'qualified'
  | 'proposal'
  | 'negotiation'
  | 'closed_won'
  | 'closed_lost'

export interface Opportunity {
  id:            string
  client:        string
  sector:        string
  value:         number
  stage:         DealStage
  probability:   number
  expectedClose: string
  owner:         string
  daysInStage:   number
}

export interface BDFunnelStage {
  stage: DealStage
  label: string
  count: number
  value: number
  color: string
}

// ─── Sales ───────────────────────────────────────────────────────────────────

export interface SalesForecastPoint {
  month:     string
  actual?:   number
  forecast?: number
  target:    number
  [key: string]: string | number | undefined
}

export interface SalesRep {
  id:             string
  name:           string
  region:         string
  target:         number
  actual:         number
  attainmentPct:  number
  dealsWon:       number
  winRate:        number
}

// ─── Finance ─────────────────────────────────────────────────────────────────

export interface CashFlowPoint {
  month:   string
  inflow:  number
  outflow: number
  net:     number
  [key: string]: string | number
}

export interface ARAgingBucket {
  bucket: string
  amount: number
  count:  number
  pct:    number
}

export interface RevenueVsBudgetPoint {
  month:   string
  actual:  number
  budget:  number
  target:  number
}

// ─── Operations ──────────────────────────────────────────────────────────────

export type Region =
  | 'Gauteng'
  | 'Western Cape'
  | 'KwaZulu-Natal'
  | 'Eastern Cape'
  | 'Limpopo'
  | 'Mpumalanga'
  | 'North West'
  | 'Free State'
  | 'Northern Cape'

export interface RegionalActivation {
  region:       Region
  activations:  number
  ambassadors:  number
  successRate:  number
  status:       RAGStatus
}

export interface Incident {
  id:          string
  type:        string
  severity:    'low' | 'medium' | 'high'
  region:      Region
  description: string
  reportedAt:  string
  status:      'open' | 'in_progress' | 'resolved'
}

// ─── People ──────────────────────────────────────────────────────────────────

export interface CapacityPoint {
  week:      string
  required:  number
  available: number
  [key: string]: string | number
}

export interface AttritionPoint {
  month: string
  rate:  number
  [key: string]: string | number
}

// ─── Campaigns ───────────────────────────────────────────────────────────────

export type CampaignType   = 'experiential' | 'BTL' | 'sampling' | 'roadshow' | 'instore'
export type CampaignStatus = 'planning' | 'active' | 'completed' | 'on_hold'

export interface Campaign {
  id:          string
  name:        string
  client:      string
  type:        CampaignType
  status:      CampaignStatus
  budget:      number
  spend:       number
  activations: number
  reach:       number
  roi:         number
  clientNPS:   number
  region:      string
}

export interface ROIPoint {
  campaign: string
  roi:      number
  budget:   number
  [key: string]: string | number
}

// ─── Strategic ───────────────────────────────────────────────────────────────

export interface RevenueScenario {
  label:       string
  q1:          number
  q2:          number
  q3:          number
  q4:          number
  fullYear:    number
  probability: number
  color:       string
}

export interface StrategicRisk {
  id:                string
  title:             string
  category:          string
  likelihood:        'low' | 'medium' | 'high'
  impact:            'low' | 'medium' | 'high'
  mitigationStatus:  'none' | 'in_progress' | 'mitigated'
  owner:             string
}

export interface MarketSignal {
  id:          string
  signal:      string
  relevance:   'low' | 'medium' | 'high'
  implication: string
  date:        string
}

// ─── AI Insights ─────────────────────────────────────────────────────────────

export interface AIInsight {
  module:      string
  headline:    string
  detail:      string
  source?:     string
  confidence?: 'high' | 'medium' | 'low'
}
