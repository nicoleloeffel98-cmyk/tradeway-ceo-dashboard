/**
 * lib/workbook/schema.ts
 * ──────────────────────────────────────────────────────────────────────────
 * Fixed sheet names and column specifications for the Tradeway Master
 * Tracking Workbook. NO manual mapping — the dashboard expects exactly
 * these sheet names and column headers.
 */

// ─── Fixed sheet names ────────────────────────────────────────────────────────

export const SHEET_NAMES = {
  BD:         'BD Pipeline',
  SALES:      'Sales Performance',
  FINANCE:    'Financial Health',
  OPERATIONS: 'Operations Tracking',
  CLIENTS:    'Client Health',
  PEOPLE:     'People & Capacity',
  ALERTS:     'Executive Alerts',     // optional
  DECISIONS:  'Decision Queue',        // optional
  SCENARIOS:  'Forward View',          // optional
} as const

export type SheetKey = keyof typeof SHEET_NAMES
export type SheetName = typeof SHEET_NAMES[SheetKey]

// Required sheets — dashboard won't activate without at least 3 of these
export const REQUIRED_SHEETS: SheetName[] = [
  SHEET_NAMES.BD,
  SHEET_NAMES.SALES,
  SHEET_NAMES.FINANCE,
  SHEET_NAMES.OPERATIONS,
  SHEET_NAMES.CLIENTS,
  SHEET_NAMES.PEOPLE,
]

// Optional sheets — nice-to-have, adds richer data
export const OPTIONAL_SHEETS: SheetName[] = [
  SHEET_NAMES.ALERTS,
  SHEET_NAMES.DECISIONS,
  SHEET_NAMES.SCENARIOS,
]

// ─── Column specification ─────────────────────────────────────────────────────

export interface ColSpec {
  key:        string          // internal field name (matches row type property)
  headers:    string[]        // accepted column header spellings (case-insensitive)
  required:   boolean
  type:       'string' | 'number' | 'date' | 'rag' | 'trend'
  description: string
  example:    string
}

// ─── BD Pipeline columns ──────────────────────────────────────────────────────

export const BD_COLUMNS: ColSpec[] = [
  { key: 'client',      headers: ['Client', 'Client Name', 'Company', 'Account'],                         required: true,  type: 'string', description: 'Client / prospect name',         example: 'Vodacom' },
  { key: 'stage',       headers: ['Stage', 'Deal Stage', 'Pipeline Stage', 'Status'],                     required: true,  type: 'string', description: 'prospect | qualified | proposal | negotiation | closed_won | closed_lost', example: 'negotiation' },
  { key: 'value',       headers: ['Value', 'Deal Value', 'Amount', 'Contract Value', 'ARR'],               required: true,  type: 'number', description: 'Deal value in ZAR',              example: '12500000' },
  { key: 'probability', headers: ['Probability', 'Prob', 'Win Probability', 'Prob %', 'Probability %'],   required: true,  type: 'number', description: 'Win probability 0-100',          example: '75' },
  { key: 'sector',      headers: ['Sector', 'Industry', 'Vertical'],                                      required: false, type: 'string', description: 'Client sector / industry',       example: 'Retail' },
  { key: 'closeDate',   headers: ['Close Date', 'Expected Close', 'Target Close', 'Close'],               required: false, type: 'date',   description: 'Expected close date',           example: '2025-06-30' },
  { key: 'owner',       headers: ['Owner', 'BD Rep', 'Account Manager', 'AE'],                            required: false, type: 'string', description: 'Deal owner name',               example: 'Sipho Nkosi' },
  { key: 'daysInStage', headers: ['Days in Stage', 'Days in Current Stage', 'Stage Age'],                required: false, type: 'number', description: 'Days deal has been in stage',   example: '14' },
]

// ─── Sales Performance columns ────────────────────────────────────────────────

