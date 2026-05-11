/**
 * lib/workbook/weekOnWeek.ts
 * ──────────────────────────────────────────────────────────────────────────
 * Week-on-week GP insight engine.
 * Compares two TrackerSnapshot objects and generates:
 *   - Numerical deltas (absolute + %)
 *   - Per-rep change analysis
 *   - Auto-generated alerts
 *   - 3-5 executive bullet points
 *   - CEO recommended actions
 */

import type { TrackerSnapshot, WeekOnWeekDelta, RepWoWChange } from './trackerTypes'

const R = (n: number) => `R${(Math.abs(n) / 1_000_000).toFixed(1)}M`
const pct = (n: number) => `${(n * 100).toFixed(1)}%`

function delta(curr: number, prev: number) {
  return { abs: curr - prev, pct: prev > 0 ? (curr - prev) / prev : 0 }
}

function direction(d: number): 'improved' | 'declined' | 'flat' {
  if (d > 0.005)  return 'improved'
  if (d < -0.005) return 'declined'
  return 'flat'
}

// ─── Rep comparison ───────────────────────────────────────────────────────────

function compareReps(curr: TrackerSnapshot, prev: TrackerSnapshot): RepWoWChange[] {
  const prevByName = new Map(prev.reps.map((r) => [r.name, r]))
  const prevQByName = new Map(prev.repQuarterly.map((r) => [r.name, r]))

  return curr.reps.map((rep) => {
    const prevRep    = prevByName.get(rep.name)
    const currQ      = curr.repQuarterly.find((r) => r.name === rep.name)
    const prevQ      = prevQByName.get(rep.name)

    const actualDelta   = rep.totalActual   - (prevRep?.totalActual   ?? rep.totalActual)
    const forecastDelta = rep.totalProjected - (prevRep?.totalProjected ?? rep.totalProjected)
    const pctActual     = prevRep?.totalActual ? actualDelta / prevRep.totalActual : 0

    let note = ''
    if (Math.abs(actualDelta) > 50_000) {
      note = `GP actual ${actualDelta > 0 ? '+' : ''}${R(actualDelta)}`
    }
    if (Math.abs(forecastDelta) > 200_000) {
      note += (note ? '; ' : '') + `forecast ${forecastDelta > 0 ? '+' : ''}${R(forecastDelta)}`
    }
    if (currQ && prevQ) {
      const pctDelta = currQ.pctAchievement - prevQ.pctAchievement
      if (Math.abs(pctDelta) > 0.02) {
        note += (note ? '; ' : '') + `attainment ${pctDelta > 0 ? '+' : ''}${(pctDelta * 100).toFixed(1)}pp`
      }
    }
    if (!note) note = 'No material change'

    return {
      name:             rep.name,
      totalActualDelta: actualDelta,
      totalActualPct:   pctActual,
      forecastDelta,
      direction:        direction(actualDelta / Math.max(1, prevRep?.totalActual ?? 1)),
      note,
    }
  })
}

// ─── Alert generation ─────────────────────────────────────────────────────────

function generateAlerts(
  curr: TrackerSnapshot,
  prev: TrackerSnapshot,
  repChanges: RepWoWChange[],
): WeekOnWeekDelta['alerts'] {
  const alerts: WeekOnWeekDelta['alerts'] = []

  // Annual target attainment
  const currPct = curr.derived.pctToAnnualTarget
  const prevPct = prev.derived.pctToAnnualTarget
  if (currPct < 0.50) {
    alerts.push({
      severity: 'critical',
      message:  `Annual GP forecast at ${pct(currPct)} of target (${R(curr.derived.totalForecastGP)} of ${R(curr.derived.annualTarget)}) — significantly behind`,
    })
  }

  // Reps at risk (< 30% attainment)
  const criticalReps = curr.repQuarterly.filter((r) => r.target > 0 && r.pctAchievement < 0.30)
  if (criticalReps.length > 0) {
    alerts.push({
      severity: 'critical',
      message:  `${criticalReps.length} rep${criticalReps.length > 1 ? 's' : ''} below 30% attainment: ${criticalReps.map((r) => r.name.split(' ')[0]).join(', ')}`,
    })
  }

  // Forecast dropped week-on-week
  const forecastDelta = curr.derived.totalForecastGP - prev.derived.totalForecastGP
  if (forecastDelta < -500_000) {
    alerts.push({
      severity: 'warning',
      message:  `Full-year GP forecast fell ${R(forecastDelta)} vs last week — pipeline concern`,
    })
  }

  // Any rep with significant negative actual swing
  const declinedByActual = repChanges.filter((r) => r.totalActualDelta < -200_000)
  if (declinedByActual.length > 0) {
    alerts.push({
      severity: 'warning',
      message:  `GP actuals revised down for ${declinedByActual.map((r) => r.name.split(' ')[0]).join(', ')} — verify job closures`,
    })
  }

  // Q2 health
  const q2ForecastPct = curr.quarterly.total.budget > 0
    ? curr.quarterly.q2.forecast / curr.quarterly.q2.budget
    : 0
  if (q2ForecastPct < 0.60) {
    alerts.push({
      severity: 'warning',
      message:  `Q2 GP forecast at ${pct(q2ForecastPct)} of target — push pipeline conversion for June–Aug`,
    })
  }

  return alerts
}

// ─── Executive bullets ────────────────────────────────────────────────────────

