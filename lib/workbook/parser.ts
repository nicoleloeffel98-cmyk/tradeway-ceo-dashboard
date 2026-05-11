/**
 * lib/workbook/parser.ts
 * ──────────────────────────────────────────────────────────────────────────
 * Parses an XLSX workbook buffer into typed row arrays using fixed sheet names.
 * No manual mapping step — sheet names must match the Tradeway standard exactly.
 */

import * as XLSX from 'xlsx'
import {
  SHEET_NAMES,
  SHEET_COLUMN_MAP,
  FINANCE_METRIC_ALIASES,
  PEOPLE_METRIC_ALIASES,
  type ColSpec,
} from './schema'
import type {
  ParsedWorkbook,
  BDRow, SalesRow, FinanceRow, OperationsRow,
  ClientRow, PeopleRow, AlertRow, DecisionRow, ScenarioRow,
} from './types'
import type { RAGStatus } from '@/lib/utils/rag'

// ─── Low-level helpers ────────────────────────────────────────────────────────

type RawRow = Record<string, unknown>

/** Find a value in a row by trying multiple header aliases (case-insensitive trim). */
function pick(row: RawRow, aliases: string[]): unknown {
  const keys = Object.keys(row)
  for (const alias of aliases) {
    const lower = alias.toLowerCase().trim()
    const match = keys.find((k) => k.trim().toLowerCase() === lower)
    if (match !== undefined) return row[match]
  }
  return undefined
}

/** Find the spec for a column by key. */
function spec(cols: ColSpec[], key: string): ColSpec | undefined {
  return cols.find((c) => c.key === key)
}

/** Convert any raw value to a number. Strips ZAR/currency formatting. */
function toNum(raw: unknown): number | null {
  if (raw === null || raw === undefined || raw === '') return null
  if (typeof raw === 'number') return raw
  const str = String(raw).replace(/[R,\s%]/g, '')
  const n = parseFloat(str)
  return isNaN(n) ? null : n
}

/** Convert raw value to trimmed string, null if empty. */
function toStr(raw: unknown): string | null {
  if (raw === null || raw === undefined) return null
  const s = String(raw).trim()
  return s || null
}

/** Convert raw churn risk text to RAGStatus. */
function toRAG(raw: unknown): RAGStatus {
  const s = String(raw ?? '').toLowerCase().trim()
  if (s === 'red'   || s.includes('high'))              return 'red'
  if (s === 'amber' || s.includes('medium') || s.includes('moderate')) return 'amber'
  if (s === 'green' || s.includes('low'))               return 'green'
  return 'neutral'
}

/** Convert trend text. */
function toTrend(raw: unknown): 'improving' | 'stable' | 'declining' {
  const s = String(raw ?? '').toLowerCase().trim()
  if (s.includes('improv') || s === 'up' || s.includes('positive')) return 'improving'
  if (s.includes('declin') || s === 'down' || s.includes('negative')) return 'declining'
  return 'stable'
}

/** Convert deal stage text. */
function toDealStage(raw: unknown): BDRow['stage'] {
  const s = String(raw ?? '').toLowerCase().trim().replace(/[\s_-]+/g, '_')
  if (s.includes('prospect'))    return 'prospect'
  if (s.includes('qualif'))      return 'qualified'
  if (s.includes('proposal'))    return 'proposal'
  if (s.includes('negoti'))      return 'negotiation'
  if (s.includes('won') || s.includes('closed_won')) return 'closed_won'
  if (s.includes('lost') || s.includes('closed_lost')) return 'closed_lost'
  return 'prospect'
}

/** Convert alert severity. */
function toSeverity(raw: unknown): 'critical' | 'warning' | 'info' {
  const s = String(raw ?? '').toLowerCase().trim()
  if (s.includes('crit') || s.includes('high'))  return 'critical'
  if (s.includes('warn') || s.includes('med'))   return 'warning'
  return 'info'
}

