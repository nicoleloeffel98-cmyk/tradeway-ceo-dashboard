/**
 * lib/workbook/intelligence.ts
 * ──────────────────────────────────────────────────────────────────────────
 * Executive intelligence layer — auto-generates alerts and decision queue
 * items from derived KPIs based on Tradeway threshold rules.
 *
 * All outputs carry source: 'workbook' so stores can distinguish them from
 * the static mock data.
 */

import type { DerivedKPIs, ParsedWorkbook, GeneratedAlert, GeneratedDecision } from './types'

const today = () => new Date().toISOString().slice(0, 10)

let _idCounter = 0
function uid(prefix: string) {
  return `${prefix}-wb-${++_idCounter}-${Date.now()}`
}

// ─── Threshold constants ──────────────────────────────────────────────────────

const THRESHOLDS = {
  // Operations
  noShowRate:       { critical: 8,  warning: 6  },   // %
  successRate:      { critical: 90, warning: 92 },   // % (lower = worse)
  // Finance
  dso:              { critical: 55, warning: 50 },   // days
  overdueARRatio:   { critical: 0.08, warning: 0.05 }, // % of cash balance
  cashRunwayDays:   { critical: 60, warning: 90  },  // days
  grossMarginPct:   { critical: 30, warning: 35  },  // % (lower = worse)
  revenueAttainment:{ critical: 70, warning: 80  },  // % (lower = worse)
  // Sales / BD
  bdWinRate:        { critical: 30, warning: 38  },  // %
  salesWinRate:     { critical: 30, warning: 38  },  // %
  // Clients
  avgNPS:           { critical: 20, warning: 35  },  // score (lower = worse)
  clientAtRisk:     { critical: 3,  warning: 2   },  // count
  renewingIn90dAmt: { critical: 50_000_000, warning: 30_000_000 }, // ZAR
  // People
  capacityUtil:     { critical: 97, warning: 93  },  // % (higher = worse)
  attritionRate:    { critical: 6,  warning: 4   },  // %
}

// ─── Alert generators ─────────────────────────────────────────────────────────

function opsAlerts(d: DerivedKPIs): GeneratedAlert[] {
  const ops = d.operations
  if (!ops) return []
  const alerts: GeneratedAlert[] = []

  // No-show rate
  if (ops.avgNoShowRate >= THRESHOLDS.noShowRate.critical) {
    alerts.push({
      id:             uid('ops-noshow'),
      severity:       'critical',
      category:       'Operations',
      title:          `No-show rate critical at ${ops.avgNoShowRate}%`,
      summary:        `Average ambassador no-show rate of ${ops.avgNoShowRate}% exceeds critical threshold. Immediate escalation required to regional managers. Highest-risk regions: ${ops.regions.filter((r) => (r.noShowRate ?? 0) > THRESHOLDS.noShowRate.critical).map((r) => r.region).join(', ') || 'check all regions'}.`,
      actionRequired: true,
      actionLabel:    'View Operations',
      actionUrl:      '/operations',
      createdAt:      today(),
      isRead:         false,
      source:         'workbook',
    })
  } else if (ops.avgNoShowRate >= THRESHOLDS.noShowRate.warning) {
    alerts.push({
      id:             uid('ops-noshow-w'),
      severity:       'warning',
      category:       'Operations',
      title:          `No-show rate elevated at ${ops.avgNoShowRate}%`,
      summary:        `Ambassador no-show rate of ${ops.avgNoShowRate}% approaching critical levels. Review regional staffing plans this week.`,
      actionRequired: false,
      createdAt:      today(),
      isRead:         false,
      source:         'workbook',
    })
  }

  // Success rate
  if (ops.avgSuccessRate < THRESHOLDS.successRate.critical) {
    alerts.push({
      id:             uid('ops-success'),
      severity:       'critical',
      category:       'Operations',
      title:          `Activation success rate below 90% — ${ops.avgSuccessRate}%`,
      summary:        `Overall activation success rate of ${ops.avgSuccessRate}% is below the 90% critical threshold. ${ops.regions.filter((r) => r.successRate < THRESHOLDS.successRate.critical).length} region(s) at risk. Review SLA compliance immediately.`,
      actionRequired: true,
      actionLabel:    'View Operations',
      actionUrl:      '/operations',
      createdAt:      today(),
      isRead:         false,
      source:         'workbook',
    })
  }

  return alerts
}

