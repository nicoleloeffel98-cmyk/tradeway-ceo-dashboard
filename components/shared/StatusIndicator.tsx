import { cn } from '@/lib/utils'
import { RAG_COLORS } from '@/lib/utils/rag'
import type { RAGStatus } from '@/lib/types'

interface StatusIndicatorProps {
  status:    RAGStatus
  size?:     'sm' | 'md' | 'lg'
  pulse?:    boolean
  className?: string
}

const SIZE = { sm: 'size-2', md: 'size-2.5', lg: 'size-3' }

export function StatusIndicator({ status, size = 'md', pulse = false, className }: StatusIndicatorProps) {
  return (
    <span className={cn('relative inline-flex', SIZE[size], className)}>
      {pulse && status !== 'neutral' && (
        <span
          className="absolute inline-flex size-full animate-ping rounded-full opacity-50"
          style={{ backgroundColor: RAG_COLORS[status] }}
        />
      )}
      <span
        className="relative inline-flex size-full rounded-full"
        style={{ backgroundColor: RAG_COLORS[status] }}
      />
    </span>
  )
}