/** Convert decision priority. */
function toPriority(raw: unknown): 'urgent' | 'high' | 'normal' {
  const s = String(raw ?? '').toLowerCase().trim()
  if (s.includes('urg') || s.includes('crit'))   return 'urgent'
  if (s.includes('high'))                        return 'high'
  return 'normal'
}

/** Convert finance metric name to canonical key via alias matching. */
export function matchFinanceMetric(metricName: string): string | null {
  const lower = metricName.toLowerCase().trim()
  for (const [key, aliases] of Object.entries(FINANCE_METRIC_ALIASES)) {
    if (aliases.some((a) => a.toLowerCase() === lower)) return key
    // Fuzzy: contains check
    if (aliases.some((a) => lower.includes(a.toLowerCase()) || a.toLowerCase().includes(lower))) return key
  }
  return null
}

/** Convert people metric name to canonical key via alias matching. */
export function matchPeopleMetric(metricName: string): string | null {
  const lower = metricName.toLowerCase().trim()
  for (const [key, aliases] of Object.entries(PEOPLE_METRIC_ALIASES)) {
    if (aliases.some((a) => a.toLowerCase() === lower)) return key
    if (aliases.some((a) => lower.includes(a.toLowerCase()) || a.toLowerCase().includes(lower))) return key
  }
  return null
}

// ─── Sheet parsers ────────────────────────────────────────────────────────────

function parseBD(rows: RawRow[]): BDRow[] {
  const cols = SHEET_COLUMN_MAP[SHEET_NAMES.BD]
  const result: BDRow[] = []
  for (const row of rows) {
    const client = toStr(pick(row, spec(cols, 'client')!.headers))
    if (!client) continue
    const stage     = toDealStage(pick(row, spec(cols, 'stage')!.headers))
    const value     = toNum(pick(row, spec(cols, 'value')!.headers))
    const prob      = toNum(pick(row, spec(cols, 'probability')!.headers))
    if (value === null || prob === null) continue

    result.push({
      client,
      stage,
      value,
      probability:  prob,
      sector:       toStr(pick(row, spec(cols, 'sector')!.headers)) ?? undefined,
      closeDate:    toStr(pick(row, spec(cols, 'closeDate')!.headers)) ?? undefined,
      owner:        toStr(pick(row, spec(cols, 'owner')!.headers)) ?? undefined,
      daysInStage:  toNum(pick(row, spec(cols, 'daysInStage')!.headers)) ?? undefined,
    })
  }
  return result
}

function parseSales(rows: RawRow[]): SalesRow[] {
  const cols = SHEET_COLUMN_MAP[SHEET_NAMES.SALES]
  const result: SalesRow[] = []
  for (const row of rows) {
    const rep    = toStr(pick(row, spec(cols, 'rep')!.headers))
    if (!rep) continue
    const target = toNum(pick(row, spec(cols, 'target')!.headers))
    const actual = toNum(pick(row, spec(cols, 'actual')!.headers))
    if (target === null || actual === null) continue

    const dealsWon   = toNum(pick(row, spec(cols, 'dealsWon')!.headers))
    const dealsTotal = toNum(pick(row, spec(cols, 'dealsTotal')!.headers))
    let   winRate    = toNum(pick(row, spec(cols, 'winRate')!.headers))

    // Derive win rate if not provided
    if (winRate === null && dealsWon !== null && dealsTotal !== null && dealsTotal > 0) {
      winRate = Math.round((dealsWon / dealsTotal) * 100 * 10) / 10
    }

    result.push({
      rep,
      target,
      actual,
      region:      toStr(pick(row, spec(cols, 'region')!.headers)) ?? undefined,
      ytdActual:   toNum(pick(row, spec(cols, 'ytdActual')!.headers)) ?? undefined,
      dealsWon:    dealsWon ?? undefined,
      dealsTotal:  dealsTotal ?? undefined,
      winRate:     winRate ?? undefined,
    })
  }
  return result
}

