import { cn } from '@/lib/utils'
import { InboxIcon } from 'lucide-react'

interface EmptyStateProps {
  title?:     string
  message?:   string
  className?: string
}

export function EmptyState({
  title   = 'No data',
  message = 'Nothing to display for the selected period.',
  className,
}: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-2 py-12 text-center', className)}>
      <InboxIcon className="size-8 text-muted-foreground opacity-50" />
      <p className="text-sm font-medium text-muted-foreground">{title}</p>
      <p className="text-xs text-muted-foreground/60">{message}</p>
    </div>
  )
}
