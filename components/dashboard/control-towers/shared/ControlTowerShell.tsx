import { SectionHeader } from '@/components/dashboard/shared/SectionHeader'
import { AIInsightBanner } from '@/components/dashboard/shared/AIInsightBanner'
import { PeriodBar } from '@/components/dashboard/shared/PeriodBar'
import type { RAGStatus } from '@/lib/types'

interface ControlTowerShellProps {
  title:        string
  subtitle?:    string
  status:       RAGStatus
  insight:      { headline: string; detail?: string; source?: string; confidence?: 'high' | 'medium' | 'low' }
  children:     React.ReactNode
  lastUpdated?: string
  scope?:       string
}

export function ControlTowerShell({
  title,
  subtitle,
  status,
  insight,
  children,
  scope,
}: ControlTowerShellProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <SectionHeader
          title={title}
          subtitle={subtitle}
          status={status}
        />
        <AIInsightBanner
          headline={insight.headline}
          detail={insight.detail}
          source={insight.source}
          confidence={insight.confidence}
        />
      </div>

      <PeriodBar scope={scope} />

      {children}
    </div>
  )
}