function parseFinance(rows: RawRow[]): FinanceRow[] {
  const cols = SHEET_COLUMN_MAP[SHEET_NAMES.FINANCE]
  const result: FinanceRow[] = []
  for (const row of rows) {
    const metric = toStr(pick(row, spec(cols, 'metric')!.headers))
    if (!metric) continue
    const value = toNum(pick(row, spec(cols, 'value')!.headers))
    if (value === null) continue

    result.push({
      metric,
      value,
      target:  toNum(pick(row, spec(cols, 'target')!.headers)) ?? undefined,
      unit:    toStr(pick(row, spec(cols, 'unit')!.headers)) ?? undefined,
    })
  }
  return result
}

function parseOperations(rows: RawRow[]): OperationsRow[] {
  const cols = SHEET_COLUMN_MAP[SHEET_NAMES.OPERATIONS]
  const result: OperationsRow[] = []
  for (const row of rows) {
    const region = toStr(pick(row, spec(cols, 'region')!.headers))
    if (!region) continue
    const activations = toNum(pick(row, spec(cols, 'activations')!.headers))
    const ambassadors = toNum(pick(row, spec(cols, 'ambassadors')!.headers))
    const successRate = toNum(pick(row, spec(cols, 'successRate')!.headers))
    if (activations === null || ambassadors === null || successRate === null) continue

    result.push({
      region,
      activations,
      ambassadors,
      successRate,
      noShowRate: toNum(pick(row, spec(cols, 'noShowRate')!.headers)) ?? undefined,
    })
  }
  return result
}

function parseClients(rows: RawRow[]): ClientRow[] {
  const cols = SHEET_COLUMN_MAP[SHEET_NAMES.CLIENTS]
  const result: ClientRow[] = []
  for (const row of rows) {
    const name = toStr(pick(row, spec(cols, 'name')!.headers))
    if (!name) continue
    const nps           = toNum(pick(row, spec(cols, 'nps')!.headers))
    const arr           = toNum(pick(row, spec(cols, 'arr')!.headers))
    const daysToRenewal = toNum(pick(row, spec(cols, 'daysToRenewal')!.headers))
    if (nps === null || arr === null || daysToRenewal === null) continue

    result.push({
      name,
      nps,
      arr,
      daysToRenewal:  Math.round(daysToRenewal),
      churnRisk:      toRAG(pick(row, spec(cols, 'churnRisk')!.headers)),
      trend:          toTrend(pick(row, spec(cols, 'trend')!.headers)),
      sector:         toStr(pick(row, spec(cols, 'sector')!.headers)) ?? undefined,
      lastContact:    toStr(pick(row, spec(cols, 'lastContact')!.headers)) ?? undefined,
    })
  }
  return result
}

function parsePeople(rows: RawRow[]): PeopleRow[] {
  const cols = SHEET_COLUMN_MAP[SHEET_NAMES.PEOPLE]
  const result: PeopleRow[] = []
  for (const row of rows) {
    const metric = toStr(pick(row, spec(cols, 'metric')!.headers))
    if (!metric) continue
    const value = toNum(pick(row, spec(cols, 'value')!.headers))
    if (value === null) continue

    result.push({
      metric,
      value,
      target: toNum(pick(row, spec(cols, 'target')!.headers)) ?? undefined,
    })
  }
  return result
}

function parseAlerts(rows: RawRow[]): AlertRow[] {
  const cols = SHEET_COLUMN_MAP[SHEET_NAMES.ALERTS]
  const result: AlertRow[] = []
  for (const row of rows) {
    const title   = toStr(pick(row, spec(cols, 'title')!.headers))
    const summary = toStr(pick(row, spec(cols, 'summary')!.headers))
    if (!title || !summary) continue

    result.push({
      severity: toSeverity(pick(row, spec(cols, 'severity')!.headers)),
      category: toStr(pick(row, spec(cols, 'category')!.headers)) ?? 'General',
      title,
      summary,
      date:     toStr(pick(row, spec(cols, 'date')!.headers)) ?? undefined,
    })
  }
  return result
}

