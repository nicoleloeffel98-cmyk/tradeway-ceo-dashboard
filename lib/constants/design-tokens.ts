export const BRAND = {
  navy:        '#1a2f5a',
  navyLight:   '#243f7a',
  orange:      '#e8640c',
  orangeLight: '#f07830',
} as const

export const STATUS = {
  green:   '#16a34a',
  amber:   '#d97706',
  red:     '#dc2626',
  neutral: '#64748b',
} as const

export const CHART_COLORS = [
  '#e8640c', // brand orange — primary series
  '#3b82f6', // blue
  '#10b981', // emerald
  '#f59e0b', // amber
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#14b8a6', // teal
  '#f97316', // orange-500
] as const

export const SURFACE = {
  bg:      'oklch(0.11 0.018 260)',
  card:    'oklch(0.16 0.018 260)',
  elevated:'oklch(0.20 0.018 260)',
  border:  'oklch(0.28 0.018 260)',
  muted:   'oklch(0.56 0.012 260)',
} as const

export const CHART_THEME = {
  gridColor:    'rgba(255,255,255,0.06)',
  axisColor:    '#64748b',
  tooltipBg:    '#1e293b',
  tooltipBorder:'#334155',
  fontFamily:   'var(--font-geist-sans)',
  fontSize:     12,
} as const
