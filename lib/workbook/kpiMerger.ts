/**
 * lib/workbook/kpiMerger.ts
 * ──────────────────────────────────────────────────────────────────────────
 * Maps derived workbook KPI values onto the mock KPI array for each module.
 * This replaces the old mergeImportedKPIs / ImportedKPIValues pattern.
 *
 * Each module calls mergeWorkbookKPIs(mockKPIs, derived?.finance) and the
 * function knows which field maps to which KPI id.
 */

import type { KPI } from '@/lib/types'
import type {
  DerivedBDKPIs, DerivedSalesKPIs, DerivedFinanceKPIs,
  DerivedOperationsKPIs, DerivedClientKPIs, DerivedPeopleKPIs,
} from './types'

type KPIOverride = Record<string, number>

/** Apply a flat {kpiId → value} map onto a mock KPI array, preserving all other fields. */
function applyOverrides<T extends KPI>(mockKPIs: T[], overrides: KPIOverride): T[] {
  if (!Object.keys(overrides).length) return mockKPIs
  return mockKPIs.map((kpi) =>
    kpi.id in overrides ? { ...kpi, value: overrides[kpi.id] } : kpi,
  )
}

// ─── Finance ──────────────────────────────────────────────────────────────────

export function mergeFinanceKPIs<T extends KPI>(
  mockKPIs: T[],
  derived?: DerivedFinanceKPIs,
): T[] {
  if (!derived) return mockKPIs
  const overrides: KPIOverride = {}
  if (derived.cashBalance)    overrides['fin-cash']          = derived.cashBalance
  if (derived.dso)            overrides['fin-dso']           = derived.dso
  if (derived.overdueAR)      overrides['fin-overdue-ar']    = derived.overdueAR
  if (derived.grossMarginPct) overrides['fin-gross-margin']  = derived.grossMarginPct
  if (derived.revenueMTD && derived.revenueTarget && derived.revenueTarget > 0) {
    const variance = ((derived.revenueMTD - derived.revenueTarget) / derived.revenueTarget) * 100
    overrides['fin-budget-variance'] = Math.round(variance * 10) / 10
  }
  return applyOverrides(mockKPIs, overrides)
}

// ─── Sales ────────────────────────────────────────────────────────────────────

export function mergeSalesKPIs<T extends KPI>(
  mockKPIs: T[],
  derived?: DerivedSalesKPIs,
): T[] {
  if (!derived) return mockKPIs
  const overrides: KPIOverride = {}
  if (derived.revenueMTD)       overrides['sales-revenue-mtd'] = derived.revenueMTD
  if (derived.winRate)          overrides['sales-win-rate']    = derived.winRate
  if (derived.forecastFullMonth) overrides['sales-forecast']   = derived.forecastFullMonth
  return applyOverrides(mockKPIs, overrides)
}

// ─── Business Development ─────────────────────────────────────────────────────

export function mergeBDKPIs<T extends KPI>(
  mockKPIs: T[],
  derived?: DerivedBDKPIs,
): T[] {
  if (!derived) return mockKPIs
  const overrides: KPIOverride = {}
  if (derived.totalPipeline)     overrides['bd-total-pipeline']     = derived.totalPipeline
  if (derived.winRate)           overrides['bd-win-rate']           = derived.winRate
  if (derived.openOpportunities) overrides['bd-open-opportunities'] = derived.openOpportunities
  if (derived.weightedPipeline)  overrides['bd-weighted-pipeline']  = derived.weightedPipeline
  return applyOverrides(mockKPIs, overrides)
}

// ─── Operations ───────────────────────────────────────────────────────────────

export function mergeOpsKPIs<T extends KPI>(
  mockKPIs: T[],
  derived?: DerivedOperationsKPIs,
): T[] {
  if (!derived) return mockKPIs
  const overrides: KPIOverride = {}
  if (derived.totalActivationsMTD) overrides['ops-activations-mtd']  = derived.totalActivationsMTD
  if (derived.avgSuccessRate)      overrides['ops-success-rate']      = derived.avgSuccessRate
  if (derived.avgNoShowRate)       overrides['ops-no-show-rate']      = derived.avgNoShowRate
  if (derived.ambassadorUtil)      overrides['ops-ambassador-util']   = derived.ambassadorUtil
  return applyOverrides(mockKPIs, overrides)
}

// ─── People ───────────────────────────────────────────────────────────────────

export function mergePeopleKPIs<T extends KPI>(
  mockKPIs: T[],
  derived?: DerivedPeopleKPIs,
): T[] {
  if (!derived) return mockKPIs
  const overrides: KPIOverride = {}
  if (derived.totalHeadcount) overrides['ppl-headcount']      = derived.totalHeadcount
  if (derived.capacityUtil)   overrides['ppl-capacity-util']  = derived.capacityUtil
  if (derived.attritionRate)  overrides['ppl-attrition']      = derived.attritionRate
  if (derived.openRoles)      overrides['ppl-open-roles']     = derived.openRoles
  return applyOverrides(mockKPIs, overrides)
}

// ─── Client KPI summary (for KPICard widgets, not the client list) ────────────

export function mergeClientSummary(
  mockSummary: { avgNps: number; atRisk: number; renewingIn90d: number },
  derived?: DerivedClientKPIs,
) {
  if (!derived) return mockSummary
  return {
    avgNps:         derived.avgNPS,
    atRisk:         derived.atRisk,
    renewingIn90d:  derived.renewingIn90d,
  }
}