function parseDecisions(rows: RawRow[]): DecisionRow[] {
  const cols = SHEET_COLUMN_MAP[SHEET_NAMES.DECISIONS]
  const result: DecisionRow[] = []
  for (const row of rows) {
    const title   = toStr(pick(row, spec(cols, 'title')!.headers))
    const context = toStr(pick(row, spec(cols, 'context')!.headers))
    if (!title || !context) continue

    result.push({
      title,
      context,
      priority:       toPriority(pick(row, spec(cols, 'priority')!.headers)),
      deadline:       toStr(pick(row, spec(cols, 'deadline')!.headers)) ?? undefined,
      financialStake: toStr(pick(row, spec(cols, 'financialStake')!.headers)) ?? undefined,
      module:         toStr(pick(row, spec(cols, 'module')!.headers)) ?? undefined,
    })
  }
  return result
}

function parseScenarios(rows: RawRow[]): ScenarioRow[] {
  const cols = SHEET_COLUMN_MAP[SHEET_NAMES.SCENARIOS]
  const result: ScenarioRow[] = []
  for (const row of rows) {
    const label = toStr(pick(row, spec(cols, 'label')!.headers))
    if (!label) continue
    const q1   = toNum(pick(row, spec(cols, 'q1')!.headers))
    const q2   = toNum(pick(row, spec(cols, 'q2')!.headers))
    const q3   = toNum(pick(row, spec(cols, 'q3')!.headers))
    const q4   = toNum(pick(row, spec(cols, 'q4')!.headers))
    const prob = toNum(pick(row, spec(cols, 'probability')!.headers))
    if (q1 === null || q2 === null || q3 === null || q4 === null || prob === null) continue

    const fullYear = toNum(pick(row, spec(cols, 'fullYear')!.headers)) ?? (q1 + q2 + q3 + q4)

    result.push({
      label,
      q1, q2, q3, q4,
      fullYear,
      probability: prob,
      color: toStr(pick(row, spec(cols, 'color')!.headers)) ?? undefined,
    })
  }
  return result
}

// ─── Main parser ──────────────────────────────────────────────────────────────

/**
 * Parse a raw ArrayBuffer (from FileReader) into typed workbook rows.
 * Uses fixed sheet names — no manual mapping required.
 */
export function parseWorkbook(buffer: ArrayBuffer): ParsedWorkbook {
  const wb = XLSX.read(buffer, { type: 'array', cellDates: true })

  const getRows = (sheetName: string): RawRow[] => {
    const ws = wb.Sheets[sheetName]
    if (!ws) return []
    return XLSX.utils.sheet_to_json<RawRow>(ws, { defval: '' })
  }

  const result: ParsedWorkbook = {}

  const bdRows = getRows(SHEET_NAMES.BD)
  if (bdRows.length) result.bd = parseBD(bdRows)

  const salesRows = getRows(SHEET_NAMES.SALES)
  if (salesRows.length) result.sales = parseSales(salesRows)

  const finRows = getRows(SHEET_NAMES.FINANCE)
  if (finRows.length) result.finance = parseFinance(finRows)

  const opsRows = getRows(SHEET_NAMES.OPERATIONS)
  if (opsRows.length) result.operations = parseOperations(opsRows)

  const clientRows = getRows(SHEET_NAMES.CLIENTS)
  if (clientRows.length) result.clients = parseClients(clientRows)

  const peopleRows = getRows(SHEET_NAMES.PEOPLE)
  if (peopleRows.length) result.people = parsePeople(peopleRows)

  const alertRows = getRows(SHEET_NAMES.ALERTS)
  if (alertRows.length) result.alerts = parseAlerts(alertRows)

  const decisionRows = getRows(SHEET_NAMES.DECISIONS)
  if (decisionRows.length) result.decisions = parseDecisions(decisionRows)

  const scenarioRows = getRows(SHEET_NAMES.SCENARIOS)
  if (scenarioRows.length) result.scenarios = parseScenarios(scenarioRows)

  return result
}

/** Return the list of sheet names found in the workbook. */
export function listSheetNames(buffer: ArrayBuffer): string[] {
  const wb = XLSX.read(buffer, { type: 'array' })
  return wb.SheetNames
}
