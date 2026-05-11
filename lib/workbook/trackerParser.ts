/**
 * lib/workbook/trackerParser.ts
 * ──────────────────────────────────────────────────────────────────────────
 * Parses the Tradeway GP Tracker XLSX (single sheet "% Summary TWP")
 * into a typed TrackerSnapshot. Validates structure and populates
 * all derived metrics.
 *
 * The parser is resilient — if a row is not where expected it falls back
 * to scanning nearby rows. Warnings are added but parsing continues.
 */

import * as XLSX from 'xlsx'
import {
  TRACKER_SHEET_NAME,
  ROW, COL, Q_COL, MONTH_COUNT,
  KNOWN_REPS,
  excelSerialToMonthLabel,
  dateFromFilename,
  formatReportingDate,
  hasTrackerSheet,
} from './trackerSchema'
import type { TrackerSnapshot, RepActuals, RepQuarterly } from './trackerTypes'

// ─── Raw row helper ───────────────────────────────────────────────────────────

type RawRows = unknown[][]

function num(v: unknown): number {
  if (typeof v === 'number') return v
  if (typeof v === 'string') return parseFloat(v.replace(/[R,\s%]/g, '')) || 0
  return 0
}

function str(v: unknown): string {
  return typeof v === 'string' ? v.trim() : typeof v === 'number' ? String(v) : ''
}

function isRepName(v: unknown): boolean {
  const s = str(v)
  return s.length > 2 && s !== 'ACTUAL' && s !== 'PROJECTED' && s !== 'VARIANCES'
    && !s.startsWith('Total') && !s.startsWith('TO BUDGET') && s !== 'TBC'
    && !s.startsWith(' TBC')
}

/** Extract 12 monthly values starting at col 1 (col B in sheet = index 1) */
function extractMonths(row: unknown[], fallback = 0): number[] {
  const months: number[] = []
  for (let c = 1; c <= MONTH_COUNT; c++) {
    months.push(num(row[c] ?? fallback))
  }
  return months
}

// ─── Rep section scanner ──────────────────────────────────────────────────────

interface RepSection {
  name:    string
  months:  number[]
  total:   number
}

/**
 * Scan from startRow looking for rep data rows.
 * Stops when it hits a "Total" row or runs out of named reps.
 */
function scanRepSection(rows: RawRows, startRow: number, maxRows = 25): RepSection[] {
  const result: RepSection[] = []
  for (let i = startRow; i < startRow + maxRows && i < rows.length; i++) {
    const row = rows[i] ?? []
    const name = str(row[COL.NAME])
    if (!isRepName(name)) continue
    result.push({
      name,
      months: extractMonths(row),
      total:  num(row[COL.TOTAL]),
    })
  }
  return result
}

// ─── Main parser ──────────────────────────────────────────────────────────────

