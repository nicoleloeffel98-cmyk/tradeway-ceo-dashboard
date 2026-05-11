/**
 * lib/workbook/validator.ts
 * ──────────────────────────────────────────────────────────────────────────
 * Workbook readiness scoring. Examines parsed rows against schema specs
 * and returns a structured ReadinessReport with score, grade, and hints.
 */

import {
  SHEET_NAMES, SHEET_COLUMN_MAP, REQUIRED_SHEETS, OPTIONAL_SHEETS,
  type SheetName,
} from './schema'
import type { ParsedWorkbook, ReadinessReport, SheetReadiness } from './types'
import * as XLSX from 'xlsx'

// ─── Sheet scoring ────────────────────────────────────────────────────────────

/** Score a single sheet out of 100. */
function scoreSheet(
  sheetName: SheetName,
  rows:      Record<string, unknown>[] | undefined,
  required:  boolean,
): SheetReadiness {
  const cols = SHEET_COLUMN_MAP[sheetName]

  if (!rows || rows.length === 0) {
    return {
      sheetName,
      present:         false,
      required,
      rowCount:        0,
      missingRequired: cols.filter((c) => c.required).map((c) => c.key),
      warnings:        [],
      score:           0,
    }
  }

  // Detect which columns are present by checking the first row's keys
  const firstRowKeys = Object.keys(rows[0]).map((k) => k.trim().toLowerCase())

  const missingRequired: string[] = []
  const warnings:        string[] = []

  for (const col of cols) {
    const found = col.headers.some((h) => firstRowKeys.includes(h.toLowerCase().trim()))
    if (!found) {
      if (col.required) {
        missingRequired.push(col.headers[0])  // use primary header name in report
      } else {
        warnings.push(`Optional column "${col.headers[0]}" not found`)
      }
    }
  }

  // Data quality checks
  if (rows.length < 1) warnings.push('Sheet is empty')
  if (rows.length < 3 && required) warnings.push('Very few rows — results may not be representative')

  // Score: presence = 50pts, zero missing-required = 40pts, data quality = 10pts
  const requiredCols = cols.filter((c) => c.required).length
  const missingPenalty = requiredCols > 0 ? (missingRequired.length / requiredCols) * 40 : 0
  const qualityScore   = warnings.filter((w) => !w.includes('Optional')).length === 0 ? 10 : 5

  const score = Math.max(0, Math.round(50 + (40 - missingPenalty) + qualityScore))

  return {
    sheetName,
    present:  true,
    required,
    rowCount: rows.length,
    missingRequired,
    warnings,
    score,
  }
}

// ─── Row extractor (from ParsedWorkbook) ──────────────────────────────────────

function extractRows(parsed: ParsedWorkbook, sheetName: SheetName): Record<string, unknown>[] | undefined {
  switch (sheetName) {
    case SHEET_NAMES.BD:         return parsed.bd         as Record<string, unknown>[] | undefined
    case SHEET_NAMES.SALES:      return parsed.sales      as Record<string, unknown>[] | undefined
    case SHEET_NAMES.FINANCE:    return parsed.finance    as Record<string, unknown>[] | undefined
    case SHEET_NAMES.OPERATIONS: return parsed.operations as Record<string, unknown>[] | undefined
    case SHEET_NAMES.CLIENTS:    return parsed.clients    as Record<string, unknown>[] | undefined
    case SHEET_NAMES.PEOPLE:     return parsed.people     as Record<string, unknown>[] | undefined
    case SHEET_NAMES.ALERTS:     return parsed.alerts     as Record<string, unknown>[] | undefined
    case SHEET_NAMES.DECISIONS:  return parsed.decisions  as Record<string, unknown>[] | undefined
    case SHEET_NAMES.SCENARIOS:  return parsed.scenarios  as Record<string, unknown>[] | undefined
    default:                     return undefined
  }
}

// ─── Alternate: score directly from raw XLSX buffer ──────────────────────────