function financeAlerts(d: DerivedKPIs): GeneratedAlert[] {
  const fin = d.finance
  if (!fin) return []
  const alerts: GeneratedAlert[] = []

  // Cash runway
  if (fin.cashRunwayDays > 0 && fin.cashRunwayDays <= THRESHOLDS.cashRunwayDays.critical) {
    alerts.push({
      id:             uid('fin-runway'),
      severity:       'critical',
      category:       'Finance',
      title:          `Cash runway ${fin.cashRunwayDays} days — urgent review required`,
      summary:        `Cash runway has dropped to ${fin.cashRunwayDays} days. Board notification required. Review debtor collection and cost deferral options immediately.`,
      actionRequired: true,
      actionLabel:    'View Finance',
      actionUrl:      '/finance',
      createdAt:      today(),
      isRead:         false,
      source:         'workbook',
    })
  } else if (fin.cashRunwayDays > 0 && fin.cashRunwayDays <= THRESHOLDS.cashRunwayDays.warning) {
    alerts.push({
      id:             uid('fin-runway-w'),
      severity:       'warning',
      category:       'Finance',
      title:          `Cash runway at ${fin.cashRunwayDays} days`,
      summary:        `Cash runway of ${fin.cashRunwayDays} days warrants close monitoring. Review collection pipeline and upcoming payables.`,
      actionRequired: false,
      createdAt:      today(),
      isRead:         false,
      source:         'workbook',
    })
  }

  // DSO
  if (fin.dso >= THRESHOLDS.dso.critical) {
    alerts.push({
      id:             uid('fin-dso'),
      severity:       'critical',
      category:       'Finance',
      title:          `DSO ${fin.dso} days — debtor collection critical`,
      summary:        `Days Sales Outstanding reached ${fin.dso} days, exceeding the 55-day critical threshold. Escalate collections for all overdue accounts. Cash conversion cycle is impacting runway.`,
      actionRequired: true,
      actionLabel:    'View Finance',
      actionUrl:      '/finance',
      createdAt:      today(),
      isRead:         false,
      source:         'workbook',
    })
  } else if (fin.dso >= THRESHOLDS.dso.warning) {
    alerts.push({
      id:             uid('fin-dso-w'),
      severity:       'warning',
      category:       'Finance',
      title:          `DSO elevated at ${fin.dso} days`,
      summary:        `Days Sales Outstanding of ${fin.dso} days is above the 50-day warning threshold. Review debtor ageing and push collections team.`,
      actionRequired: false,
      createdAt:      today(),
      isRead:         false,
      source:         'workbook',
    })
  }

  // Revenue attainment
  if (fin.revenueTarget > 0) {
    const attainment = Math.round((fin.revenueMTD / fin.revenueTarget) * 100)
    if (attainment < THRESHOLDS.revenueAttainment.critical) {
      alerts.push({
        id:             uid('fin-rev'),
        severity:       'critical',
        category:       'Finance',
        title:          `Revenue attainment at ${attainment}% — month-end at risk`,
        summary:        `MTD revenue of R${(fin.revenueMTD / 1_000_000).toFixed(1)}M is only ${attainment}% of the monthly target. Immediate commercial intervention required to recover month-end position.`,
        actionRequired: true,
        actionLabel:    'View Sales',
        actionUrl:      '/sales',
        createdAt:      today(),
        isRead:         false,
        source:         'workbook',
      })
    }
  }

  // Gross margin
  if (fin.grossMarginPct > 0 && fin.grossMarginPct < THRESHOLDS.grossMarginPct.critical) {
    alerts.push({
      id:             uid('fin-margin'),
      severity:       'warning',
      category:       'Finance',
      title:          `Gross margin at ${fin.grossMarginPct}% — below threshold`,
      summary:        `Gross margin of ${fin.grossMarginPct}% is below the 30% floor. Review pricing, cost-of-sales, and subcontractor rates urgently.`,
      actionRequired: false,
      createdAt:      today(),
      isRead:         false,
      source:         'workbook',
    })
  }

  return alerts
}

