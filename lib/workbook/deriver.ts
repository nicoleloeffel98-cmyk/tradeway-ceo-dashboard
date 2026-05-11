/**
 * lib/workbook/deriver.ts
 * ──────────────────────────────────────────────────────────────────────────
 * KPI derivation engine — computes dashboard KPIs from operational row data.
 * All calculations are done here; no raw rows reach the UI layer.
 */

import { matchFinanceMetric, matchPeopleMetric } from './parser'
import type {
  ParsedWorkbook, DerivedKPIs,
  DerivedBDKPIs, DerivedSalesKPIs, DerivedFinanceKPIs,
  DerivedOperationsKPIs, DerivedClientKPIs, DerivedPeopleKPIs,
} from './types'
import type { RAGStatus } from '@/lib/utils/rag'

// ─── RAG thresholds ───────────────────────────────────────────────────────────

function regionStatus(successRate: number): RAGStatus {
  if (successRate >= 95) return 'green'
  if (successRate >= 90) return 'amber'
  return 'red'
}

// ─── BD derivation ────────────────────────────────────────────────────────────

function deriveBD(rows: ParsedWorkbook['bd']): DerivedBDKPIs | undefined {
  if (!rows?.length) return undefined

  const openDeals    = rows.filter((r) => r.stage !== 'closed_won' && r.stage !== 'closed_lost')
  const closedWon    = rows.filter((r) => r.stage === 'closed_won')
  const closedDeals  = rows.filter((r) => r.stage === 'closed_won' || r.stage === 'closed_lost')

  const totalPipeline    = openDeals.reduce((s, r) => s + r.value, 0)
  const weightedPipeline = openDeals.reduce((s, r) => s + r.value * (r.probability / 100), 0)
  const negotiationValue = openDeals.filter((r) => r.stage === 'negotiation').reduce((s, r) => s + r.value, 0)
  const proposalValue    = openDeals.filter((r) => r.stage === 'proposal').reduce((s, r) => s + r.value, 0)

  const winRate = closedDeals.length > 0
    ? Math.round((closedWon.length / closedDeals.length) * 100 * 10) / 10
    : 0

  return {
    totalPipeline,
    openOpportunities: openDeals.length,
    winRate,
    weightedPipeline:  Math.round(weightedPipeline),
    negotiationValue,
    proposalValue,
  }
}

// ─── Sales derivation ─────────────────────────────────────────────────────────

function deriveSales(rows: ParsedWorkbook['sales']): DerivedSalesKPIs | undefined {
  if (!rows?.length) return undefined

  const revenueMTD      = rows.reduce((s, r) => s + r.actual, 0)
  const revenueTarget   = rows.reduce((s, r) => s + r.target, 0)
  const attainmentPct   = revenueTarget > 0
    ? Math.round((revenueMTD / revenueTarget) * 100 * 10) / 10
    : 0

  // Win rate: average of provided rates, or derive from totals
  const repsWithWinRate = rows.filter((r) => r.winRate !== undefined)
  let winRate = 0
  if (repsWithWinRate.length) {
    winRate = Math.round(
      repsWithWinRate.reduce((s, r) => s + (r.winRate ?? 0), 0) / repsWithWinRate.length * 10
    ) / 10
  } else {
    const totalWon   = rows.reduce((s, r) => s + (r.dealsWon   ?? 0), 0)
    const totalDeals = rows.reduce((s, r) => s + (r.dealsTotal ?? 0), 0)
    if (totalDeals > 0) winRate = Math.round((totalWon / totalDeals) * 100 * 10) / 10
  }

  // Project full-month forecast: scale actual by days elapsed
  const today       = new Date()
  const daysElapsed = today.getDate()
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
  const forecastFullMonth = daysElapsed > 0
    ? Math.round((revenueMTD / daysElapsed) * daysInMonth)
    : revenueMTD

  const topReps = [...rows]
    .map((r) => ({
      name:          r.rep,
      actual:        r.actual,
      attainmentPct: r.target > 0 ? Math.round((r.actual / r.target) * 100 * 10) / 10 : 0,
      region:        r.region ?? '',
    }))
    .sort((a, b) => b.attainmentPct - a.attainmentPct)
    .slice(0, 5)

  return { revenueMTD, revenueTarget, attainmentPct, forecastFullMonth, winRate, topReps }
}

