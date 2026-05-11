/**
 * lib/workbook/types.ts
 * ──────────────────────────────────────────────────────────────────────────
 * All typed row shapes for the Tradeway Master Tracking Workbook.
 * Each interface maps 1-to-1 with a fixed sheet in the workbook.
 * Optional sheets (Alerts, Decisions, Forward View) are clearly marked.
 */

import type { RAGStatus } from '@/lib/utils/rag'

// ─── Raw row types (from XLSX parser) ────────────────────────────────────────

/** BD Pipeline sheet — one row per open deal */
export interface BDRow {
  client:        string
  sector?:       string
  stage:         'prospect' | 'qualified' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost'
  value:         number       // ZAR deal value
  probability:   number       // 0-100
  closeDate?:    string       // YYYY-MM-DD or Excel date number
  owner?:        string
  daysInStage?:  number
}

/** Sales Performance sheet — one row per sales rep */
export interface SalesRow {
  rep:        string
  region?:    string
  target:     number   // ZAR full-month target
  actual:     number   // ZAR MTD actual
  ytdActual?: number
  dealsWon?:  number
  dealsTotal?: number
  winRate?:   number   // 0-100 (can be derived if dealsWon + dealsTotal present)
}

/** Financial Health sheet — one row per financial metric */
export interface FinanceRow {
  metric:  string   // e.g. "Cash Balance", "DSO", "Overdue AR", "Revenue MTD"
  value:   number
  target?: number
  unit?:   string   // 'ZAR' | 'days' | 'pct' | ''
}

/** Operations Tracking sheet — one row per region */
export interface OperationsRow {
  region:       string
  activations:  number
  ambassadors:  number
  successRate:  number  // 0-100
  noShowRate?:  number  // 0-100
}

/** Client Health sheet — one row per client */
export interface ClientRow {
  name:          string
  sector?:       string
  nps:           number   // -100 to 100 (Net Promoter Score)
  arr:           number   // Annual Recurring Revenue in ZAR
  churnRisk:     RAGStatus
  daysToRenewal: number
  trend:         'improving' | 'stable' | 'declining'
  lastContact?:  string
}

/** People & Capacity sheet — one row per metric (summary) or per region/role */
export interface PeopleRow {
  metric:  string    // e.g. "Total Headcount", "Active Ambassadors", "Capacity Utilisation", "Attrition Rate MTD", "Open Roles"
  value:   number
  target?: number
}

/** Executive Alerts sheet — optional; one row per alert */
export interface AlertRow {
  severity:  'critical' | 'warning' | 'info'
  category:  string
  title:     string
  summary:   string
  date?:     string   // YYYY-MM-DD; defaults to today
}

/** Decision Queue sheet — optional; one row per decision */
export interface DecisionRow {
  title:          string
  context:        string
  priority:       'urgent' | 'high' | 'normal'
  deadline?:      string   // YYYY-MM-DD
  financialStake?: string  // free-text, e.g. "R12M ARR at risk"
  module?:        string
}

/** Forward View sheet — optional; one row per revenue scenario */
export interface ScenarioRow {
  label:       string   // e.g. "Base", "Upside", "Downside"
  q1:          number
  q2:          number
  q3:          number
  q4:          number
  fullYear?:   number   // derived if absent
  probability: number   // 0-100
  color?:      string   // CSS color
}

// ─── Parsed workbook result ───────────────────────────────────────────────────

export interface ParsedWorkbook {
  bd?:         BDRow[]
  sales?:      SalesRow[]
  finance?:    FinanceRow[]
  operations?: OperationsRow[]
  clients?:    ClientRow[]
  people?:     PeopleRow[]
  alerts?:     AlertRow[]
  decisions?:  DecisionRow[]
  scenarios?:  ScenarioRow[]
}

// ─── Derived KPI types ────────────────────────────────────────────────────────

export interface DerivedBDKPIs {
  totalPipeline:      number
  openOpportunities:  number
  winRate:            number   // 0-100
  weightedPipeline:   number
  negotiationValue:   number
  proposalValue:      number
}

export interface DerivedSalesKPIs {
  revenueMTD:       number
  revenueTarget:    number
  attainmentPct:    number
  forecastFullMonth: number
  winRate:          number
  topReps:          { name: string; attainmentPct: number; actual: number; region: string }[]
}

export interface DerivedFinanceKPIs {
  cashBalance:    number
  dso:            number
  overdueAR:      number
  revenueMTD:     number
  revenueTarget:  number
  grossMarginPct: number
  cashRunwayDays: number
}

export interface DerivedOperationsKPIs {
  totalActivationsMTD: number
  avgSuccessRate:      number
  avgNoShowRate:       number
  ambassadorUtil:      number
  regionCount:         number
  regions:             { region: string; activations: number; ambassadors: number; successRate: number; noShowRate: number; status: RAGStatus }[]
}

export interface DerivedClientKPIs {
  avgNPS:         number
  atRisk:         number   // red + amber count
  renewingIn90d:  number
  totalARR:       number
  clients:        ClientRow[]
}

export interface DerivedPeopleKPIs {
  totalHeadcount:   number
  capacityUtil:     number
  attritionRate:    number
  openRoles:        number
}

export interface DerivedKPIs {
  bd?:         DerivedBDKPIs
  sales?:      DerivedSalesKPIs
  finance?:    DerivedFinanceKPIs
  operations?: DerivedOperationsKPIs
  clients?:    DerivedClientKPIs
  people?:     DerivedPeopleKPIs
}

// ─── Intelligence outputs ─────────────────────────────────────────────────────

export interface GeneratedAlert {
  id:             string
  severity:       'critical' | 'warning' | 'info'
  category:       string
  title:          string
  summary:        string
  actionRequired: boolean
  actionLabel?:   string
  actionUrl?:     string
  createdAt:      string
  isRead:         boolean
  source:         'workbook'   // marks as derived from import, not mock
}

export interface GeneratedDecision {
  id:              string
  title:           string
  context:         string
  priority:        'urgent' | 'high' | 'normal'
  module:          string
  deadline?:       string
  status:          'pending'
  financialStake?: string
  source:          'workbook'
}

// ─── Readiness scoring ────────────────────────────────────────────────────────

export interface SheetReadiness {
  sheetName:       string
  present:         boolean
  required:        boolean
  rowCount:        number
  missingRequired: string[]   // required column names not found
  warnings:        string[]   // optional columns missing, data quality issues
  score:           number     // 0-100 for this sheet
}

export interface ReadinessReport {
  overallScore:  number        // 0-100
  grade:         'A' | 'B' | 'C' | 'D' | 'F'
  sheets:        SheetReadiness[]
  missingSheets: string[]      // required sheets not found at all
  suggestions:   string[]      // human-readable improvement hints
  canActivate:   boolean       // true if enough data to override mock
}

// ─── Store record ─────────────────────────────────────────────────────────────

export interface WorkbookImportRecord {
  id:            string
  fileName:      string
  importedAt:    string
  readiness:     ReadinessReport
  parsed:        ParsedWorkbook
  derived:       DerivedKPIs
  generatedAlerts:    GeneratedAlert[]
  generatedDecisions: GeneratedDecision[]
}
