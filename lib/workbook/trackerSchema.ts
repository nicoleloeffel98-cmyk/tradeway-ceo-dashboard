/**
 * lib/workbook/trackerSchema.ts
 * ──────────────────────────────────────────────────────────────────────────
 * Schema derived from the ACTUAL Tradeway GP Tracker (Tracker 11052026.xlsx).
 * Sheet name: "% Summary TWP"
 * Do NOT invent new sheets or columns — this mirrors the real file exactly.
 *
 * ─── Sheet layout ────────────────────────────────────────────────────────────
 * Row  0:  Header ("TRADEWAY")
 * Row  1:  Annual GP target per month (col C = monthly target)
 * Row  2:  Header repeat
 * Row  3:  Column headers: BUDGET/Q | ACTUAL | FORECAST
 * Row  4:  Q1: budget, actual, forecast
 * Row  5:  Q2: budget, actual, forecast
 * Row  6:  Q3: budget, actual, forecast
 * Row  7:  Q4: budget, actual, forecast
 * Row  8:  TOTAL: budget, actual, forecast
 *
 * Row 10:  AVG GP / MONTH
 * Row 11:  PR AV GP / MONTH (previous year average?)
 * Row 13:  TW Difference PM
 * Row 14:  Difference values
 *
 * Row 15:  Date row — col A="ACTUAL", cols B-M = Excel serial dates (Mar–Feb)
 * Row 16:  Label row — col A="ACTUAL", cols B-M = "GP", col N = "TOTAL"
 * Rows 17-37: Per-rep ACTUAL monthly GP + total (col N)
 * Row 38:  Total ACTUAL monthly GP + total
 * Row 39:  % TO BUDGET (col B = Q1 %, col C = Q2 %)
 *
 * Row 41:  Label row — PROJECTED
 * Rows 42-62: Per-rep PROJECTED monthly GP + total
 * Row 63:  Total PROJECTED monthly GP + total
 * Row 64:  % TO BUDGET (projected)
 *
 * Row 67:  Label row — VARIANCES
 * Rows 68-88: Per-rep VARIANCE (projected - actual)
 * Row 89:  Total VARIANCE
 *
 * Row 93:  QUARTERLY TARGET section header
 * Row 94:  Q1: target, actual, projected
 * Row 95:  Q2: ...
 * Row 96:  Q3: ...
 * Row 97:  Q4: ...
 *
 * Row 102: Per-rep quarterly header
 *          cols: name | Q1 | Q2 | Q3 | Q4 | Total | Target | % Achievement | Difference | ...
 * Rows 103+: Per-rep quarterly breakdown
 *
 * Rows 126+: Meeting notes (date columns = free text, not parsed)
 */

/** The one and only sheet name in the Tradeway GP Tracker */
export const TRACKER_SHEET_NAME = '% Summary TWP'

/** Row indices (0-based) for fixed structural rows */
export const ROW = {
  ANNUAL_TARGET:    1,   // col C = monthly target amount
  Q_HEADER:         3,   // BUDGET/Q | ACTUAL | FORECAST labels
  Q1:               4,
  Q2:               5,
  Q3:               6,
  Q4:               7,
  TOTAL:            8,
  DATE_HEADER:      15,  // Excel serial dates in cols B–M
  LABEL_ACTUAL:     16,  // "GP" headers
  ACTUAL_FIRST_REP: 17,  // first rep row (actuals)
  ACTUAL_TOTAL:     38,  // total actual GP row
  TO_BUDGET_ACTUAL: 39,
  LABEL_PROJECTED:  41,
  PROJ_FIRST_REP:   42,  // first rep row (projections)
  PROJ_TOTAL:       63,
  TO_BUDGET_PROJ:   64,
  LABEL_VARIANCES:  67,
  VAR_FIRST_REP:    68,
  VAR_TOTAL:        89,
  QUARTERLY_HEADER: 102,
  QUARTERLY_FIRST:  103,
} as const

/** Number of months tracked (March → February = 12) */
export const MONTH_COUNT = 12

/** Column index for totals (0-based, after name col A = 0, months B-M = 1-12) */
export const COL_TOTAL = 13

/** Column index for: name=0, months=1-12, total=13 in rep rows */
export const COL = {
  NAME:     0,
  MONTH_1:  1,   // March
  MONTH_12: 12,  // February (next year)
  TOTAL:    13,
} as const

/** Quarterly per-rep column mapping (row 102 header) */
export const Q_COL = {
  NAME:        0,
  Q1:          1,
  Q2:          2,
  Q3:          3,
  Q4:          4,
  TOTAL:       5,
  TARGET:      6,
  PCT_ACH:     7,
  DIFFERENCE:  8,
} as const

/**
 * Known rep names — used to validate uploads and detect structural drift.
 * Names are trimmed strings exactly as they appear in col A of the actual file.
 */
export const KNOWN_REPS = [
  'Amy Ashburner',
  'Andreas Smit',
  'Gemma Davey',
  'Jill Diedericks',
  'Kallyn Winter',
  'Keshia Roman',
  'Megan Clothier',
  'Megan Klue',
  'Nokwa Ngubane',
  'Penny MacPherson',
  'Sbusiso Ndlovu',
  'Viyashni Solomon',
  'Nicolle De Sousa',
] as const

export type RepName = typeof KNOWN_REPS[number]

/** Month labels (fiscal year starting March) */
export const FISCAL_MONTHS = [
  'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug',
  'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb',
] as const

/**
 * Convert Excel serial date number to a readable month-year label.
 * Excel epoch = 1 Jan 1900. We add 2 for the known Excel leap year bug.
 */
export function excelSerialToMonthLabel(serial: number): string {
  if (!serial || typeof serial !== 'number') return ''
  const d = new Date((serial - 25569) * 86400000)
  return d.toLocaleDateString('en-ZA', { month: 'short', year: '2-digit' })
}

/**
 * Extract the reporting date from a tracker filename.
 * Format: "Tracker DDMMYYYY.xlsx" → Date object
 * e.g. "Tracker 11052026.xlsx" → 11 May 2026
 */
export function dateFromFilename(filename: string): Date | null {
  const match = filename.match(/(\d{2})(\d{2})(\d{4})/)
  if (!match) return null
  const [, dd, mm, yyyy] = match
  return new Date(`${yyyy}-${mm}-${dd}`)
}

/** Format a Date as 'DD MMM YYYY' for display */
export function formatReportingDate(d: Date): string {
  return d.toLocaleDateString('en-ZA', { day: '2-digit', month: 'short', year: 'numeric' })
}

/** Validate that a workbook has the correct sheet */
export function hasTrackerSheet(sheetNames: string[]): boolean {
  return sheetNames.includes(TRACKER_SHEET_NAME)
}