export const SALES_COLUMNS: ColSpec[] = [
  { key: 'rep',        headers: ['Rep', 'Sales Rep', 'Name', 'Salesperson', 'AE'],                          required: true,  type: 'string', description: 'Sales rep full name',          example: 'Thabo Mokoena' },
  { key: 'target',     headers: ['Target', 'Monthly Target', 'MTD Target', 'Revenue Target'],               required: true,  type: 'number', description: 'Full-month revenue target ZAR', example: '1500000' },
  { key: 'actual',     headers: ['Actual', 'MTD Actual', 'Revenue MTD', 'Achieved', 'Closed'],              required: true,  type: 'number', description: 'Month-to-date revenue ZAR',    example: '1234000' },
  { key: 'region',     headers: ['Region', 'Territory', 'Area'],                                            required: false, type: 'string', description: 'Sales territory / region',     example: 'Gauteng' },
  { key: 'ytdActual',  headers: ['YTD Actual', 'YTD Revenue', 'Year-to-Date'],                             required: false, type: 'number', description: 'Year-to-date revenue ZAR',     example: '7800000' },
  { key: 'dealsWon',   headers: ['Deals Won', 'Wins', 'Closed Won Count', 'Won Deals'],                    required: false, type: 'number', description: 'Number of deals won MTD',      example: '3' },
  { key: 'dealsTotal', headers: ['Deals Total', 'Total Deals', 'Deals Worked', 'Opportunities'],           required: false, type: 'number', description: 'Total deals worked MTD',       example: '8' },
  { key: 'winRate',    headers: ['Win Rate', 'Win %', 'Win Rate %', 'Close Rate'],                         required: false, type: 'number', description: 'Win rate 0-100 (derived if absent)', example: '37.5' },
]

// ─── Financial Health columns ─────────────────────────────────────────────────

export const FINANCE_COLUMNS: ColSpec[] = [
  { key: 'metric',  headers: ['Metric', 'KPI', 'Measure', 'Financial Metric'],          required: true,  type: 'string', description: 'Metric name (see standard list)',  example: 'Cash Balance' },
  { key: 'value',   headers: ['Value', 'Amount', 'Current', 'Actual'],                  required: true,  type: 'number', description: 'Current value',                   example: '91200000' },
  { key: 'target',  headers: ['Target', 'Budget', 'Plan'],                               required: false, type: 'number', description: 'Target / budget value',           example: '95000000' },
  { key: 'unit',    headers: ['Unit', 'Units', 'Format', 'Type'],                        required: false, type: 'string', description: 'ZAR | days | pct',               example: 'ZAR' },
]

// Standard metric names for Finance sheet (flexible matching)
export const FINANCE_METRIC_ALIASES: Record<string, string[]> = {
  cashBalance:    ['Cash Balance', 'Cash', 'Cash on Hand', 'Bank Balance', 'Closing Balance'],
  dso:            ['DSO', 'Days Sales Outstanding', 'Debtor Days', 'Debtors Days'],
  overdueAR:      ['Overdue AR', 'Overdue Accounts Receivable', 'Overdue Debtors', 'Aged Debtors', 'Overdue Receivables'],
  revenueMTD:     ['Revenue MTD', 'Monthly Revenue', 'Revenue Month', 'Income MTD', 'Revenue to Date'],
  revenueTarget:  ['Revenue Target', 'Monthly Target', 'Revenue Budget', 'Monthly Budget'],
  grossMarginPct: ['Gross Margin', 'Gross Margin %', 'GM%', 'Margin %', 'Gross Profit %'],
  cashRunwayDays: ['Cash Runway', 'Runway Days', 'Months Runway', 'Cash Months'],
}

// ─── Operations Tracking columns ──────────────────────────────────────────────

export const OPERATIONS_COLUMNS: ColSpec[] = [
  { key: 'region',      headers: ['Region', 'Province', 'Area', 'Territory'],                              required: true,  type: 'string', description: 'Province / region name',        example: 'Gauteng' },
  { key: 'activations', headers: ['Activations', 'MTD Activations', 'Activations MTD', 'Events', 'Jobs'], required: true,  type: 'number', description: 'Activations completed MTD',     example: '284' },
  { key: 'ambassadors', headers: ['Ambassadors', 'Brand Ambassadors', 'Staff', 'Headcount', 'BA Count'],  required: true,  type: 'number', description: 'Ambassador headcount',          example: '312' },
  { key: 'successRate', headers: ['Success Rate', 'Success %', 'Completion Rate', 'Completion %'],        required: true,  type: 'number', description: 'Activation success rate 0-100', example: '94.5' },
  { key: 'noShowRate',  headers: ['No Show Rate', 'No-Show Rate', 'No Show %', 'Absence Rate'],           required: false, type: 'number', description: 'No-show rate 0-100',            example: '5.2' },
]

// ─── Client Health columns ────────────────────────────────────────────────────

