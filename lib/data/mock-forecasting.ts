export interface ForecastPoint {
  month:       string
  base:        number
  upside:      number
  downside:    number
}

export interface BreakPoint {
  id:         string
  title:      string
  severity:   'critical' | 'warning'
  daysAway:   number
  impact:     string
  action:     string
}

export const mockForecastMonthly: ForecastPoint[] = [
  { month: 'May',  base: 52_100_000,  upside: 58_000_000,  downside: 44_000_000  },
  { month: 'Jun',  base: 58_400_000,  upside: 66_000_000,  downside: 48_000_000  },
  { month: 'Jul',  base: 54_200_000,  upside: 61_000_000,  downside: 44_000_000  },
  { month: 'Aug',  base: 52_600_000,  upside: 60_000_000,  downside: 41_000_000  },
  { month: 'Sep',  base: 55_600_000,  upside: 63_000_000,  downside: 43_000_000  },
  { month: 'Oct',  base: 55_200_000,  upside: 62_000_000,  downside: 44_000_000  },
  { month: 'Nov',  base: 70_200_000,  upside: 78_000_000,  downside: 58_000_000  },
  { month: 'Dec',  base: 55_000_000,  upside: 64_000_000,  downside: 44_000_000  },
]

export const mockBreakpoints: BreakPoint[] = [
  {
    id:       'bp-01',
    title:    'Cash reserve falls below R20M threshold',
    severity: 'warning',
    daysAway: 52,
    impact:   'Credit facility drawdown required — interest cost ~R180K/month',
    action:   'Accelerate AR collections: top 3 accounts = R3.1M recoverable',
  },
  {
    id:       'bp-02',
    title:    'Q3 ambassador capacity gap — 340 short',
    severity: 'warning',
    daysAway: 78,
    impact:   'Aug campaign delivery at risk — potential R8M revenue deferral',
    action:   'Approve Q3 headcount plan by 14 May',
  },
  {
    id:       'bp-03',
    title:    'Tiger Brands renewal window opens',
    severity: 'warning',
    daysAway: 85,
    impact:   'R28M ARR at risk if not renewed — churn risk currently amber',
    action:   'Schedule CEO-level review before end of Q2',
  },
]

export const mockForecastSummary = {
  fullYearBase:       640_000_000,
  fullYearUpside:     710_000_000,
  fullYearDownside:   580_000_000,
  ytdActual:          194_600_000,
  ytdTarget:          202_000_000,
  cashRunwayDays:     52,
  breakpointCount:    3,
}