function clientAlerts(d: DerivedKPIs): GeneratedAlert[] {
  const cl = d.clients
  if (!cl) return []
  const alerts: GeneratedAlert[] = []

  // Average NPS
  if (cl.avgNPS < THRESHOLDS.avgNPS.critical) {
    alerts.push({
      id:             uid('cl-nps'),
      severity:       'critical',
      category:       'Client Health',
      title:          `Client NPS critically low at ${cl.avgNPS}`,
      summary:        `Average client NPS of ${cl.avgNPS} is below the critical threshold of 20. Churn risk is elevated across the portfolio. CEO touchpoints required for all red-rated clients.`,
      actionRequired: true,
      actionLabel:    'View Clients',
      actionUrl:      '/campaigns',
      createdAt:      today(),
      isRead:         false,
      source:         'workbook',
    })
  } else if (cl.avgNPS < THRESHOLDS.avgNPS.warning) {
    alerts.push({
      id:             uid('cl-nps-w'),
      severity:       'warning',
      category:       'Client Health',
      title:          `Client NPS below 35 — ${cl.avgNPS}`,
      summary:        `Average NPS of ${cl.avgNPS} is trending below target. Schedule executive client reviews for the next 30 days.`,
      actionRequired: false,
      createdAt:      today(),
      isRead:         false,
      source:         'workbook',
    })
  }

  // High-risk clients
  const redClients = cl.clients.filter((c) => c.churnRisk === 'red')
  if (redClients.length >= THRESHOLDS.clientAtRisk.critical) {
    alerts.push({
      id:             uid('cl-churn'),
      severity:       'critical',
      category:       'Client Health',
      title:          `${redClients.length} clients at high churn risk`,
      summary:        `${redClients.map((c) => c.name).join(', ')} are classified as high churn risk. Combined ARR at risk: R${(redClients.reduce((s, c) => s + c.arr, 0) / 1_000_000).toFixed(1)}M. Immediate retention action required.`,
      actionRequired: true,
      actionLabel:    'View Clients',
      actionUrl:      '/campaigns',
      createdAt:      today(),
      isRead:         false,
      source:         'workbook',
    })
  }

  return alerts
}

function salesAlerts(d: DerivedKPIs): GeneratedAlert[] {
  const sal = d.sales
  if (!sal) return []
  const alerts: GeneratedAlert[] = []

  if (sal.attainmentPct < THRESHOLDS.revenueAttainment.critical) {
    alerts.push({
      id:             uid('sal-attain'),
      severity:       'warning',
      category:       'Sales',
      title:          `Sales at ${sal.attainmentPct}% of MTD target`,
      summary:        `Month-to-date sales attainment of ${sal.attainmentPct}% (R${(sal.revenueMTD / 1_000_000).toFixed(1)}M of R${(sal.revenueTarget / 1_000_000).toFixed(1)}M target). Forecast indicates ${sal.forecastFullMonth < sal.revenueTarget ? 'a month-end miss' : 'recovery possible'}.`,
      actionRequired: sal.attainmentPct < THRESHOLDS.revenueAttainment.critical,
      createdAt:      today(),
      isRead:         false,
      source:         'workbook',
    })
  }

  if (sal.winRate > 0 && sal.winRate < THRESHOLDS.salesWinRate.warning) {
    alerts.push({
      id:             uid('sal-winrate'),
      severity:       sal.winRate < THRESHOLDS.salesWinRate.critical ? 'critical' : 'warning',
      category:       'Sales',
      title:          `Sales win rate at ${sal.winRate}% — below benchmark`,
      summary:        `Sales win rate of ${sal.winRate}% is below the 38% benchmark. Review pipeline qualification process and proposal quality. Compare with BD win rate for conversion alignment.`,
      actionRequired: sal.winRate < THRESHOLDS.salesWinRate.critical,
      createdAt:      today(),
      isRead:         false,
      source:         'workbook',
    })
  }

  return alerts
}

function bdAlerts(d: DerivedKPIs): GeneratedAlert[] {
  const bd = d.bd
  if (!bd) return []
  const alerts: GeneratedAlert[] = []

  if (bd.winRate > 0 && bd.winRate < THRESHOLDS.bdWinRate.warning) {
    alerts.push({
      id:             uid('bd-winrate'),
      severity:       bd.winRate < THRESHOLDS.bdWinRate.critical ? 'critical' : 'warning',
      category:       'Business Development',
      title:          `BD win rate at ${bd.winRate}% — pipeline quality concern`,
      summary:        `Business Development win rate of ${bd.winRate}% is below the 38% benchmark. With a weighted pipeline of R${(bd.weightedPipeline / 1_000_000).toFixed(1)}M, review deal qualification and proposal conversion rates.`,
      actionRequired: bd.winRate < THRESHOLDS.bdWinRate.critical,
      createdAt:      today(),
      isRead:         false,
      source:         'workbook',
    })
  }

  return alerts
}