/**
 * Score from raw column headers in the workbook without needing parsed rows.
 * This is used in WorkbookUploader to show readiness before full parse.
 */
export function scoreFromBuffer(buffer: ArrayBuffer): ReadinessReport {
  const wb = XLSX.read(buffer, { type: 'array' })

  // Convert each sheet to rows for scoring
  const tempParsed: Partial<Record<SheetName, Record<string, unknown>[]>> = {}
  for (const name of wb.SheetNames) {
    if (Object.values(SHEET_NAMES).includes(name as SheetName)) {
      const ws   = wb.Sheets[name]
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: '' })
      tempParsed[name as SheetName] = rows
    }
  }

  return scoreSheets(tempParsed)
}

// ─── Master readiness report ──────────────────────────────────────────────────

/** Build a readiness report from parsed typed rows. */
export function scoreFromParsed(parsed: ParsedWorkbook): ReadinessReport {
  const raw: Partial<Record<SheetName, Record<string, unknown>[]>> = {}
  for (const sheetName of [...REQUIRED_SHEETS, ...OPTIONAL_SHEETS]) {
    const rows = extractRows(parsed, sheetName)
    if (rows) raw[sheetName] = rows
  }
  return scoreSheets(raw)
}

function scoreSheets(
  raw: Partial<Record<SheetName, Record<string, unknown>[]>>,
): ReadinessReport {
  const sheets: SheetReadiness[] = []

  for (const sheetName of REQUIRED_SHEETS) {
    sheets.push(scoreSheet(sheetName, raw[sheetName], true))
  }
  for (const sheetName of OPTIONAL_SHEETS) {
    sheets.push(scoreSheet(sheetName, raw[sheetName], false))
  }

  const missingSheets = REQUIRED_SHEETS.filter((s) => !raw[s]?.length)

  // Overall score: weighted average
  // Required sheets: 80% weight (split evenly), optional: 20%
  const requiredSheets  = sheets.filter((s) => s.required)
  const optionalSheets  = sheets.filter((s) => !s.required)

  const requiredScore = requiredSheets.length > 0
    ? requiredSheets.reduce((s, sh) => s + sh.score, 0) / requiredSheets.length
    : 0
  const optionalScore = optionalSheets.filter((s) => s.present).length > 0
    ? optionalSheets.filter((s) => s.present).reduce((s, sh) => s + sh.score, 0) /
      optionalSheets.filter((s) => s.present).length
    : 0

  const rawScore    = optionalSheets.some((s) => s.present)
    ? Math.round(requiredScore * 0.8 + optionalScore * 0.2)
    : Math.round(requiredScore)

  const overallScore = Math.min(100, rawScore)

  const grade: ReadinessReport['grade'] =
    overallScore >= 90 ? 'A' :
    overallScore >= 75 ? 'B' :
    overallScore >= 60 ? 'C' :
    overallScore >= 40 ? 'D' : 'F'

  // Suggestions
  const suggestions: string[] = []
  if (missingSheets.length > 0) {
    suggestions.push(`Add missing required sheets: ${missingSheets.join(', ')}`)
  }
  sheets.filter((s) => s.present && s.missingRequired.length > 0).forEach((s) => {
    suggestions.push(`"${s.sheetName}": add required columns — ${s.missingRequired.join(', ')}`)
  })
  if (!raw[SHEET_NAMES.ALERTS]?.length) {
    suggestions.push('Optional: add "Executive Alerts" sheet to include manual alerts')
  }
  if (!raw[SHEET_NAMES.DECISIONS]?.length) {
    suggestions.push('Optional: add "Decision Queue" sheet to pre-populate CEO decisions')
  }

  const presentRequired = requiredSheets.filter((s) => s.present).length
  const canActivate     = presentRequired >= 3 && overallScore >= 40

  return { overallScore, grade, sheets, missingSheets, suggestions, canActivate }
}
