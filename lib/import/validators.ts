/**
 * Validators — check that parsed rows meet schema requirements before import.
 */
import { DOMAIN_SCHEMAS, type DomainKey } from './schemas'

export interface ColumnValidation {
  key:       string
  label:     string
  required:  boolean
  found:     boolean
  matchedAs: string | null  // which alias was matched
}

export interface SheetValidation {
  domain:      DomainKey
  sheetName:   string
  rowCount:    number
  columns:     ColumnValidation[]
  missingRequired: string[]
  warnings:    string[]
  isValid:     boolean
}

type RawRow = Record<string, unknown>

function findHeader(row: RawRow, aliases: string[]): string | null {
  const keys = Object.keys(row)
  for (const alias of aliases) {
    const lower = alias.toLowerCase()
    const match = keys.find((k) => k.trim().toLowerCase() === lower)
    if (match) return alias
  }
  return null
}

export function validateSheet(
  sheetName: string,
  domain: DomainKey,
  rows: RawRow[],
): SheetValidation {
  const schema = DOMAIN_SCHEMAS[domain]
  const sampleRow = rows[0] ?? {}
  const warnings: string[] = []

  const columns: ColumnValidation[] = schema.columns.map((col) => {
    const matchedAs = findHeader(sampleRow, col.headers)
    return {
      key:       col.key,
      label:     col.headers[0],
      required:  col.required,
      found:     matchedAs !== null,
      matchedAs,
    }
  })

  const missingRequired = columns
    .filter((c) => c.required && !c.found)
    .map((c) => c.label)

  const missingOptional = columns
    .filter((c) => !c.required && !c.found)
    .map((c) => c.label)

  if (missingOptional.length > 0) {
    warnings.push(`Optional columns not found: ${missingOptional.join(', ')} — these fields will keep their current values.`)
  }

  if (schema.rowMode === 'multi' && rows.length === 0) {
    warnings.push('Sheet appears to have no data rows.')
  }
  if (schema.rowMode === 'single' && rows.length > 1) {
    warnings.push(`${rows.length} data rows found — only the first row will be used for KPI values.`)
  }

  return {
    domain,
    sheetName,
    rowCount:        rows.length,
    columns,
    missingRequired,
    warnings,
    isValid:         missingRequired.length === 0,
  }
}

/**
 * Produce a human-readable summary of what a validated sheet will update.
 */
export function importSummaryLine(v: SheetValidation): string {
  const schema = DOMAIN_SCHEMAS[v.domain]
  const found  = v.columns.filter((c) => c.found).length
  const total  = v.columns.length
  if (schema.rowMode === 'multi') {
    return `${v.rowCount} ${schema.entityLabel?.toLowerCase() ?? 'row'}(s) · ${found}/${total} columns matched`
  }
  return `${found}/${total} KPIs will be updated`
}
