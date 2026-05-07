import type { NormalisedFinanceData } from './types'

export interface ValidationResult {
  valid:    boolean
  warnings: string[]
  errors:   string[]
}

export function validateFinanceData(data: NormalisedFinanceData): ValidationResult {
  const warnings: string[] = []
  const errors:   string[] = []

  if (data.revenueYTD <= 0) errors.push('revenueYTD must be positive')
  if (data.ebitdaMargin < 0 || data.ebitdaMargin > 100) errors.push('ebitdaMargin out of range (0–100)')
  if (data.grossMargin < 0 || data.grossMargin > 100) errors.push('grossMargin out of range (0–100)')
  if (data.dso < 0) errors.push('dso cannot be negative')
  if (data.cashOnHand < 0) warnings.push('cashOnHand is negative — cash position critical')
  if (data.overdueAR < 0) errors.push('overdueAR cannot be negative')

  if (!data.cashFlow || data.cashFlow.length === 0) warnings.push('cashFlow series is empty')
  if (!data.arBuckets || data.arBuckets.length === 0) warnings.push('arBuckets data is missing')
  if (!data.revenueVsBudget || data.revenueVsBudget.length === 0) warnings.push('revenueVsBudget series is empty')

  if (data.cashFlow.some((p) => isNaN(p.inflow) || isNaN(p.outflow))) {
    warnings.push('Some cashFlow entries contain NaN values — chart may render incorrectly')
  }

  if (data.overdueAR > data.revenueYTD * 0.5) {
    warnings.push('overdueAR exceeds 50% of YTD revenue — data may be incorrect')
  }

  return { valid: errors.length === 0, warnings, errors }
}
