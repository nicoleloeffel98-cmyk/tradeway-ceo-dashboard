/**
 * Import schemas — define expected column headers per domain.
 * All matching is case-insensitive and trims whitespace.
 */

export type DomainKey = 'finance' | 'sales' | 'bd' | 'operations' | 'clients' | 'people'

export interface ColumnDef {
  key:         string            // canonical key used internally
  headers:     string[]         // accepted header aliases (case-insensitive)
  required:    boolean
  type:        'number' | 'text' | 'percent'
  description: string
  example:     string
}

export interface DomainSchema {
  key:         DomainKey
  label:       string
  description: string
  rowMode:     'single' | 'multi'  // single = one summary row; multi = one row per entity
  entityLabel?: string             // e.g. "Region", "Client" for multi-row sheets
  columns:     ColumnDef[]
  sheetKeywords: string[]          // sheet name keywords for auto-detection
}

// ─── Finance ────────────────────────────────────────────────────────────────

export const FINANCE_SCHEMA: DomainSchema = {
  key: 'finance',
  label: 'Financial Health',
  description: 'Cash position, DSO, overdue AR, and margin metrics. One summary row.',
  rowMode: 'single',
  sheetKeywords: ['finance', 'financial', 'cash', 'ar', 'kpi'],
  columns: [
    { key: 'fin-cash',          headers: ['Cash Balance', 'Cash', 'Cash Position', 'Bank Balance'],              required: true,  type: 'number',  description: 'Current cash balance (ZAR)',    example: '82500000'  },
    { key: 'fin-dso',           headers: ['DSO', 'DSO Days', 'Days Sales Outstanding', 'Days Outstanding'],      required: true,  type: 'number',  description: 'Days Sales Outstanding',        example: '51'        },
    { key: 'fin-overdue-ar',    headers: ['Overdue AR', 'AR Overdue', 'Overdue Receivables', 'Past Due AR'],     required: true,  type: 'number',  description: 'Overdue AR balance (ZAR)',      example: '4200000'   },
    { key: 'fin-ebitda-margin', headers: ['EBITDA Margin', 'EBITDA %', 'EBITDA Margin %', 'Margin %'],          required: false, type: 'percent', description: 'EBITDA margin (%)',            example: '22.4'      },
    { key: 'fin-gross-margin',  headers: ['Gross Margin', 'Gross Margin %', 'GM %'],                            required: false, type: 'percent', description: 'Gross margin (%)',             example: '38.5'      },
    { key: 'fin-revenue-ytd',   headers: ['Revenue YTD', 'YTD Revenue', 'Year to Date Revenue'],                required: false, type: 'number',  description: 'Revenue year to date (ZAR)',   example: '194600000' },
  ],
}

// ─── Sales ──────────────────────────────────────────────────────────────────

export const SALES_SCHEMA: DomainSchema = {
  key: 'sales',
  label: 'Sales',
  description: 'MTD revenue, close rate, and forecast. One summary row.',
  rowMode: 'single',
  sheetKeywords: ['sales', 'revenue', 'forecast'],
  columns: [
    { key: 'sales-revenue-mtd', headers: ['Revenue MTD', 'MTD Revenue', 'Revenue This Month', 'Sales MTD'],       required: true,  type: 'number',  description: 'Revenue month-to-date (ZAR)',  example: '48200000' },
    { key: 'sales-revenue-ytd', headers: ['Revenue YTD', 'YTD Revenue', 'Year to Date Revenue'],                  required: false, type: 'number',  description: 'Revenue year-to-date (ZAR)',  example: '194600000' },
    { key: 'sales-win-rate',    headers: ['Close Rate', 'Win Rate', 'Close Rate %', 'Win Rate %', 'Conversion'],  required: true,  type: 'percent', description: 'Deal close / win rate (%)',    example: '41' },
    { key: 'sales-forecast',    headers: ['Forecast', 'May Forecast', 'Monthly Forecast', 'Revenue Forecast'],    required: false, type: 'number',  description: 'Month revenue forecast (ZAR)', example: '52100000' },
    { key: 'sales-new-clients', headers: ['New Clients', 'New Clients MTD', 'New Accounts MTD'],                  required: false, type: 'number',  description: 'New clients signed MTD',       example: '2' },
    { key: 'sales-avg-deal',    headers: ['Avg Deal Size', 'Average Deal', 'Deal Size', 'Avg Deal Value'],        required: false, type: 'number',  description: 'Average deal value (ZAR)',     example: '5916666' },
  ],
}

