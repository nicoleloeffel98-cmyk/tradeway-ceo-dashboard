/**
 * lib/workbook/trackerTypes.ts
 * ──────────────────────────────────────────────────────────────────────────
 * TypeScript types for the Tradeway GP Tracker snapshot system.
 * All types derived from the real "% Summary TWP" sheet structure.
 */

// ─── Per-rep data ─────────────────────────────────────────────────────────────

export interface RepActuals {
  name:             string
  /** GP actuals for each of the 12 months (some may be 0 if not yet invoiced) */
  monthlyActuals:   number[]   // length 12: Mar → Feb
  /** GP projections for each of the 12 months */
  monthlyProjected: number[]   // length 12
  /** Variance (projected - actual) per month */
  monthlyVariance:  number[]   // length 12
  /** YTD actual total */
  totalActual:      number
  /** Full-year projected total */
  totalProjected:   number
}

export interface RepQuarterly {
  name:          string
  target:        number    // full-year GP target in ZAR
  q1Actual:      number
  q2Actual:      number
  q3Actual:      number
  q4Actual:      number
  ytdActual:     number    // sum of q1+q2+q3+q4 actuals so far
  ytdForecast:   number    // same as totalProjected
  pctAchievement: number  // 0-1 (e.g. 0.38 = 38%)
  difference:    number    // target - ytdForecast
}

// ─── Snapshot ─────────────────────────────────────────────────────────────────

/** One weekly upload = one TrackerSnapshot */
export interface TrackerSnapshot {
  id:             string
  fileName:       string
  uploadedAt:     string   // ISO 8601
  reportingDate:  string   // 'DD MMM YYYY' extracted from filename
  reportingWeek:  string   // 'Week of DD MMM YYYY'

  /** Fiscal year label derived from the sheet (e.g. 'FY26/27') */
  fiscalYear:     string

  /** Month labels for the 12 tracked months */
  months:         string[]

  /** Quarterly GP summary (budget / actual / forecast) */
  quarterly: {
    budget:   number   // per-quarter target (always R40M in current sheet)
    q1:  { budget: number; actual: number; forecast: number }
    q2:  { budget: number; actual: number; forecast: number }
    q3:  { budget: number; actual: number; forecast: number }
    q4:  { budget: number; actual: number; forecast: number }
    total: { budget: number; actual: number; forecast: number; pctToBudget: number }
  }

  /** Per-rep GP data */
  reps: RepActuals[]

  /** Per-rep quarterly breakdown with targets */
  repQuarterly: RepQuarterly[]

  /** Derived totals (from rep rows — validated against sheet totals) */
  derived: {
    totalActualGP:     number
    totalForecastGP:   number
    annualTarget:      number
    pctToAnnualTarget: number   // 0-1
    avgMonthlyActual:  number
    topReps:           { name: string; actual: number; pct: number }[]   // sorted by actual desc
    atRiskReps:        { name: string; pct: number }[]   // pct < 60%
    onTrackReps:       { name: string; pct: number }[]   // pct >= 80%
    currentMonthActual: number   // most recent month with data
    currentMonthLabel:  string
  }

  /** Validation state */
  validation: {
    isValid:           boolean
    sheetFound:        boolean
    repCount:          number
    knownRepsFound:    string[]
    unknownReps:       string[]
    warnings:          string[]
  }
}

// ─── Week-on-week delta ───────────────────────────────────────────────────────

export interface RepWoWChange {
  name:            string
  totalActualDelta: number   // absolute ZAR change
  totalActualPct:   number   // % change
  forecastDelta:    number
  direction:        'improved' | 'declined' | 'flat'
  note:             string   // human-readable reason
}

export interface WeekOnWeekDelta {
  fromDate:            string
  toDate:              string
  totalActualDelta:    number   // ZAR
  totalActualPct:      number   // %
  totalForecastDelta:  number
  totalForecastPct:    number

  quarterlyDeltas: {
    q:              'q1' | 'q2' | 'q3' | 'q4'
    label:          string
    actualDelta:    number
    forecastDelta:  number
    direction:      'improved' | 'declined' | 'flat'
  }[]

  repChanges:      RepWoWChange[]
  improvedReps:    RepWoWChange[]
  declinedReps:    RepWoWChange[]

  /** Auto-generated executive intelligence */
  alerts: {
    severity: 'critical' | 'warning' | 'info'
    message:  string
  }[]

  /** 3-5 bullets for the Weekly Change Brief */
  executiveBullets: string[]

  /** CEO recommended actions */
  recommendedActions: string[]
}

// ─── Store record ─────────────────────────────────────────────────────────────

export interface TrackerStoreState {
  /** All snapshots, newest first */
  snapshots:         TrackerSnapshot[]
  /** Latest snapshot (snapshots[0]) */
  latest:            TrackerSnapshot | null
  /** Previous snapshot (snapshots[1]) — for WoW comparison */
  previous:          TrackerSnapshot | null
  /** WoW delta computed from latest vs previous */
  wowDelta:          WeekOnWeekDelta | null
}
