/**
 * Transformers — convert parsed Excel rows into internal dashboard data types.
 * Each transformer is resilient: it accepts multiple header aliases and
 * returns only fields it successfully extracted (never throws).
 */
import type { RAGStatus } from '@/lib/utils/rag'
import { DOMAIN_SCHEMAS, type DomainKey } from './schemas'

// ─── Output types ────────────────────────────────────────────────────────────

export type ImportedKPIValues = Record<string, number>  // kpiId → value

export interface ImportedClientRow {
  name:          string
  nps:           number
  arr:           number
  churnRisk:     RAGStatus
  daysToRenewal: number
  trend:         'improving' | 'stable' | 'declining'
}

export interface ImportedRegionRow {
  region:       string
  activations:  number
  ambassadors:  number
  successRate:  number
  noShowRate?:  number
}

export interface ImportedData {
  finance?:    ImportedKPIValues
  sales?:      ImportedKPIValues
  bd?:         ImportedKPIValues
  people?:     ImportedKPIValues
  operations?: {
    regions: ImportedRegionRow[]
    kpis:    ImportedKPIValues
  }
  clients?: ImportedClientRow[]
}

// ─── Low-level helpers ───────────────────────────────────────────────────────

type RawRow = Record<string, unknown>

/** Find a value in a row by trying multiple header aliases (case-insensitive). */
function pick(row: RawRow, aliases: string[]): unknown {
  const keys = Object.keys(row)
  for (const alias of aliases) {
    const lower = alias.toLowerCase()
    const match = keys.find((k) => k.trim().toLowerCase() === lower)
    if (match !== undefined) return row[match]
  }
  return undefined
}

/** Convert any raw value to a number. Strips ZAR currency formatting. */
function toNum(raw: unknown): number | null {
  if (raw === null || raw === undefined || raw === '') return null
  if (typeof raw === 'number') return raw
  const str = String(raw).replace(/[R,\s%]/g, '')
  const n = parseFloat(str)
  return isNaN(n) ? null : n
}

/** Convert any raw value to a string, trimmed. */
function toStr(raw: unknown): string | null {
  if (raw === null || raw === undefined) return null
  return String(raw).trim() || null
}

/** Map churn risk text to RAGStatus. */
function toChurnRisk(raw: unknown): RAGStatus {
  const s = String(raw ?? '').toLowerCase()
  if (s.includes('high') || s === 'red')    return 'red'
  if (s.includes('medium') || s.includes('amber')) return 'amber'
  if (s.includes('low') || s === 'green')   return 'green'
  return 'neutral'
}

/** Map trend text. */
function toTrend(raw: unknown): 'improving' | 'stable' | 'declining' {
  const s = String(raw ?? '').toLowerCase()
  if (s.includes('improv') || s.includes('up') || s.includes('positive')) return 'improving'
  if (s.includes('declin') || s.includes('down') || s.includes('negative')) return 'declining'
  return 'stable'
}

/**
 * Derive RAG status for a region from its success rate.
 */
function deriveRegionStatus(successRate: number): RAGStatus {
  if (successRate >= 95) return 'green'
  if (successRate >= 90) return 'amber'
  return 'red'
}

// ─── KPI schema transformer (single-row domains) ─────────────────────────────

/**
 * General transformer for single-row summary sheets (Finance, Sales, BD, People).
 * Takes the first data row and maps column headers to KPI ids.
 */
function transformSingleRow(rows: RawRow[], domainKey: DomainKey): ImportedKPIValues {
  const result: ImportedKPIValues = {}
  const schema = DOMAIN_SCHEMAS[domainKey]
  if (!rows.length) return result

  const row = rows[0]
  for (const col of schema.columns) {
    const raw = pick(row, col.headers)
    const num = toNum(raw)
    if (num !== null) result[col.key] = num
  }
  return result
}

// ─── Domain transformers ─────────────────────────────────────────────────────

export function transformFinanceSheet(rows: RawRow[]): ImportedKPIValues {
  return transformSingleRow(rows, 'finance')
}

export function transformSalesSheet(rows: RawRow[]): ImportedKPIValues {
  return transformSingleRow(rows, 'sales')
}

export function transformBDSheet(rows: RawRow[]): ImportedKPIValues {
  return transformSingleRow(rows, 'bd')
}

export function transformPeopleSheet(rows: RawRow[]): ImportedKPIValues {
  return transformSingleRow(rows, 'people')
}

