import type { KPI, CashFlowPoint, ARAgingBucket, RevenueVsBudgetPoint } from '@/lib/types'

// ─── Source routing ──────────────────────────────────────────────────────────

export type FinanceDataSource = 'mock' | 'xero' | 'sage' | 'sap' | 'csv' | 'supabase'

export type FinanceErrorCode =
  | 'not_configured'
  | 'auth_failed'
  | 'network_error'
  | 'parse_error'
  | 'validation_error'

export class FinanceSourceError extends Error {
  code: FinanceErrorCode
  source: FinanceDataSource

  constructor(code: FinanceErrorCode, source: FinanceDataSource, message?: string) {
    super(message ?? `Finance source "${source}" error: ${code}`)
    this.name    = 'FinanceSourceError'
    this.code    = code
    this.source  = source
  }
}

// ─── Normalised shape (source-agnostic) ─────────────────────────────────────

export interface NormalisedFinanceData {
  revenueYTD:      number
  revenueTarget:   number
  ebitdaMargin:    number
  ebitdaTarget:    number
  grossMargin:     number
  grossMarginTarget: number
  cashOnHand:      number
  cashTarget:      number
  dso:             number
  dsoTarget:       number
  overdueAR:       number
  overdueARTarget: number
  budgetVariance:  number
  opexRatio:       number
  opexRatioTarget: number
  cashFlow:        CashFlowPoint[]
  arBuckets:       ARAgingBucket[]
  revenueVsBudget: RevenueVsBudgetPoint[]
  periodLabel:     string
  fetchedAt:       string
}

// ─── Service result ──────────────────────────────────────────────────────────

export interface FinanceServiceResult {
  data:       NormalisedFinanceData
  source:     FinanceDataSource
  isFallback: boolean
  warnings:   string[]
  fetchedAt:  string
}

// ─── Raw source shapes (extend as sources are integrated) ────────────────────

// Xero P&L export shape (CSV or API)
export interface XeroRawPL {
  Period:            string
  'Total Revenue':   string
  'Gross Profit':    string
  EBITDA:            string
  'Operating Costs': string
}

// Xero Balance Sheet
export interface XeroRawBS {
  Period:           string
  'Cash and Bank':  string
  'Trade Debtors':  string
}

// Sage export shape
export interface SageRawExport {
  period:          string
  net_revenue:     number
  gross_profit:    number
  operating_profit: number
  cash_balance:    number
  debtors_total:   number
}

// SAP FI extract shape
export interface SapRawFI {
  GJAHR:   string   // fiscal year
  MONAT:   string   // period (month)
  UMSAV:   number   // net revenue
  ROHERTRAG: number // gross profit
  EBITDA:  number
  CASH:    number
  FORDER:  number   // AR balance
}