export function parseTracker(buffer: ArrayBuffer, fileName: string): TrackerSnapshot {
  const warnings: string[] = []
  const wb = XLSX.read(buffer, { type: 'array', cellDates: false })

  // ── Validate sheet ──────────────────────────────────────────────────────────
  const sheetFound = hasTrackerSheet(wb.SheetNames)
  if (!sheetFound) {
    warnings.push(`Sheet "${TRACKER_SHEET_NAME}" not found. Found: ${wb.SheetNames.join(', ')}`)
  }

  const ws  = wb.Sheets[TRACKER_SHEET_NAME] ?? wb.Sheets[wb.SheetNames[0]]
  const all = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1, defval: '' }) as RawRows

  // ── Reporting date from filename ────────────────────────────────────────────
  const reportingDateObj = dateFromFilename(fileName) ?? new Date()
  const reportingDate    = formatReportingDate(reportingDateObj)
  const reportingWeek    = `Week of ${reportingDate}`
  const fiscalYear       = 'FY26/27'

  // ── Month labels from date header row ──────────────────────────────────────
  const dateRow = all[ROW.DATE_HEADER] ?? []
  const months: string[] = []
  for (let c = 1; c <= MONTH_COUNT; c++) {
    const serial = dateRow[c]
    if (typeof serial === 'number' && serial > 40000) {
      months.push(excelSerialToMonthLabel(serial))
    } else {
      months.push(str(serial) || `M${c}`)
    }
  }

  // ── Quarterly summary ───────────────────────────────────────────────────────
  const q1Row    = all[ROW.Q1]    ?? []
  const q2Row    = all[ROW.Q2]    ?? []
  const q3Row    = all[ROW.Q3]    ?? []
  const q4Row    = all[ROW.Q4]    ?? []
  const totalRow = all[ROW.TOTAL] ?? []

  const q1 = { budget: num(q1Row[1]), actual: num(q1Row[2]), forecast: num(q1Row[3]) }
  const q2 = { budget: num(q2Row[1]), actual: num(q2Row[2]), forecast: num(q2Row[3]) }
  const q3 = { budget: num(q3Row[1]), actual: num(q3Row[2]), forecast: num(q3Row[3]) }
  const q4 = { budget: num(q4Row[1]), actual: num(q4Row[2]), forecast: num(q4Row[3]) }

  const totalBudget   = num(totalRow[1])
  const totalActual   = num(totalRow[2])
  const totalForecast = num(totalRow[3])
  const pctToBudget   = totalBudget > 0 ? totalForecast / totalBudget : 0

  const quarterly = {
    budget: q1.budget,  // per-quarter target
    q1, q2, q3, q4,
    total: {
      budget:       totalBudget,
      actual:       totalActual,
      forecast:     totalForecast,
      pctToBudget,
    },
  }

  // ── Annual target ───────────────────────────────────────────────────────────
  const annualTargetRow = all[ROW.ANNUAL_TARGET] ?? []
  // Monthly target is in col C (index 2); annual = monthly × 12
  const monthlyTarget = num(annualTargetRow[2])
  const annualTarget  = monthlyTarget > 0 ? monthlyTarget * 12 : totalBudget

  // ── Per-rep actuals ─────────────────────────────────────────────────────────
  const actualSections  = scanRepSection(all, ROW.ACTUAL_FIRST_REP)
  const projSections    = scanRepSection(all, ROW.PROJ_FIRST_REP)
  const varianceSections = scanRepSection(all, ROW.VAR_FIRST_REP)

  // Build a lookup from name → projected section
  const projByName   = new Map(projSections.map((r) => [r.name.trim(), r]))
  const varByName    = new Map(varianceSections.map((r) => [r.name.trim(), r]))

  const reps: RepActuals[] = actualSections.map((rep) => {
    const proj = projByName.get(rep.name.trim())
    const variance = varByName.get(rep.name.trim())
    return {
      name:             rep.name.trim(),
      monthlyActuals:   rep.months,
      monthlyProjected: proj?.months ?? rep.months.map(() => 0),
      monthlyVariance:  variance?.months ?? rep.months.map(() => 0),
      totalActual:      rep.total,
      totalProjected:   proj?.total ?? 0,
    }
  })

  // ── Per-rep quarterly breakdown ─────────────────────────────────────────────
  const repQuarterly: RepQuarterly[] = []
  for (let i = ROW.QUARTERLY_FIRST; i < ROW.QUARTERLY_FIRST + 30 && i < all.length; i++) {
    const row = all[i] ?? []
    const name = str(row[Q_COL.NAME])
    if (!isRepName(name)) continue
    repQuarterly.push({
      name:           name.trim(),
      target:         num(row[Q_COL.TARGET]),
      q1Actual:       num(row[Q_COL.Q1]),
      q2Actual:       num(row[Q_COL.Q2]),
      q3Actual:       num(row[Q_COL.Q3]),
      q4Actual:       num(row[Q_COL.Q4]),
      ytdActual:      num(row[Q_COL.TOTAL]),
      ytdForecast:    0,   // will be set from projSections
      pctAchievement: num(row[Q_COL.PCT_ACH]),
      difference:     num(row[Q_COL.DIFFERENCE]),
    })
  }
  // Populate ytdForecast from projected totals
  repQuarterly.forEach((r) => {
    const proj = projByName.get(r.name.trim())
    r.ytdForecast = proj?.total ?? r.ytdActual
  })

  // ── Validation ──────────────────────────────────────────────────────────────
  const knownRepsFound   = reps.map((r) => r.name)
    .filter((n) => KNOWN_REPS.some((k) => k.toLowerCase() === n.toLowerCase()))
  const unknownReps      = reps.map((r) => r.name)
    .filter((n) => !KNOWN_REPS.some((k) => k.toLowerCase() === n.toLowerCase()))

  if (unknownReps.length > 0) {
    warnings.push(`Unfamiliar rep names (new starters?): ${unknownReps.join(', ')}`)
  }
  if (reps.length < 5) {
    warnings.push(`Only ${reps.length} reps found — possible structural shift in file`)
  }

  // ── Derived metrics ─────────────────────────────────────────────────────────
  const totalActualGP   = reps.reduce((s, r) => s + r.totalActual, 0)
  const totalForecastGP = reps.reduce((s, r) => s + r.totalProjected, 0)

  // Find most recent month with actual data (last month where sum > 0)
  let currentMonthIdx  = -1
  let currentMonthActual = 0
  for (let m = MONTH_COUNT - 1; m >= 0; m--) {
    const monthSum = reps.reduce((s, r) => s + (r.monthlyActuals[m] ?? 0), 0)
    if (monthSum > 0) { currentMonthIdx = m; currentMonthActual = monthSum; break }
  }

  const sortedByActual = [...reps].sort((a, b) => b.totalActual - a.totalActual)

  const topReps = repQuarterly
    .filter((r) => r.target > 0)
    .sort((a, b) => b.pctAchievement - a.pctAchievement)
    .slice(0, 5)
    .map((r) => ({ name: r.name, actual: r.ytdActual, pct: r.pctAchievement }))

  const atRiskReps = repQuarterly
    .filter((r) => r.target > 0 && r.pctAchievement < 0.60)
    .map((r) => ({ name: r.name, pct: r.pctAchievement }))

  const onTrackReps = repQuarterly
    .filter((r) => r.target > 0 && r.pctAchievement >= 0.80)
    .map((r) => ({ name: r.name, pct: r.pctAchievement }))

  const snapshot: TrackerSnapshot = {
    id:            `tracker-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    fileName,
    uploadedAt:    new Date().toISOString(),
    reportingDate,
    reportingWeek,
    fiscalYear,
    months,
    quarterly,
    reps,
    repQuarterly,
    derived: {
      totalActualGP,
      totalForecastGP,
      annualTarget,
      pctToAnnualTarget: annualTarget > 0 ? totalForecastGP / annualTarget : 0,
      avgMonthlyActual:  totalActualGP / Math.max(1, reps[0]?.monthlyActuals.filter((v) => v > 0).length ?? 1),
      topReps,
      atRiskReps,
      onTrackReps,
      currentMonthActual,
      currentMonthLabel: currentMonthIdx >= 0 ? (months[currentMonthIdx] ?? '') : '',
    },
    validation: {
      isValid:        sheetFound && reps.length >= 5,
      sheetFound,
      repCount:       reps.length,
      knownRepsFound,
      unknownReps,
      warnings,
    },
  }

  return snapshot
}