export function transformOperationsSheet(rows: RawRow[]): ImportedData['operations'] {
  const regions: ImportedRegionRow[] = []
  const kpis: ImportedKPIValues      = {}
  const regionHeaders  = DOMAIN_SCHEMAS.operations.columns.find((c) => c.key === 'region')!.headers
  const actHeaders     = DOMAIN_SCHEMAS.operations.columns.find((c) => c.key === 'activations')!.headers
  const successHeaders = DOMAIN_SCHEMAS.operations.columns.find((c) => c.key === 'successRate')!.headers
  const ambassHeaders  = DOMAIN_SCHEMAS.operations.columns.find((c) => c.key === 'ambassadors')!.headers
  const noShowHeaders  = DOMAIN_SCHEMAS.operations.columns.find((c) => c.key === 'noShowRate')!.headers

  let totalNoShow  = 0
  let noShowCount  = 0

  for (const row of rows) {
    const regionName = toStr(pick(row, regionHeaders))
    if (!regionName) continue
    const activations = toNum(pick(row, actHeaders))  ?? 0
    const successRate = toNum(pick(row, successHeaders)) ?? 0
    const ambassadors = toNum(pick(row, ambassHeaders)) ?? 0
    const noShowRate  = toNum(pick(row, noShowHeaders))

    regions.push({ region: regionName, activations, ambassadors, successRate, noShowRate: noShowRate ?? undefined })

    if (noShowRate !== null) {
      totalNoShow += noShowRate
      noShowCount++
    }
  }

  // Aggregate KPIs from regional data
  if (regions.length) {
    kpis['ops-activations-mtd'] = regions.reduce((s, r) => s + r.activations, 0)
    const avgSuccess = regions.reduce((s, r) => s + r.successRate, 0) / regions.length
    kpis['ops-success-rate'] = Math.round(avgSuccess * 10) / 10
    const totalAmbassadors = regions.reduce((s, r) => s + r.ambassadors, 0)
    if (totalAmbassadors > 0) {
      const totalActive = regions.reduce((s, r) => s + r.activations, 0)
      kpis['ops-ambassador-util'] = Math.round((totalActive / totalAmbassadors) * 100)
    }
  }
  if (noShowCount > 0) {
    kpis['ops-no-show-rate'] = Math.round((totalNoShow / noShowCount) * 10) / 10
  }

  return { regions, kpis }
}

export function transformClientsSheet(rows: RawRow[]): ImportedClientRow[] {
  const clients: ImportedClientRow[] = []
  const schema = DOMAIN_SCHEMAS.clients

  const nameHeaders    = schema.columns.find((c) => c.key === 'name')!.headers
  const npsHeaders     = schema.columns.find((c) => c.key === 'nps')!.headers
  const arrHeaders     = schema.columns.find((c) => c.key === 'arr')!.headers
  const churnHeaders   = schema.columns.find((c) => c.key === 'churnRisk')!.headers
  const renewalHeaders = schema.columns.find((c) => c.key === 'daysToRenewal')!.headers
  const trendHeaders   = schema.columns.find((c) => c.key === 'trend')!.headers

  for (const row of rows) {
    const name = toStr(pick(row, nameHeaders))
    if (!name) continue
    const nps           = toNum(pick(row, npsHeaders))  ?? 0
    const arr           = toNum(pick(row, arrHeaders))  ?? 0
    const churnRaw      = pick(row, churnHeaders)
    const daysToRenewal = toNum(pick(row, renewalHeaders)) ?? 90
    const trendRaw      = pick(row, trendHeaders)

    clients.push({
      name,
      nps,
      arr,
      churnRisk:     toChurnRisk(churnRaw),
      daysToRenewal: Math.round(daysToRenewal),
      trend:         toTrend(trendRaw),
    })
  }

  return clients
}

// ─── Master dispatcher ───────────────────────────────────────────────────────

export function transformSheet(domainKey: DomainKey, rows: RawRow[]): ImportedData {
  switch (domainKey) {
    case 'finance':    return { finance:    transformFinanceSheet(rows) }
    case 'sales':      return { sales:      transformSalesSheet(rows) }
    case 'bd':         return { bd:         transformBDSheet(rows) }
    case 'people':     return { people:     transformPeopleSheet(rows) }
    case 'operations': return { operations: transformOperationsSheet(rows) }
    case 'clients':    return { clients:    transformClientsSheet(rows) }
  }
}

/**
 * Merge imported KPI values into a mock KPI array.
 * Only overrides the `value` field; preserves all other KPI properties.
 */
export function mergeImportedKPIs<T extends { id: string; value: number }>(
  mockKPIs: T[],
  imported?: ImportedKPIValues,
): T[] {
  if (!imported || Object.keys(imported).length === 0) return mockKPIs
  return mockKPIs.map((kpi) =>
    kpi.id in imported ? { ...kpi, value: imported[kpi.id] } : kpi,
  )
}

/**
 * Derive RegionalActivation status from imported data.
 */
export function deriveRegionalStatus(successRate: number): RAGStatus {
  return deriveRegionStatus(successRate)
}