export const CLIENT_COLUMNS: ColSpec[] = [
  { key: 'name',          headers: ['Client', 'Client Name', 'Account', 'Company'],                      required: true,  type: 'string', description: 'Client name',                  example: 'Standard Bank' },
  { key: 'nps',           headers: ['NPS', 'Net Promoter Score', 'Client NPS', 'Score'],                 required: true,  type: 'number', description: 'NPS -100 to 100',              example: '42' },
  { key: 'arr',           headers: ['ARR', 'Annual Revenue', 'Contract Value', 'Annual Contract Value'], required: true,  type: 'number', description: 'Annual recurring revenue ZAR',  example: '18500000' },
  { key: 'churnRisk',     headers: ['Churn Risk', 'Risk', 'Risk Level', 'Churn', 'Risk Status'],         required: true,  type: 'rag',    description: 'red | amber | green | low | medium | high', example: 'amber' },
  { key: 'daysToRenewal', headers: ['Days to Renewal', 'Renewal Days', 'Days Remaining', 'Days to Expiry'], required: true, type: 'number', description: 'Days until contract renewal', example: '47' },
  { key: 'trend',         headers: ['Trend', 'Relationship Trend', 'Direction', 'Status Trend'],         required: true,  type: 'trend',  description: 'improving | stable | declining', example: 'stable' },
  { key: 'sector',        headers: ['Sector', 'Industry', 'Vertical'],                                   required: false, type: 'string', description: 'Client industry sector',        example: 'Financial Services' },
  { key: 'lastContact',   headers: ['Last Contact', 'Last Touch', 'Last Meeting', 'Last Activity'],      required: false, type: 'date',   description: 'Date of last CEO/exec contact', example: '2025-04-12' },
]

// ─── People & Capacity columns ────────────────────────────────────────────────

export const PEOPLE_COLUMNS: ColSpec[] = [
  { key: 'metric',  headers: ['Metric', 'KPI', 'Measure', 'People Metric'],   required: true,  type: 'string', description: 'People metric name (see standard list)', example: 'Active Ambassadors' },
  { key: 'value',   headers: ['Value', 'Count', 'Current', 'Actual'],         required: true,  type: 'number', description: 'Current value',                         example: '4820' },
  { key: 'target',  headers: ['Target', 'Plan', 'Budget'],                    required: false, type: 'number', description: 'Target value',                          example: '5000' },
]

// Standard metric names for People sheet
export const PEOPLE_METRIC_ALIASES: Record<string, string[]> = {
  totalHeadcount: ['Total Headcount', 'Headcount', 'Total Staff', 'Total Employees', 'All Staff'],
  activeAmbassadors: ['Active Ambassadors', 'Active BAs', 'Active Brand Ambassadors', 'Deployed Ambassadors'],
  capacityUtil:   ['Capacity Utilisation', 'Capacity Utilization', 'Utilisation %', 'Utilization %', 'Capacity %'],
  attritionRate:  ['Attrition Rate', 'Attrition', 'Attrition %', 'Turnover Rate', 'Turnover %'],
  openRoles:      ['Open Roles', 'Open Vacancies', 'Vacancies', 'Open Positions', 'Open Headcount'],
}

// ─── Executive Alerts columns (optional) ─────────────────────────────────────

export const ALERT_COLUMNS: ColSpec[] = [
  { key: 'severity', headers: ['Severity', 'Level', 'Priority'],                             required: true,  type: 'string', description: 'critical | warning | info', example: 'critical' },
  { key: 'category', headers: ['Category', 'Module', 'Area', 'Type'],                        required: true,  type: 'string', description: 'Alert category / module',  example: 'Operations' },
  { key: 'title',    headers: ['Title', 'Alert', 'Alert Title', 'Headline'],                  required: true,  type: 'string', description: 'Short alert title',       example: 'Gauteng no-show rate critical' },
  { key: 'summary',  headers: ['Summary', 'Description', 'Details', 'Body', 'Message'],       required: true,  type: 'string', description: 'Full alert description',   example: 'No-show rate reached 9.2%...' },
  { key: 'date',     headers: ['Date', 'Created', 'Created At', 'Alert Date', 'Timestamp'],  required: false, type: 'date',   description: 'Alert date (defaults today)', example: '2025-05-10' },
]

// ─── Decision Queue columns (optional) ───────────────────────────────────────

