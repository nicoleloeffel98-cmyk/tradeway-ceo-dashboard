import { StatusIndicator } from '@/components/shared/StatusIndicator'
import { cn } from '@/lib/utils'
import type { RAGStatus } from '@/lib/types'

interface SectionHeaderProps {
  title:       string
  subtitle?:   string
  status?:     RAGStatus
  lastUpdated?: string
  action?:     React.ReactNode
  className?:  string
}

export function SectionHeader({ title, subtitle, status, lastUpdated, action, className }: SectionHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between gap-4', className)}>
      <div className="flex items-center gap-2.5">
        {status && <StatusIndicator status={status} size="md" pulse={status === 'red'} />}
        <div>
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      <div className="flex items-center gap-3">
        {lastUpdated && (
          <span className="hidden text-[10px] text-muted-foreground/60 sm:block">
            Updated {lastUpdated}
          </span>
        )}
        {action}
      </div>
    </div>
  )
}