function peopleAlerts(d: DerivedKPIs): GeneratedAlert[] {
  const ppl = d.people
  if (!ppl) return []
  const alerts: GeneratedAlert[] = []

  if (ppl.capacityUtil >= THRESHOLDS.capacityUtil.critical) {
    alerts.push({
      id:             uid('ppl-cap'),
      severity:       'critical',
      category:       'People',
      title:          `Capacity utilisation critical at ${ppl.capacityUtil}%`,
      summary:        `Ambassador capacity utilisation of ${ppl.capacityUtil}% leaves no buffer for surge demand. Risk of failed activations. Approve emergency recruitment immediately.`,
      actionRequired: true,
      actionLabel:    'View People',
      actionUrl:      '/people',
      createdAt:      today(),
      isRead:         false,
      source:         'workbook',
    })
  } else if (ppl.capacityUtil >= THRESHOLDS.capacityUtil.warning) {
    alerts.push({
      id:             uid('ppl-cap-w'),
      severity:       'warning',
      category:       'People',
      title:          `Capacity at ${ppl.capacityUtil}% — limited surge buffer`,
      summary:        `Capacity utilisation of ${ppl.capacityUtil}% is approaching critical. Review upcoming activation commitments against available ambassador pool.`,
      actionRequired: false,
      createdAt:      today(),
      isRead:         false,
      source:         'workbook',
    })
  }

  if (ppl.attritionRate >= THRESHOLDS.attritionRate.critical) {
    alerts.push({
      id:             uid('ppl-attr'),
      severity:       'warning',
      category:       'People',
      title:          `Attrition rate at ${ppl.attritionRate}% — above threshold`,
      summary:        `Monthly attrition rate of ${ppl.attritionRate}% is above the 6% threshold. Review exit interview data and take retention action before capacity further deteriorates.`,
      actionRequired: false,
      createdAt:      today(),
      isRead:         false,
      source:         'workbook',
    })
  }

  return alerts
}

// ─── Decision generators ──────────────────────────────────────────────────────