export const DECISION_COLUMNS: ColSpec[] = [
  { key: 'title',          headers: ['Title', 'Decision', 'Topic', 'Item'],                              required: true,  type: 'string', description: 'Short decision title',       example: 'Approve Q3 headcount plan' },
  { key: 'context',        headers: ['Context', 'Description', 'Details', 'Background', 'Notes'],       required: true,  type: 'string', description: 'Full context / rationale',   example: 'August capacity gap of 340 ambassadors...' },
  { key: 'priority',       headers: ['Priority', 'Urgency', 'Level'],                                   required: true,  type: 'string', description: 'urgent | high | normal',     example: 'urgent' },
  { key: 'deadline',       headers: ['Deadline', 'Due Date', 'Due', 'By Date'],                         required: false, type: 'date',   description: 'Decision deadline',          example: '2025-05-20' },
  { key: 'financialStake', headers: ['Financial Stake', 'Financial Impact', 'Value at Stake', 'Risk'], required: false, type: 'string', description: 'Financial consequence',      example: 'R12M ARR at risk' },
  { key: 'module',         headers: ['Module', 'Area', 'Department', 'Category'],                       required: false, type: 'string', description: 'Dashboard module',           example: 'people' },
]

// ─── Forward View columns (optional) ─────────────────────────────────────────

export const SCENARIO_COLUMNS: ColSpec[] = [
  { key: 'label',       headers: ['Label', 'Scenario', 'Name', 'Scenario Name'],          required: true,  type: 'string', description: 'Scenario label',          example: 'Base' },
  { key: 'q1',          headers: ['Q1', 'Q1 Revenue', 'H1 Q1'],                           required: true,  type: 'number', description: 'Q1 revenue ZAR',          example: '160000000' },
  { key: 'q2',          headers: ['Q2', 'Q2 Revenue', 'H1 Q2'],                           required: true,  type: 'number', description: 'Q2 revenue ZAR',          example: '165000000' },
  { key: 'q3',          headers: ['Q3', 'Q3 Revenue', 'H2 Q3'],                           required: true,  type: 'number', description: 'Q3 revenue ZAR',          example: '162000000' },
  { key: 'q4',          headers: ['Q4', 'Q4 Revenue', 'H2 Q4'],                           required: true,  type: 'number', description: 'Q4 revenue ZAR',          example: '153000000' },
  { key: 'fullYear',    headers: ['Full Year', 'Annual', 'FY', 'Total'],                  required: false, type: 'number', description: 'Full-year total (derived if absent)', example: '640000000' },
  { key: 'probability', headers: ['Probability', 'Prob', 'Likelihood', 'Prob %'],         required: true,  type: 'number', description: 'Scenario probability 0-100', example: '55' },
  { key: 'color',       headers: ['Color', 'Colour', 'Hex'],                              required: false, type: 'string', description: 'CSS color (optional)',     example: '#e8640c' },
]

// ─── Registry ─────────────────────────────────────────────────────────────────

export const SHEET_COLUMN_MAP: Record<SheetName, ColSpec[]> = {
  [SHEET_NAMES.BD]:         BD_COLUMNS,
  [SHEET_NAMES.SALES]:      SALES_COLUMNS,
  [SHEET_NAMES.FINANCE]:    FINANCE_COLUMNS,
  [SHEET_NAMES.OPERATIONS]: OPERATIONS_COLUMNS,
  [SHEET_NAMES.CLIENTS]:    CLIENT_COLUMNS,
  [SHEET_NAMES.PEOPLE]:     PEOPLE_COLUMNS,
  [SHEET_NAMES.ALERTS]:     ALERT_COLUMNS,
  [SHEET_NAMES.DECISIONS]:  DECISION_COLUMNS,
  [SHEET_NAMES.SCENARIOS]:  SCENARIO_COLUMNS,
}

/** Human-readable labels for sheets */
export const SHEET_LABELS: Record<SheetName, string> = {
  [SHEET_NAMES.BD]:         'BD Pipeline',
  [SHEET_NAMES.SALES]:      'Sales Performance',
  [SHEET_NAMES.FINANCE]:    'Financial Health',
  [SHEET_NAMES.OPERATIONS]: 'Operations Tracking',
  [SHEET_NAMES.CLIENTS]:    'Client Health',
  [SHEET_NAMES.PEOPLE]:     'People & Capacity',
  [SHEET_NAMES.ALERTS]:     'Executive Alerts (optional)',
  [SHEET_NAMES.DECISIONS]:  'Decision Queue (optional)',
  [SHEET_NAMES.SCENARIOS]:  'Forward View (optional)',
}
