export function formatZAR(value: number): string {
  const abs = Math.abs(value)
  const sign = value < 0 ? '-' : ''
  if (abs >= 1_000_000_000) return `${sign}R${(abs / 1_000_000_000).toFixed(1)}B`
  if (abs >= 1_000_000) return `${sign}R${(abs / 1_000_000).toFixed(1)}M`
  if (abs >= 1_000) return `${sign}R${(abs / 1_000).toFixed(0)}K`
  return `${sign}R${abs.toLocaleString('en-ZA')}`
}

export function formatPct(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`
}

export function formatCount(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`
  return value.toLocaleString('en-ZA')
}

export function formatMultiplier(value: number): string {
  return `${value.toFixed(1)}x`
}

export function formatDays(value: number): string {
  return `${Math.round(value)}d`
}

export function formatScore(value: number): string {
  return value.toFixed(1)
}

export type KPIUnit = 'ZAR' | 'percentage' | 'count' | 'multiplier' | 'days' | 'score'

export function formatKPIValue(value: number, unit: KPIUnit): string {
  switch (unit) {
    case 'ZAR':        return formatZAR(value)
    case 'percentage': return formatPct(value)
    case 'count':      return formatCount(value)
    case 'multiplier': return formatMultiplier(value)
    case 'days':       return formatDays(value)
    case 'score':      return formatScore(value)
    default:           return String(value)
  }
}

export function formatVariance(value: number, unit: KPIUnit): string {
  const prefix = value >= 0 ? '+' : ''
  switch (unit) {
    case 'ZAR':        return `${prefix}${formatZAR(value)}`
    case 'percentage': return `${prefix}${formatPct(value)}`
    default:           return `${prefix}${value}`
  }
}