// ─── Business Development ───────────────────────────────────────────────────

export const BD_SCHEMA: DomainSchema = {
  key: 'bd',
  label: 'Business Development',
  description: 'Pipeline health and win rate. One summary row.',
  rowMode: 'single',
  sheetKeywords: ['bd', 'business dev', 'pipeline', 'bizdev'],
  columns: [
    { key: 'bd-total-pipeline',    headers: ['Total Pipeline', 'Pipeline Total', 'Pipeline Value'],                       required: true,  type: 'number',  description: 'Total pipeline value (ZAR)',        example: '142000000' },
    { key: 'bd-win-rate',          headers: ['Win Rate', 'Win Rate %', 'BD Win Rate', 'Conversion Rate'],                 required: true,  type: 'percent', description: 'Win rate (%)',                      example: '41' },
    { key: 'bd-weighted-pipeline', headers: ['Weighted Pipeline', 'Pipeline Weighted', 'Prob-Adjusted Pipeline'],         required: false, type: 'number',  description: 'Probability-weighted pipeline (ZAR)', example: '63900000' },
    { key: 'bd-avg-deal-size',     headers: ['Avg Deal Size', 'Average Deal Size', 'Deal Size'],                          required: false, type: 'number',  description: 'Average deal size (ZAR)',           example: '5916666' },
    { key: 'bd-new-opps-mtd',      headers: ['New Opps MTD', 'New Opportunities MTD', 'New Opps', 'New Opportunities'],  required: false, type: 'number',  description: 'New opportunities this month',      example: '6' },
    { key: 'bd-open-opportunities',headers: ['Open Opportunities', 'Open Opps', 'Active Opportunities'],                 required: false, type: 'number',  description: 'Total open opportunities',          example: '24' },
  ],
}

// ─── Operations ─────────────────────────────────────────────────────────────

export const OPERATIONS_SCHEMA: DomainSchema = {
  key: 'operations',
  label: 'Operations',
  description: 'One row per region with activation metrics. Region column required.',
  rowMode: 'multi',
  entityLabel: 'Region',
  sheetKeywords: ['operations', 'ops', 'activation', 'regional', 'ambassador'],
  columns: [
    { key: 'region',       headers: ['Region', 'Province', 'Area', 'Location'],                                       required: true,  type: 'text',    description: 'Region name',                   example: 'Gauteng' },
    { key: 'activations',  headers: ['Activations', 'Activation Count', 'Total Activations', 'Acts'],                 required: true,  type: 'number',  description: 'Activation count',              example: '5420' },
    { key: 'successRate',  headers: ['Success Rate', 'Success Rate %', 'Success %', 'Completion Rate'],               required: true,  type: 'percent', description: 'Activation success rate (%)',   example: '95.1' },
    { key: 'ambassadors',  headers: ['Ambassadors', 'Ambassador Count', 'Brand Ambassadors', 'BA Count'],              required: false, type: 'number',  description: 'Active ambassadors',            example: '4800' },
    { key: 'noShowRate',   headers: ['No Show Rate', 'No-Show Rate', 'No Show %', 'No-Show %', 'Absent Rate'],        required: false, type: 'percent', description: 'Ambassador no-show rate (%)',   example: '8.2' },
  ],
}

// ─── Client Health ──────────────────────────────────────────────────────────