// ─── Finance derivation ───────────────────────────────────────────────────────

function deriveFinance(rows: ParsedWorkbook['finance']): DerivedFinanceKPIs | undefined {
  if (!rows?.length) return undefined

  const lookup: Record<string, number> = {}
  for (const row of rows) {
    const key = matchFinanceMetric(row.metric)
    if (key) lookup[key] = row.value
  }

  return {
    cashBalance:    lookup['cashBalance']    ?? 0,
    dso:            lookup['dso']            ?? 0,
    overdueAR:      lookup['overdueAR']      ?? 0,
    revenueMTD:     lookup['revenueMTD']     ?? 0,
    revenueTarget:  lookup['revenueTarget']  ?? 0,
    grossMarginPct: lookup['grossMarginPct'] ?? 0,
    cashRunwayDays: lookup['cashRunwayDays'] ?? 0,
  }
}

// ─── Operations derivation ────────────────────────────────────────────────────

function deriveOperations(rows: ParsedWorkbook['operations']): DerivedOperationsKPIs | undefined {
  if (!rows?.length) return undefined

  const totalActivationsMTD = rows.reduce((s, r) => s + r.activations, 0)
  const avgSuccessRate = rows.length > 0
    ? Math.round(rows.reduce((s, r) => s + r.successRate, 0) / rows.length * 10) / 10
    : 0

  const rowsWithNoShow = rows.filter((r) => r.noShowRate !== undefined)
  const avgNoShowRate  = rowsWithNoShow.length > 0
    ? Math.round(rowsWithNoShow.reduce((s, r) => s + (r.noShowRate ?? 0), 0) / rowsWithNoShow.length * 10) / 10
    : 0

  const totalAmbassadors = rows.reduce((s, r) => s + r.ambassadors, 0)
  const ambassadorUtil   = totalAmbassadors > 0
    ? Math.round((totalActivationsMTD / totalAmbassadors) * 100 * 10) / 10
    : 0

  const regions = rows.map((r) => ({
    region:       r.region,
    activations:  r.activations,
    ambassadors:  r.ambassadors,
    successRate:  r.successRate,
    noShowRate:   r.noShowRate ?? 0,
    status:       regionStatus(r.successRate),
  }))

  return {
    totalActivationsMTD,
    avgSuccessRate,
    avgNoShowRate,
    ambassadorUtil,
    regionCount: rows.length,
    regions,
  }
}

// ─── Client derivation ────────────────────────────────────────────────────────

function deriveClients(rows: ParsedWorkbook['clients']): DerivedClientKPIs | undefined {
  if (!rows?.length) return undefined

  const avgNPS      = Math.round(rows.reduce((s, r) => s + r.nps, 0) / rows.length * 10) / 10
  const atRisk      = rows.filter((r) => r.churnRisk === 'red' || r.churnRisk === 'amber').length
  const renewingIn90d = rows.filter((r) => r.daysToRenewal <= 90).length
  const totalARR    = rows.reduce((s, r) => s + r.arr, 0)

  return { avgNPS, atRisk, renewingIn90d, totalARR, clients: rows }
}

// ─── People derivation ────────────────────────────────────────────────────────

function derivePeople(rows: ParsedWorkbook['people']): DerivedPeopleKPIs | undefined {
  if (!rows?.length) return undefined

  const lookup: Record<string, number> = {}
  for (const row of rows) {
    const key = matchPeopleMetric(row.metric)
    if (key) lookup[key] = row.value
  }

  // Derive total headcount from active ambassadors if not provided
  const totalHeadcount = lookup['totalHeadcount'] ?? lookup['activeAmbassadors'] ?? 0

  return {
    totalHeadcount,
    capacityUtil:  lookup['capacityUtil']      ?? 0,
    attritionRate: lookup['attritionRate']     ?? 0,
    openRoles:     lookup['openRoles']         ?? 0,
  }
}

// ─── Master deriver ───────────────────────────────────────────────────────────

export function deriveKPIs(parsed: ParsedWorkbook): DerivedKPIs {
  return {
    bd:         deriveBD(parsed.bd),
    sales:      deriveSales(parsed.sales),
    finance:    deriveFinance(parsed.finance),
    operations: deriveOperations(parsed.operations),
    clients:    deriveClients(parsed.clients),
    people:     derivePeople(parsed.people),
  }
}