function generateBullets(
  curr: TrackerSnapshot,
  prev: TrackerSnapshot,
  repChanges: RepWoWChange[],
): string[] {
  const bullets: string[] = []

  // 1. Overall GP movement
  const actualDelta   = curr.derived.totalActualGP - prev.derived.totalActualGP
  const forecastDelta = curr.derived.totalForecastGP - prev.derived.totalForecastGP
  if (Math.abs(actualDelta) > 100_000) {
    bullets.push(
      `YTD GP actual ${actualDelta > 0 ? 'grew' : 'declined'} ${R(actualDelta)} to ${R(curr.derived.totalActualGP)} (${pct(curr.derived.totalForecastGP / curr.derived.annualTarget)} of ${R(curr.derived.annualTarget)} annual target).`
    )
  } else {
    bullets.push(
      `YTD GP holds at ${R(curr.derived.totalActualGP)} — full-year forecast ${R(curr.derived.totalForecastGP)} vs ${R(curr.derived.annualTarget)} target.`
    )
  }

  // 2. Worsening reps
  const declined = repChanges
    .filter((r) => r.direction === 'declined' && Math.abs(r.totalActualDelta) > 100_000)
    .sort((a, b) => a.totalActualDelta - b.totalActualDelta)
    .slice(0, 3)
  if (declined.length > 0) {
    bullets.push(
      `Concern: ${declined.map((r) => `${r.name.split(' ')[0]} (${r.note})`).join('; ')} — actuals revised down.`
    )
  }

  // 3. Improving reps
  const improved = repChanges
    .filter((r) => r.direction === 'improved' && r.totalActualDelta > 100_000)
    .sort((a, b) => b.totalActualDelta - a.totalActualDelta)
    .slice(0, 3)
  if (improved.length > 0) {
    bullets.push(
      `Positive: ${improved.map((r) => `${r.name.split(' ')[0]} (${r.note})`).join('; ')} — new job closures confirmed.`
    )
  }

  // 4. At-risk attainment
  const atRisk = curr.derived.atRiskReps
  if (atRisk.length > 0) {
    bullets.push(
      `${atRisk.length} rep${atRisk.length > 1 ? 's' : ''} below 60% annual attainment: ${atRisk.map((r) => `${r.name.split(' ')[0]} (${pct(r.pct)})`).join(', ')}.`
    )
  }

  // 5. Forecast change
  if (Math.abs(forecastDelta) > 500_000) {
    bullets.push(
      `Full-year GP forecast ${forecastDelta > 0 ? 'improved' : 'worsened'} by ${R(forecastDelta)} to ${R(curr.derived.totalForecastGP)} — ${pct(curr.derived.totalForecastGP / curr.derived.annualTarget)} of target.`
    )
  }

  return bullets.slice(0, 5)
}

// ─── CEO actions ──────────────────────────────────────────────────────────────

function generateActions(
  curr: TrackerSnapshot,
  repChanges: RepWoWChange[],
): string[] {
  const actions: string[] = []

  const atRiskNames = curr.derived.atRiskReps.map((r) => r.name.split(' ')[0])
  if (atRiskNames.length > 0) {
    actions.push(`1-on-1 pipeline review with ${atRiskNames.slice(0, 3).join(', ')} — understand blockers to conversion.`)
  }

  const lowQ2 = curr.quarterly.q2.forecast / curr.quarterly.q2.budget
  if (lowQ2 < 0.65) {
    actions.push(`Accelerate Q2 pipeline: push reps to close June–August opportunities to close the ${pct(1 - lowQ2)} Q2 gap.`)
  }

  const declined = repChanges.filter((r) => r.forecastDelta < -500_000)
  if (declined.length > 0) {
    actions.push(`Investigate forecast reductions from ${declined.map((r) => r.name.split(' ')[0]).join(', ')} — identify lost deals vs deferred.`)
  }

  if (curr.repQuarterly.some((r) => r.pctAchievement > 1.0)) {
    const overperformers = curr.repQuarterly.filter((r) => r.pctAchievement > 1.0)
    actions.push(`Leverage overperformers: ${overperformers.map((r) => r.name.split(' ')[0]).join(', ')} are above target — can they support struggling peers?`)
  }

  return actions
}

// ─── Master comparator ────────────────────────────────────────────────────────

export function computeWoWDelta(
  curr:  TrackerSnapshot,
  prev:  TrackerSnapshot,
): WeekOnWeekDelta {
  const repChanges = compareReps(curr, prev)

  const quarterlyDeltas = (
    ['q1', 'q2', 'q3', 'q4'] as const
  ).map((q) => {
    const c = curr.quarterly[q]
    const p = prev.quarterly[q]
    const aD = c.actual   - p.actual
    const fD = c.forecast - p.forecast
    return {
      q,
      label:          q.toUpperCase(),
      actualDelta:    aD,
      forecastDelta:  fD,
      direction:      direction(fD / Math.max(1, p.forecast)) as 'improved' | 'declined' | 'flat',
    }
  })

  const aDelta = curr.derived.totalActualGP   - prev.derived.totalActualGP
  const fDelta = curr.derived.totalForecastGP - prev.derived.totalForecastGP

  return {
    fromDate:           prev.reportingDate,
    toDate:             curr.reportingDate,
    totalActualDelta:   aDelta,
    totalActualPct:     prev.derived.totalActualGP > 0 ? aDelta / prev.derived.totalActualGP : 0,
    totalForecastDelta: fDelta,
    totalForecastPct:   prev.derived.totalForecastGP > 0 ? fDelta / prev.derived.totalForecastGP : 0,
    quarterlyDeltas,
    repChanges,
    improvedReps:       repChanges.filter((r) => r.direction === 'improved' && Math.abs(r.totalActualDelta) > 50_000),
    declinedReps:       repChanges.filter((r) => r.direction === 'declined' && Math.abs(r.totalActualDelta) > 50_000),
    alerts:             generateAlerts(curr, prev, repChanges),
    executiveBullets:   generateBullets(curr, prev, repChanges),
    recommendedActions: generateActions(curr, repChanges),
  }
}
