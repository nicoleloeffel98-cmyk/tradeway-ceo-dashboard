export type NavGroup = 'core' | 'towers' | 'intelligence'

export interface NavItem {
  id:          string
  label:       string
  href:        string
  icon:        string
  description: string
  group:       NavGroup
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'home',       label: 'CEO Home',    href: '/',           icon: 'LayoutDashboard', description: 'Executive overview',         group: 'core' },
  { id: 'alerts',     label: 'Alerts',      href: '/alerts',     icon: 'Bell',            description: 'All executive alerts',       group: 'core' },
  { id: 'bd',         label: 'Business Dev',href: '/bd',         icon: 'Target',          description: 'Pipeline & opportunities',   group: 'towers' },
  { id: 'sales',      label: 'Sales',       href: '/sales',      icon: 'TrendingUp',      description: 'Revenue & forecast',         group: 'towers' },
  { id: 'finance',    label: 'Finance',     href: '/finance',    icon: 'Landmark',        description: 'Financial indicators',       group: 'towers' },
  { id: 'operations', label: 'Operations',  href: '/operations', icon: 'Activity',        description: 'Activations & ambassadors',  group: 'towers' },
  { id: 'people',     label: 'People',      href: '/people',     icon: 'Users',           description: 'Capacity & headcount',       group: 'towers' },
  { id: 'campaigns',  label: 'Campaigns',   href: '/campaigns',  icon: 'Megaphone',       description: 'ROI & performance',          group: 'towers' },
  { id: 'strategic',  label: 'Strategic',   href: '/strategic',  icon: 'Compass',         description: 'Forecasts & intelligence',   group: 'intelligence' },
  { id: 'scorecard',  label: 'Scorecard',   href: '/scorecard',  icon: 'ClipboardCheck',  description: 'Executive scorecard',        group: 'intelligence' },
]

export const NAV_GROUPS: { key: NavGroup; label: string }[] = [
  { key: 'core',         label: 'Core Executive' },
  { key: 'towers',       label: 'Control Towers' },
  { key: 'intelligence', label: 'Intelligence' },
]