function generateDecisions(d: DerivedKPIs, _parsed: ParsedWorkbook): GeneratedDecision[] {
  const decisions: GeneratedDecision[] = []
  const fin = d.finance
  const ops = d.operations
  const ppl = d.people
  const cl  = d.clients
  const sal = d.sales

  // Finance: low cash runway → approve cost freeze
  if (fin && fin.cashRunwayDays > 0 && fin.cashRunwayDays <= THRESHOLDS.cashRunwayDays.warning) {
    decisions.push({
      id:              uid('dec-runway'),
      title:           'Activate cash preservation protocol',
      context:         `Cash runway of ${fin.cashRunwayDays} days is below the 90-day warning threshold. Decision required on discretionary spend freeze and accelerated debtor collection targets.`,
      priority:        fin.cashRunwayDays <= THRESHOLDS.cashRunwayDays.critical ? 'urgent' : 'high',
      module:          'finance',
      financialStake:  `R${(fin.cashBalance / 1_000_000).toFixed(0)}M cash balance at risk`,
      status:          'pending',
      source:          'workbook',
    })
  }

  // Ops: no-show crisis → approve staffing fix
  if (ops && ops.avgNoShowRate >= THRESHOLDS.noShowRate.warning) {
    decisions.push({
      id:              uid('dec-noshow'),
      title:           'Approve emergency ambassador redeployment plan',
      context:         `No-show rate of ${ops.avgNoShowRate}% is impacting activation success rates (${ops.avgSuccessRate}%). Operations team requires CEO sign-off on emergency staffing measures and penalty clause waivers for affected clients.`,
      priority:        ops.avgNoShowRate >= THRESHOLDS.noShowRate.critical ? 'urgent' : 'high',
      module:          'operations',
      financialStake:  'Potential SLA penalty exposure',
      status:          'pending',
      source:          'workbook',
    })
  }

  // People: high capacity utilisation → approve headcount
  if (ppl && ppl.capacityUtil >= THRESHOLDS.capacityUtil.warning) {
    decisions.push({
      id:              uid('dec-headcount'),
      title:           'Approve Q3 emergency headcount increase',
      context:         `Capacity utilisation at ${ppl.capacityUtil}% with ${ppl.openRoles} open roles. August activation commitments require an estimated ${Math.round((ppl.capacityUtil - 90) * 50)} additional ambassadors. HR has three candidate pools ready pending budget approval.`,
      priority:        ppl.capacityUtil >= THRESHOLDS.capacityUtil.critical ? 'urgent' : 'high',
      module:          'people',
      financialStake:  `${ppl.openRoles} open roles blocking activation capacity`,
      status:          'pending',
      source:          'workbook',
    })
  }

  // Clients: at-risk clients with upcoming renewals
  if (cl) {
    const urgentRenewals = cl.clients
      .filter((c) => c.churnRisk === 'red' && c.daysToRenewal <= 60)
    if (urgentRenewals.length > 0) {
      const arr = urgentRenewals.reduce((s, c) => s + c.arr, 0)
      decisions.push({
        id:              uid('dec-client'),
        title:           `CEO retention call — ${urgentRenewals[0].name}${urgentRenewals.length > 1 ? ` (+${urgentRenewals.length - 1})` : ''}`,
        context:         `${urgentRenewals.length} high-churn-risk client${urgentRenewals.length > 1 ? 's' : ''} (${urgentRenewals.map((c) => c.name).join(', ')}) renew within 60 days. Combined ARR: R${(arr / 1_000_000).toFixed(1)}M. Personal CEO contact has historically improved retention by 40%.`,
        priority:        'urgent',
        module:          'clients',
        financialStake:  `R${(arr / 1_000_000).toFixed(1)}M ARR at renewal risk`,
        status:          'pending',
        source:          'workbook',
        deadline:        new Date(Date.now() + 14 * 86_400_000).toISOString().slice(0, 10),
      })
    }
  }

  // Sales: month-end gap
  if (sal && sal.revenueTarget > 0 && sal.attainmentPct < 85) {
    const gap = sal.revenueTarget - sal.revenueMTD
    decisions.push({
      id:              uid('dec-sales'),
      title:           'Approve month-end sales acceleration',
      context:         `R${(gap / 1_000_000).toFixed(1)}M gap to MTD target with ${new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() - new Date().getDate()} days remaining. Propose: (1) CEO co-sell on top 3 open deals, (2) Approve 5% discount authority for negotiation-stage deals.`,
      priority:        sal.attainmentPct < 70 ? 'urgent' : 'high',
      module:          'sales',
      financialStake:  `R${(gap / 1_000_000).toFixed(1)}M MTD revenue gap`,
      status:          'pending',
      source:          'workbook',
    })
  }

  return decisions
}

// ─── Main entry point ─────────────────────────────────────────────────────────

export function generateIntelligence(
  derived: DerivedKPIs,
  parsed:  ParsedWorkbook,
): {
  alerts:    GeneratedAlert[]
  decisions: GeneratedDecision[]
} {
  // Reset counter to keep IDs stable-ish per parse
  _idCounter = 0

  const alerts: GeneratedAlert[] = [
    ...opsAlerts(derived),
    ...financeAlerts(derived),
    ...clientAlerts(derived),
    ...salesAlerts(derived),
    ...bdAlerts(derived),
    ...peopleAlerts(derived),
  ]

  // If workbook has explicit alert rows, convert them too
  if (parsed.alerts?.length) {
    const explicit: GeneratedAlert[] = parsed.alerts.map((a, i) => ({
      id:             `wb-explicit-alert-${i}`,
      severity:       a.severity,
      category:       a.category,
      title:          a.title,
      summary:        a.summary,
      actionRequired: a.severity === 'critical',
      createdAt:      a.date ?? today(),
      isRead:         false,
      source:         'workbook' as const,
    }))
    alerts.unshift(...explicit)
  }

  const decisions: GeneratedDecision[] = generateDecisions(derived, parsed)

  // If workbook has explicit decision rows, convert them
  if (parsed.decisions?.length) {
    const explicit: GeneratedDecision[] = parsed.decisions.map((d, i) => ({
      id:              `wb-explicit-dec-${i}`,
      title:           d.title,
      context:         d.context,
      priority:        d.priority,
      module:          d.module ?? 'general',
      deadline:        d.deadline,
      financialStake:  d.financialStake,
      status:          'pending' as const,
      source:          'workbook' as const,
    }))
    decisions.unshift(...explicit)
  }

  return { alerts, decisions }
}