export const CLIENTS_SCHEMA: DomainSchema = {
  key: 'clients',
  label: 'Client Health',
  description: 'One row per client with NPS, ARR, and churn risk.',
  rowMode: 'multi',
  entityLabel: 'Client',
  sheetKeywords: ['client', 'clients', 'account', 'nps', 'churn'],
  columns: [
    { key: 'name',          headers: ['Client', 'Client Name', 'Account', 'Account Name', 'Company'],      required: true,  type: 'text',    description: 'Client name',                   example: 'Shoprite' },
    { key: 'nps',           headers: ['NPS', 'NPS Score', 'Net Promoter', 'Net Promoter Score'],            required: true,  type: 'number',  description: 'NPS score (0–10)',              example: '8.4' },
    { key: 'arr',           headers: ['ARR', 'Contract Value', 'Revenue', 'Annual Value', 'ARR (ZAR)'],    required: true,  type: 'number',  description: 'Annual contract value (ZAR)',   example: '52000000' },
    { key: 'churnRisk',     headers: ['Churn Risk', 'Risk', 'Risk Level', 'Churn Level', 'Status'],        required: true,  type: 'text',    description: 'Risk level: Low/Medium/High',  example: 'Low' },
    { key: 'daysToRenewal', headers: ['Days to Renewal', 'Renewal Days', 'Days Remaining', 'Renewal In'], required: false, type: 'number',  description: 'Days until contract renewal',  example: '131' },
    { key: 'trend',         headers: ['Trend', 'Direction', 'Client Trend'],                               required: false, type: 'text',    description: 'Improving / Stable / Declining', example: 'Stable' },
  ],
}

// ─── People & Capacity ──────────────────────────────────────────────────────

export const PEOPLE_SCHEMA: DomainSchema = {
  key: 'people',
  label: 'People & Capacity',
  description: 'Headcount, utilisation, and attrition metrics. One summary row.',
  rowMode: 'single',
  sheetKeywords: ['people', 'hr', 'capacity', 'headcount', 'attrition'],
  columns: [
    { key: 'ppl-capacity-util', headers: ['Capacity Utilisation', 'Capacity Util', 'Utilisation %', 'Utilization %', 'Util %'], required: true,  type: 'percent', description: 'Ambassador capacity utilisation (%)', example: '82' },
    { key: 'ppl-attrition',     headers: ['Attrition', 'Attrition Rate', 'Attrition %', 'Turnover', 'Turnover Rate'],          required: true,  type: 'percent', description: 'Attrition / turnover rate (%)',       example: '14.2' },
    { key: 'ppl-open-roles',    headers: ['Open Roles', 'Vacancies', 'Open Positions', 'Open Vacancies'],                      required: false, type: 'number',  description: 'Number of open roles',               example: '7' },
    { key: 'ppl-ambassador-pool',headers: ['Ambassador Pool', 'Pool Size', 'Total Ambassadors', 'Ambassador Count'],           required: false, type: 'number',  description: 'Total ambassador pool size',          example: '12400' },
  ],
}

// ─── Registry ───────────────────────────────────────────────────────────────

export const DOMAIN_SCHEMAS: Record<DomainKey, DomainSchema> = {
  finance:    FINANCE_SCHEMA,
  sales:      SALES_SCHEMA,
  bd:         BD_SCHEMA,
  operations: OPERATIONS_SCHEMA,
  clients:    CLIENTS_SCHEMA,
  people:     PEOPLE_SCHEMA,
}

export const DOMAIN_LABELS: Record<DomainKey, string> = {
  finance:    'Financial Health',
  sales:      'Sales',
  bd:         'Business Development',
  operations: 'Operations',
  clients:    'Client Health',
  people:     'People & Capacity',
}

/**
 * Auto-detect a domain from a sheet name.
 * Returns the best match or null.
 */
export function autoDetectDomain(sheetName: string): DomainKey | null {
  const lower = sheetName.toLowerCase()
  for (const schema of Object.values(DOMAIN_SCHEMAS)) {
    if (schema.sheetKeywords.some((kw) => lower.includes(kw))) {
      return schema.key
    }
  }
  return null
}
